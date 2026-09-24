import { EmotionType, VoiceType } from '../types/tts';

export interface NeuralSpeechOptions {
  text: string;
  voice: VoiceType;
  emotion: EmotionType;
  rate?: number;
  pitch?: number;
}

/**
 * Synthesizes natural fluent Persian audio using Microsoft Persian Neural Voice
 * through the local server proxy.
 * - No VPN needed! Works directly in Iran and worldwide.
 * - 100% natural, accent-free standard Iranian Persian (دیلارا و فرید).
 * - Fast, free, and returns MP3 audio blob.
 */
export async function synthesizeNeuralSpeech(options: NeuralSpeechOptions): Promise<Blob> {
  const { text, voice, emotion, rate = 0, pitch = 0 } = options;
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('متنی برای تولید صدا وارد نشده است.');
  }

  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: trimmed,
      voice,
      emotion,
      rate,
      pitch,
    }),
  });

  if (!response.ok) {
    let errMessage = `خطای سرور صوتی (${response.status})`;
    try {
      const errJson = await response.json();
      if (errJson?.error) {
        errMessage = `${errJson.error}: ${errJson.details || ''}`;
      }
    } catch {
      // Ignore
    }
    throw new Error(errMessage);
  }

  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength < 50) {
    throw new Error('فایل صوتی دریافت شده نامعتبر است.');
  }

  return new Blob([arrayBuffer], { type: 'audio/mpeg' });
}
