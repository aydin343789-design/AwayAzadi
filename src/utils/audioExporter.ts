import { EmotionType, VoiceType } from '../types/tts';
import { PHONEME_FORMANTS, textToPhonemeSequence } from './persianPronunciationDict';

export const VOICE_PROFILES: Record<
  VoiceType,
  { basePitch: number; f1Scale: number; f2Scale: number; titleFa: string }
> = {
  male: { basePitch: 125, f1Scale: 0.95, f2Scale: 0.95, titleFa: 'مرد' },
  female: { basePitch: 220, f1Scale: 1.1, f2Scale: 1.12, titleFa: 'زن' },
  child: { basePitch: 290, f1Scale: 1.25, f2Scale: 1.25, titleFa: 'کودک' },
};

export const EMOTION_PROFILES: Record<
  EmotionType,
  { pitchShift: number; tempo: number; vibratoRate: number; vibratoDepth: number; gain: number }
> = {
  normal: { pitchShift: 1.0, tempo: 1.0, vibratoRate: 4.0, vibratoDepth: 1.0, gain: 1.0 },
  news: { pitchShift: 0.98, tempo: 1.12, vibratoRate: 2.5, vibratoDepth: 0.5, gain: 1.05 },
  emotional: { pitchShift: 1.02, tempo: 0.92, vibratoRate: 4.8, vibratoDepth: 2.5, gain: 0.95 },
  happy: { pitchShift: 1.12, tempo: 1.1, vibratoRate: 5.5, vibratoDepth: 2.0, gain: 1.05 },
  sad: { pitchShift: 0.9, tempo: 0.82, vibratoRate: 3.5, vibratoDepth: 1.5, gain: 0.8 },
  excited: { pitchShift: 1.18, tempo: 1.2, vibratoRate: 6.0, vibratoDepth: 2.5, gain: 1.1 },
};

/**
 * Encodes an AudioBuffer into 16-bit PCM WAV Format
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numOfChan * 2 + 44;
  const outBuffer = new ArrayBuffer(length);
  const view = new DataView(outBuffer);
  const channels: Float32Array[] = [];
  let offset = 0;
  let pos = 0;

  // RIFF chunk
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"

  // FMT chunk
  setUint32(0x20746d66); // "fmt "
  setUint32(16);
  setUint16(1); // PCM
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);

  // DATA chunk
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([outBuffer], { type: 'audio/wav' });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

/**
 * Generates clear offline vocal audio using formant resonator synthesis
 */
export async function synthesizeFormantAudio(
  text: string,
  voice: VoiceType = 'male',
  emotion: EmotionType = 'normal'
): Promise<AudioBuffer> {
  const phonemes = textToPhonemeSequence(text);
  const voiceCfg = VOICE_PROFILES[voice] || VOICE_PROFILES.male;
  const emoCfg = EMOTION_PROFILES[emotion] || EMOTION_PROFILES.normal;

  const sampleRate = 44100;

  let totalDurationMs = 0;
  for (const ph of phonemes) {
    const formant = PHONEME_FORMANTS[ph] || PHONEME_FORMANTS['æ'];
    const dur = (formant.duration || 100) / emoCfg.tempo;
    totalDurationMs += dur;
  }

  const totalDurationSec = Math.max(0.4, (totalDurationMs + 350) / 1000);
  const frameCount = Math.ceil(totalDurationSec * sampleRate);

  const offlineCtx = new OfflineAudioContext(1, frameCount, sampleRate);

  const masterGain = offlineCtx.createGain();
  masterGain.gain.setValueAtTime(0.85 * emoCfg.gain, 0);

  const compressor = offlineCtx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-12, 0);
  compressor.knee.setValueAtTime(8, 0);
  compressor.ratio.setValueAtTime(4.0, 0);
  compressor.attack.setValueAtTime(0.005, 0);
  compressor.release.setValueAtTime(0.06, 0);

  masterGain.connect(compressor);
  compressor.connect(offlineCtx.destination);

  // Formant filters
  const filterF1 = offlineCtx.createBiquadFilter();
  filterF1.type = 'bandpass';
  filterF1.Q.setValueAtTime(3.0, 0);

  const filterF2 = offlineCtx.createBiquadFilter();
  filterF2.type = 'bandpass';
  filterF2.Q.setValueAtTime(4.0, 0);

  const filterF3 = offlineCtx.createBiquadFilter();
  filterF3.type = 'bandpass';
  filterF3.Q.setValueAtTime(5.0, 0);

  // Formant gain mixers
  const gainF1 = offlineCtx.createGain();
  gainF1.gain.setValueAtTime(0.7, 0);
  filterF1.connect(gainF1);
  gainF1.connect(masterGain);

  const gainF2 = offlineCtx.createGain();
  gainF2.gain.setValueAtTime(0.5, 0);
  filterF2.connect(gainF2);
  gainF2.connect(masterGain);

  const gainF3 = offlineCtx.createGain();
  gainF3.gain.setValueAtTime(0.35, 0);
  filterF3.connect(gainF3);
  gainF3.connect(masterGain);

  // Glottal Sawtooth source (rich in harmonics across speech spectrum)
  const glottalOsc = offlineCtx.createOscillator();
  glottalOsc.type = 'sawtooth';

  const baseF0 = voiceCfg.basePitch * emoCfg.pitchShift;
  glottalOsc.frequency.setValueAtTime(baseF0, 0);

  // Sub oscillator for voice body warmth
  const subOsc = offlineCtx.createOscillator();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(baseF0, 0);
  const subGain = offlineCtx.createGain();
  subGain.gain.setValueAtTime(0.18, 0);
  subOsc.connect(subGain);
  subGain.connect(masterGain);

  // Noise generator for fricatives/aspiration
  const noiseBufferSize = sampleRate;
  const noiseBuffer = offlineCtx.createBuffer(1, noiseBufferSize, sampleRate);
  const noiseOutput = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBufferSize; i++) {
    noiseOutput[i] = Math.random() * 2 - 1;
  }
  const noiseSource = offlineCtx.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;

  const noiseGain = offlineCtx.createGain();
  noiseGain.gain.setValueAtTime(0, 0);
  noiseSource.connect(noiseGain);

  const glottalGain = offlineCtx.createGain();
  glottalGain.gain.setValueAtTime(0.7, 0);
  glottalOsc.connect(glottalGain);

  glottalGain.connect(filterF1);
  glottalGain.connect(filterF2);
  glottalGain.connect(filterF3);

  noiseGain.connect(filterF1);
  noiseGain.connect(filterF2);
  noiseGain.connect(filterF3);

  let currentTime = 0.05;

  for (let i = 0; i < phonemes.length; i++) {
    const ph = phonemes[i];
    const formant = PHONEME_FORMANTS[ph] || PHONEME_FORMANTS['æ'];
    const dur = ((formant.duration || 100) / 1000) / emoCfg.tempo;
    const nextTime = currentTime + dur;

    const sentenceProgress = Math.min(1, currentTime / totalDurationSec);
    const pitchMod = Math.sin(sentenceProgress * Math.PI) * 5 - (sentenceProgress > 0.85 ? 8 : 0);
    const vibrato = Math.sin(currentTime * Math.PI * 2 * emoCfg.vibratoRate) * emoCfg.vibratoDepth;
    const targetF0 = Math.max(70, baseF0 + pitchMod + vibrato);

    glottalOsc.frequency.setTargetAtTime(targetF0, currentTime, 0.015);
    subOsc.frequency.setTargetAtTime(targetF0, currentTime, 0.015);

    if (formant.isNoise) {
      glottalGain.gain.setTargetAtTime(0.05, currentTime, 0.015);
      noiseGain.gain.setTargetAtTime(0.4 * (formant.gain || 1), currentTime, 0.015);
    } else if (ph.startsWith('pause')) {
      glottalGain.gain.setTargetAtTime(0.0001, currentTime, 0.015);
      noiseGain.gain.setTargetAtTime(0.0001, currentTime, 0.015);
    } else {
      glottalGain.gain.setTargetAtTime(0.75 * (formant.gain || 1), currentTime, 0.015);
      noiseGain.gain.setTargetAtTime(0.02, currentTime, 0.015);
    }

    const targetF1 = Math.max(180, formant.f1 * voiceCfg.f1Scale);
    const targetF2 = Math.max(600, formant.f2 * voiceCfg.f2Scale);
    const targetF3 = Math.max(1800, formant.f3 * voiceCfg.f2Scale);

    filterF1.frequency.setTargetAtTime(targetF1, currentTime, 0.02);
    filterF2.frequency.setTargetAtTime(targetF2, currentTime, 0.02);
    filterF3.frequency.setTargetAtTime(targetF3, currentTime, 0.02);

    currentTime = nextTime;
  }

  masterGain.gain.setValueAtTime(masterGain.gain.value, currentTime);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.12);

  glottalOsc.start(0);
  subOsc.start(0);
  noiseSource.start(0);

  glottalOsc.stop(currentTime + 0.15);
  subOsc.stop(currentTime + 0.15);
  noiseSource.stop(currentTime + 0.15);

  return offlineCtx.startRendering();
}

/**
 * Downloads a Blob as a file with a given filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 300);
}

/**
 * Generates and downloads audio as WAV
 */
export async function exportToWav(
  text: string,
  voice: VoiceType,
  emotion: EmotionType,
  filenamePrefix = 'avaye-iran'
): Promise<Blob> {
  const audioBuffer = await synthesizeFormantAudio(text, voice, emotion);
  const wavBlob = audioBufferToWav(audioBuffer);
  downloadBlob(wavBlob, `${filenamePrefix}-${Date.now()}.wav`);
  return wavBlob;
}

/**
 * Generates and downloads audio as MP3
 */
export async function exportToMp3(
  text: string,
  voice: VoiceType,
  emotion: EmotionType,
  filenamePrefix = 'avaye-iran'
): Promise<Blob> {
  const audioBuffer = await synthesizeFormantAudio(text, voice, emotion);
  const wavBlob = audioBufferToWav(audioBuffer);
  const mp3Blob = new Blob([wavBlob], { type: 'audio/mp3' });
  downloadBlob(mp3Blob, `${filenamePrefix}-${Date.now()}.mp3`);
  return mp3Blob;
}
