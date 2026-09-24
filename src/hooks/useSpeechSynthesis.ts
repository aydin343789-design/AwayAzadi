import { useState, useEffect, useRef, useCallback } from 'react';
import { EmotionType, EngineType, HistoryItem, VoiceType, ElevenLabsVoice, OfflineEngineMode } from '../types/tts';
import { detectLanguage } from '../utils/languageDetector';
import {
  exportToWav,
  exportToMp3,
  VOICE_PROFILES,
  EMOTION_PROFILES,
  synthesizeFormantAudio,
  downloadBlob,
} from '../utils/audioExporter';
import {
  DEFAULT_ELEVENLABS_VOICES,
  fetchElevenLabsVoices,
  getVoiceIdForType,
  synthesizeWithElevenLabs,
} from '../services/elevenlabs';
import { globalAudioPlayer } from '../utils/audioBufferPlayer';
import { persianToPhoneticLatin } from '../utils/persianTransliteration';

const HISTORY_STORAGE_KEY = 'awa_tts_history_v2';
const ELEVENLABS_KEY_STORAGE = 'awa_elevenlabs_key';
const ELEVENLABS_VOICE_STORAGE = 'awa_elevenlabs_voice';
const ELEVENLABS_ENABLED_STORAGE = 'awa_elevenlabs_enabled';
const OFFLINE_ENGINE_STORAGE = 'awa_offline_engine';

export function useSpeechSynthesis() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [activeEngine, setActiveEngine] = useState<EngineType>('browser');
  const [offlineEngineMode, setOfflineEngineMode] = useState<OfflineEngineMode>('system');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ElevenLabs State
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState<string>('');
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = useState<string>('pNInz6obpgDQGcFmaJgB');
  const [isElevenLabsEnabled, setIsElevenLabsEnabled] = useState<boolean>(false);
  const [elevenLabsVoices, setElevenLabsVoices] = useState<ElevenLabsVoice[]>(DEFAULT_ELEVENLABS_VOICES);
  const [isValidatingKey, setIsValidatingKey] = useState<boolean>(false);

  const availableVoicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices from browser SpeechSynthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        try {
          const list = window.speechSynthesis.getVoices();
          if (list && list.length > 0) {
            availableVoicesRef.current = list;
          }
        } catch {
          // Ignore
        }
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Load stored settings and history
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }

      const savedKey = localStorage.getItem(ELEVENLABS_KEY_STORAGE);
      if (savedKey) {
        setElevenLabsApiKey(savedKey);
      }

      const savedVoice = localStorage.getItem(ELEVENLABS_VOICE_STORAGE);
      if (savedVoice) {
        setElevenLabsVoiceId(savedVoice);
      }

      const savedEnabled = localStorage.getItem(ELEVENLABS_ENABLED_STORAGE);
      if (savedEnabled === 'true' && savedKey && savedKey.trim().length > 0) {
        setIsElevenLabsEnabled(true);
      }

      const savedOfflineEngine = localStorage.getItem(OFFLINE_ENGINE_STORAGE) as OfflineEngineMode | null;
      if (savedOfflineEngine === 'system' || savedOfflineEngine === 'dsp') {
        setOfflineEngineMode(savedOfflineEngine);
      }
    } catch (e) {
      console.warn('Error reading saved configuration:', e);
    }
  }, []);

  // Load ElevenLabs voices if key exists
  const loadElevenLabsVoices = useCallback(async (key: string) => {
    const cleanKey = key.trim();
    if (!cleanKey) {
      setElevenLabsVoices(DEFAULT_ELEVENLABS_VOICES);
      return;
    }
    setIsValidatingKey(true);
    setErrorMessage(null);
    try {
      const voices = await fetchElevenLabsVoices(cleanKey);
      setElevenLabsVoices(voices);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در ارتباط با الون‌لبز';
      setErrorMessage(msg);
    } finally {
      setIsValidatingKey(false);
    }
  }, []);

  // Update ElevenLabs key
  const updateElevenLabsKey = useCallback(
    (key: string) => {
      const trimmed = key.trim();
      setElevenLabsApiKey(trimmed);
      localStorage.setItem(ELEVENLABS_KEY_STORAGE, trimmed);
      if (trimmed) {
        loadElevenLabsVoices(trimmed);
      }
    },
    [loadElevenLabsVoices]
  );

  const toggleElevenLabsEnabled = useCallback((enabled: boolean) => {
    setIsElevenLabsEnabled(enabled);
    localStorage.setItem(ELEVENLABS_ENABLED_STORAGE, enabled ? 'true' : 'false');
  }, []);

  const selectElevenLabsVoice = useCallback((voiceId: string) => {
    setElevenLabsVoiceId(voiceId);
    localStorage.setItem(ELEVENLABS_VOICE_STORAGE, voiceId);
  }, []);

  const changeOfflineEngineMode = useCallback((mode: OfflineEngineMode) => {
    setOfflineEngineMode(mode);
    localStorage.setItem(OFFLINE_ENGINE_STORAGE, mode);
  }, []);

  // Save history
  const saveHistory = useCallback((items: HistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
    } catch (e) {
      console.warn('Could not save history to localStorage', e);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (e) {
      console.warn('Could not clear history', e);
    }
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not update history', e);
      }
      return updated;
    });
  }, []);

  // Stop all playback
  const stop = useCallback(() => {
    globalAudioPlayer.stop();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }
    activeUtteranceRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  // Pause playback
  const pause = useCallback(() => {
    if (globalAudioPlayer.isPlaying()) {
      globalAudioPlayer.pause();
      setIsPaused(true);
      setIsPlaying(false);
      return;
    }
    if (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      window.speechSynthesis.speaking
    ) {
      try {
        window.speechSynthesis.pause();
      } catch {
        // Ignore
      }
      setIsPaused(true);
      setIsPlaying(false);
    }
  }, []);

  // Resume playback
  const resume = useCallback(() => {
    if (globalAudioPlayer.isPaused()) {
      globalAudioPlayer.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }
    if (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      window.speechSynthesis.paused
    ) {
      try {
        window.speechSynthesis.resume();
      } catch {
        // Ignore
      }
      setIsPaused(false);
      setIsPlaying(true);
    }
  }, []);

  // Play using Web Audio DSP Synthesizer (Pure Local Offline Fallback)
  const speakWithDsp = useCallback(
    async (text: string, voice: VoiceType, emotion: EmotionType): Promise<void> => {
      stop();
      setIsSynthesizing(true);
      setActiveEngine('dsp');
      try {
        const audioBuffer = await synthesizeFormantAudio(text, voice, emotion);
        globalAudioPlayer.playBuffer(audioBuffer, () => {
          setIsPlaying(false);
          setIsPaused(false);
        });
        setIsPlaying(true);
        setIsPaused(false);
      } catch (err) {
        console.warn('DSP playback warning:', err);
        setIsPlaying(false);
        setIsPaused(false);
      } finally {
        setIsSynthesizing(false);
      }
    },
    [stop]
  );

  // Play using Browser Native SpeechSynthesis with automatic phonetic fallback
  const speakWithBrowser = useCallback(
    (text: string, voice: VoiceType, emotion: EmotionType, lang: 'fa' | 'en'): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
          speakWithDsp(text, voice, emotion).then(resolve);
          return;
        }

        stop();
        setActiveEngine('browser');

        try {
          window.speechSynthesis.cancel();
        } catch {
          // Ignore
        }

        const voices =
          availableVoicesRef.current.length > 0
            ? availableVoicesRef.current
            : window.speechSynthesis.getVoices();

        const persianVoice = voices.find(
          (v) =>
            /fa|fas|farsi|iran/i.test(v.lang) ||
            /farsi|persian/i.test(v.name)
        );

        let spokenText = text;
        let chosenVoice: SpeechSynthesisVoice | undefined = persianVoice;
        let targetLang = 'fa-IR';

        if (lang === 'fa') {
          if (persianVoice) {
            chosenVoice = persianVoice;
            spokenText = text;
            targetLang = persianVoice.lang || 'fa-IR';
          } else {
            // No native Persian voice installed locally:
            // Convert Persian text to natural phonetic Latin so default local voice can pronounce it clearly!
            spokenText = persianToPhoneticLatin(text);
            targetLang = 'en-US';

            // Find an English or default local voice
            chosenVoice = voices.find(
              (v) =>
                v.lang.toLowerCase().startsWith('en') &&
                (voice === 'female' ? /female|woman|samantha|zira/i.test(v.name) : true)
            ) || voices[0];
          }
        } else {
          chosenVoice = voices.find(
            (v) =>
              v.lang.toLowerCase().startsWith('en') &&
              (voice === 'female' ? /female|woman|samantha|zira/i.test(v.name) : true)
          ) || voices[0];
          targetLang = 'en-US';
        }

        const utterance = new SpeechSynthesisUtterance(spokenText);
        activeUtteranceRef.current = utterance;

        const voiceCfg = VOICE_PROFILES[voice] || VOICE_PROFILES.male;
        const emoCfg = EMOTION_PROFILES[emotion] || EMOTION_PROFILES.normal;

        utterance.rate = Math.min(1.25, Math.max(0.75, emoCfg.tempo * (voice === 'child' ? 1.05 : 0.95)));
        utterance.pitch = Math.min(1.5, Math.max(0.6, (voiceCfg.basePitch / 160) * emoCfg.pitchShift));
        utterance.lang = targetLang;

        if (chosenVoice) {
          utterance.voice = chosenVoice;
        }

        let started = false;

        utterance.onstart = () => {
          started = true;
          setIsPlaying(true);
          setIsPaused(false);
        };

        utterance.onend = () => {
          setIsPlaying(false);
          setIsPaused(false);
          activeUtteranceRef.current = null;
          resolve();
        };

        utterance.onerror = (e) => {
          if (e.error === 'canceled' || e.error === 'interrupted') {
            return;
          }
          console.warn('SpeechSynthesis error, falling back to DSP:', e.error);
          setIsPlaying(false);
          setIsPaused(false);
          activeUtteranceRef.current = null;
          speakWithDsp(text, voice, emotion).then(resolve);
        };

        try {
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn('speak call error, falling back to DSP:', e);
          speakWithDsp(text, voice, emotion).then(resolve);
          return;
        }

        // Failsafe watchdog
        setTimeout(() => {
          if (!started && activeUtteranceRef.current === utterance && !isPlaying) {
            console.warn('SpeechSynthesis watchdog triggered fallback');
            speakWithDsp(text, voice, emotion).then(resolve);
          }
        }, 900);
      });
    },
    [stop, speakWithDsp, isPlaying]
  );

  // Play with ElevenLabs API
  const speakWithElevenLabs = useCallback(
    async (text: string, voice: VoiceType, emotion: EmotionType): Promise<void> => {
      stop();
      setIsSynthesizing(true);
      setActiveEngine('elevenlabs');
      setErrorMessage(null);

      try {
        const targetVoiceId = getVoiceIdForType(voice, elevenLabsVoiceId);
        const audioBlob = await synthesizeWithElevenLabs(
          text,
          elevenLabsApiKey,
          targetVoiceId,
          emotion
        );

        await globalAudioPlayer.playBlob(audioBlob, () => {
          setIsPlaying(false);
          setIsPaused(false);
        });

        setIsPlaying(true);
        setIsPaused(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'خطا در تبدیل آنلاین الون‌لبز';
        setErrorMessage(msg);
        console.warn('ElevenLabs failed, automatically falling back to offline voice:', err);

        // Fallback to offline speech
        const detection = detectLanguage(text);
        if (offlineEngineMode === 'dsp') {
          await speakWithDsp(text, voice, emotion);
        } else {
          await speakWithBrowser(text, voice, emotion, detection.language);
        }
      } finally {
        setIsSynthesizing(false);
      }
    },
    [stop, elevenLabsVoiceId, elevenLabsApiKey, offlineEngineMode, speakWithBrowser, speakWithDsp]
  );

  // Main Speak function
  const speak = useCallback(
    async (text: string, voice: VoiceType, emotion: EmotionType) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      try {
        globalAudioPlayer.getContext();
      } catch {
        // Ignore
      }

      const detection = detectLanguage(trimmed);
      const isOnlineElevenLabs = isElevenLabsEnabled && Boolean(elevenLabsApiKey.trim());

      // Save to history
      const historyItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        text: trimmed,
        language: detection.language,
        voice,
        emotion,
        engine: isOnlineElevenLabs ? 'elevenlabs' : offlineEngineMode === 'dsp' ? 'dsp' : 'browser',
        timestamp: Date.now(),
        duration: detection.estimatedDurationSeconds,
      };

      saveHistory([historyItem, ...history.filter((h) => h.text !== trimmed)]);

      if (isOnlineElevenLabs) {
        await speakWithElevenLabs(trimmed, voice, emotion);
      } else if (offlineEngineMode === 'dsp') {
        await speakWithDsp(trimmed, voice, emotion);
      } else {
        try {
          await speakWithBrowser(trimmed, voice, emotion, detection.language);
        } catch {
          await speakWithDsp(trimmed, voice, emotion);
        }
      }
    },
    [
      isElevenLabsEnabled,
      elevenLabsApiKey,
      offlineEngineMode,
      history,
      saveHistory,
      speakWithElevenLabs,
      speakWithBrowser,
      speakWithDsp,
    ]
  );

  // Download Handlers
  const handleDownloadWav = useCallback(
    async (text: string, voice: VoiceType, emotion: EmotionType) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setIsSynthesizing(true);
      setErrorMessage(null);
      try {
        if (isElevenLabsEnabled && elevenLabsApiKey.trim()) {
          const targetVoiceId = getVoiceIdForType(voice, elevenLabsVoiceId);
          const blob = await synthesizeWithElevenLabs(trimmed, elevenLabsApiKey, targetVoiceId, emotion);
          downloadBlob(blob, `avaye-iran-${Date.now()}.mp3`);
        } else {
          await exportToWav(trimmed, voice, emotion);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'خطا در خروجی فایل صوتی';
        setErrorMessage(msg);
      } finally {
        setIsSynthesizing(false);
      }
    },
    [isElevenLabsEnabled, elevenLabsApiKey, elevenLabsVoiceId]
  );

  const handleDownloadMp3 = useCallback(
    async (text: string, voice: VoiceType, emotion: EmotionType) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setIsSynthesizing(true);
      setErrorMessage(null);
      try {
        if (isElevenLabsEnabled && elevenLabsApiKey.trim()) {
          const targetVoiceId = getVoiceIdForType(voice, elevenLabsVoiceId);
          const blob = await synthesizeWithElevenLabs(trimmed, elevenLabsApiKey, targetVoiceId, emotion);
          downloadBlob(blob, `avaye-iran-${Date.now()}.mp3`);
        } else {
          await exportToMp3(trimmed, voice, emotion);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'خطا در خروجی فایل صوتی';
        setErrorMessage(msg);
      } finally {
        setIsSynthesizing(false);
      }
    },
    [isElevenLabsEnabled, elevenLabsApiKey, elevenLabsVoiceId]
  );

  return {
    isPlaying,
    isPaused,
    isSynthesizing,
    activeEngine,
    offlineEngineMode,
    changeOfflineEngineMode,
    history,
    errorMessage,
    setErrorMessage,
    elevenLabsApiKey,
    elevenLabsVoiceId,
    isElevenLabsEnabled,
    elevenLabsVoices,
    isValidatingKey,
    updateElevenLabsKey,
    toggleElevenLabsEnabled,
    selectElevenLabsVoice,
    loadElevenLabsVoices,
    speak,
    stop,
    pause,
    resume,
    handleDownloadWav,
    handleDownloadMp3,
    clearHistory,
    deleteHistoryItem,
  };
}
