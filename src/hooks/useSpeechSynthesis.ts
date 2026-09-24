import { useState, useEffect, useRef, useCallback } from 'react';
import {
  EmotionType,
  EngineType,
  HistoryItem,
  VoiceType,
  ElevenLabsVoice,
  ActiveEngineMode,
  OfflineEngineMode,
} from '../types/tts';
import { detectLanguage } from '../utils/languageDetector';
import {
  DEFAULT_ELEVENLABS_VOICES,
  CURATED_PERSIAN_ELEVENLABS_VOICES,
  fetchElevenLabsVoices,
  getVoiceIdForType,
  synthesizeWithElevenLabs,
} from '../services/elevenlabs';
import { synthesizeNeuralSpeech } from '../services/neuralSpeech';
import { globalAudioPlayer } from '../utils/audioBufferPlayer';
import { persianToPhoneticLatin } from '../utils/persianTransliteration';
import { downloadBlob } from '../utils/audioExporter';

const HISTORY_STORAGE_KEY = 'awa_tts_history_v3';
const ACTIVE_MODE_STORAGE = 'awa_active_mode_v3';
const ELEVENLABS_KEY_STORAGE = 'awa_elevenlabs_key';
const ELEVENLABS_VOICE_STORAGE = 'awa_elevenlabs_voice';
const ELEVENLABS_ENABLED_STORAGE = 'awa_elevenlabs_enabled';
const OFFLINE_ENGINE_STORAGE = 'awa_offline_engine';

export function useSpeechSynthesis() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [activeEngine, setActiveEngine] = useState<EngineType>('neural');
  const [activeEngineMode, setActiveEngineMode] = useState<ActiveEngineMode>('neural');
  const [offlineEngineMode, setOfflineEngineMode] = useState<OfflineEngineMode>('system');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Speed and Pitch Tuning
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(0);

  // ElevenLabs State
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState<string>('');
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = useState<string>('CwhRBWXzGAHq8TQ4Fs17'); // Roger (Persian-recommended)
  const [customVoiceId, setCustomVoiceId] = useState<string>('');
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
      const savedMode = localStorage.getItem(ACTIVE_MODE_STORAGE) as ActiveEngineMode | null;
      if (savedMode === 'neural' || savedMode === 'elevenlabs' || savedMode === 'offline') {
        setActiveEngineMode(savedMode);
      }

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

  // Change active mode
  const changeActiveEngineMode = useCallback((mode: ActiveEngineMode) => {
    setActiveEngineMode(mode);
    localStorage.setItem(ACTIVE_MODE_STORAGE, mode);
  }, []);

  // Load ElevenLabs voices if key exists
  const loadElevenLabsVoices = useCallback(async (key: string) => {
    const cleanKey = key.trim();
    if (!cleanKey) {
      setElevenLabsVoices(CURATED_PERSIAN_ELEVENLABS_VOICES);
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
        setIsElevenLabsEnabled(true);
        localStorage.setItem(ELEVENLABS_ENABLED_STORAGE, 'true');
        loadElevenLabsVoices(trimmed);
      }
    },
    [loadElevenLabsVoices]
  );

  const toggleElevenLabsEnabled = useCallback((enabled: boolean) => {
    setIsElevenLabsEnabled(enabled);
    localStorage.setItem(ELEVENLABS_ENABLED_STORAGE, enabled ? 'true' : 'false');
    if (enabled) {
      setActiveEngineMode('elevenlabs');
      localStorage.setItem(ACTIVE_MODE_STORAGE, 'elevenlabs');
    } else {
      setActiveEngineMode('neural');
      localStorage.setItem(ACTIVE_MODE_STORAGE, 'neural');
    }
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

  // Play using Browser Native SpeechSynthesis
  const speakWithBrowser = useCallback(
    (text: string, voice: VoiceType, emotion: EmotionType): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
          resolve();
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

        // Check for dedicated Persian/Farsi voice on device (Chrome, Edge, Android)
        const persianVoice = voices.find(
          (v) =>
            /fa|fas|farsi|iran/i.test(v.lang) ||
            /farsi|persian|dilara|farid/i.test(v.name)
        );

        let spokenText = text;
        let chosenVoice: SpeechSynthesisVoice | undefined = persianVoice;
        let targetLang = 'fa-IR';

        if (persianVoice) {
          chosenVoice = persianVoice;
          spokenText = text;
          targetLang = persianVoice.lang || 'fa-IR';
        } else {
          // Fallback to clear phonetic Latin pronunciation on default device engine
          spokenText = persianToPhoneticLatin(text);
          targetLang = 'en-US';
          chosenVoice =
            voices.find(
              (v) =>
                v.lang.toLowerCase().startsWith('en') &&
                (voice === 'female' ? /female|woman|samantha|zira/i.test(v.name) : true)
            ) || voices[0];
        }

        const utterance = new SpeechSynthesisUtterance(spokenText);
        activeUtteranceRef.current = utterance;

        // Apply speed, emotion, and pitch
        let rateMultiplier = speechSpeed;
        let pitchMultiplier = 1.0;

        if (emotion === 'news') rateMultiplier *= 1.1;
        if (emotion === 'emotional') rateMultiplier *= 0.92;
        if (emotion === 'happy') {
          rateMultiplier *= 1.08;
          pitchMultiplier *= 1.15;
        }
        if (emotion === 'sad') {
          rateMultiplier *= 0.85;
          pitchMultiplier *= 0.88;
        }
        if (emotion === 'excited') {
          rateMultiplier *= 1.2;
          pitchMultiplier *= 1.2;
        }

        if (voice === 'child') {
          pitchMultiplier *= 1.35;
          rateMultiplier *= 1.05;
        } else if (voice === 'female') {
          pitchMultiplier *= 1.15;
        } else {
          pitchMultiplier *= 0.9;
        }

        utterance.rate = Math.min(2.0, Math.max(0.6, rateMultiplier));
        utterance.pitch = Math.min(2.0, Math.max(0.5, pitchMultiplier));
        utterance.lang = targetLang;

        if (chosenVoice) {
          utterance.voice = chosenVoice;
        }

        utterance.onstart = () => {
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
          console.warn('SpeechSynthesis error:', e.error);
          setIsPlaying(false);
          setIsPaused(false);
          activeUtteranceRef.current = null;
          resolve();
        };

        try {
          window.speechSynthesis.speak(utterance);
        } catch {
          setIsPlaying(false);
          setIsPaused(false);
          resolve();
        }
      });
    },
    [stop, speechSpeed]
  );

  // Play with ElevenLabs API (Online with API Key)
  const speakWithElevenLabs = useCallback(
    async (text: string, voice: VoiceType, emotion: EmotionType): Promise<void> => {
      stop();
      setIsSynthesizing(true);
      setActiveEngine('elevenlabs');
      setErrorMessage(null);

      try {
        const effectiveVoiceId = customVoiceId.trim() || getVoiceIdForType(voice, elevenLabsVoiceId);
        const audioBlob = await synthesizeWithElevenLabs(
          text,
          elevenLabsApiKey,
          effectiveVoiceId,
          emotion
        );

        await globalAudioPlayer.playBlob(audioBlob, () => {
          setIsPlaying(false);
          setIsPaused(false);
        });

        setIsPlaying(true);
        setIsPaused(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'خطا در تبدیل آنلاین ElevenLabs';
        setErrorMessage(msg);
        console.warn('ElevenLabs failed, automatically falling back to neural speech:', err);

        // Fallback to high quality neural voice
        try {
          const neuralBlob = await synthesizeNeuralSpeech({
            text,
            voice,
            emotion,
            rate: Math.round((speechSpeed - 1.0) * 50),
            pitch: speechPitch,
          });
          await globalAudioPlayer.playBlob(neuralBlob, () => {
            setIsPlaying(false);
            setIsPaused(false);
          });
          setIsPlaying(true);
          setIsPaused(false);
        } catch {
          await speakWithBrowser(text, voice, emotion);
        }
      } finally {
        setIsSynthesizing(false);
      }
    },
    [stop, customVoiceId, elevenLabsVoiceId, elevenLabsApiKey, speechSpeed, speechPitch, speakWithBrowser]
  );

  // Play with Microsoft Neural Persian (100% fluent, NO VPN, NO API Key)
  const speakWithNeural = useCallback(
    async (text: string, voice: VoiceType, emotion: EmotionType): Promise<void> => {
      stop();
      setIsSynthesizing(true);
      setActiveEngine('neural');
      setErrorMessage(null);

      try {
        const ratePercent = Math.round((speechSpeed - 1.0) * 50);
        const audioBlob = await synthesizeNeuralSpeech({
          text,
          voice,
          emotion,
          rate: ratePercent,
          pitch: speechPitch,
        });

        await globalAudioPlayer.playBlob(audioBlob, () => {
          setIsPlaying(false);
          setIsPaused(false);
        });

        setIsPlaying(true);
        setIsPaused(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'خطا در سنتز صدا با موتور هوشمند';
        console.warn('Neural TTS failed, falling back to browser speech:', msg);
        // Fallback to local browser speech
        await speakWithBrowser(text, voice, emotion);
      } finally {
        setIsSynthesizing(false);
      }
    },
    [stop, speechSpeed, speechPitch, speakWithBrowser]
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

      // Save to history
      const historyItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        text: trimmed,
        language: detection.language,
        voice,
        emotion,
        engine: activeEngineMode === 'elevenlabs' ? 'elevenlabs' : activeEngineMode === 'offline' ? 'browser' : 'neural',
        timestamp: Date.now(),
        duration: detection.estimatedDurationSeconds,
      };

      saveHistory([historyItem, ...history.filter((h) => h.text !== trimmed)]);

      if (activeEngineMode === 'elevenlabs') {
        if (!elevenLabsApiKey.trim()) {
          setErrorMessage('لطفاً ابتدا کلید API اختصاصی ElevenLabs را وارد یا ذخیره کنید.');
          // Use neural voice seamlessly
          await speakWithNeural(trimmed, voice, emotion);
          return;
        }
        await speakWithElevenLabs(trimmed, voice, emotion);
      } else if (activeEngineMode === 'offline') {
        await speakWithBrowser(trimmed, voice, emotion);
      } else {
        // Standard Neural Voice (No VPN, No API Key, Studio Quality)
        await speakWithNeural(trimmed, voice, emotion);
      }
    },
    [
      activeEngineMode,
      elevenLabsApiKey,
      history,
      saveHistory,
      speakWithElevenLabs,
      speakWithNeural,
      speakWithBrowser,
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
        if (activeEngineMode === 'elevenlabs' && elevenLabsApiKey.trim()) {
          const effectiveVoiceId = customVoiceId.trim() || getVoiceIdForType(voice, elevenLabsVoiceId);
          const blob = await synthesizeWithElevenLabs(trimmed, elevenLabsApiKey, effectiveVoiceId, emotion);
          downloadBlob(blob, `avaye-iran-${Date.now()}.mp3`);
        } else {
          // Download pristine neural MP3 (universal high compatibility)
          const ratePercent = Math.round((speechSpeed - 1.0) * 50);
          const blob = await synthesizeNeuralSpeech({
            text: trimmed,
            voice,
            emotion,
            rate: ratePercent,
            pitch: speechPitch,
          });
          downloadBlob(blob, `avaye-iran-${Date.now()}.mp3`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'خطا در خروجی فایل صوتی';
        setErrorMessage(msg);
      } finally {
        setIsSynthesizing(false);
      }
    },
    [activeEngineMode, elevenLabsApiKey, customVoiceId, elevenLabsVoiceId, speechSpeed, speechPitch]
  );

  const handleDownloadMp3 = useCallback(
    async (text: string, voice: VoiceType, emotion: EmotionType) => {
      await handleDownloadWav(text, voice, emotion);
    },
    [handleDownloadWav]
  );

  return {
    isPlaying,
    isPaused,
    isSynthesizing,
    activeEngine,
    activeEngineMode,
    changeActiveEngineMode,
    offlineEngineMode,
    changeOfflineEngineMode,
    speechSpeed,
    setSpeechSpeed,
    speechPitch,
    setSpeechPitch,
    history,
    errorMessage,
    setErrorMessage,
    elevenLabsApiKey,
    elevenLabsVoiceId,
    customVoiceId,
    setCustomVoiceId,
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
