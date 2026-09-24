import { useState, useEffect, useCallback } from 'react';
import {
  EmotionType,
  EngineType,
  HistoryItem,
  VoiceType,
  ElevenLabsVoice,
  ActiveEngineMode,
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
import { downloadBlob } from '../utils/audioExporter';
import { preparePersianSpeechText } from '../utils/persianNormalizer';

const HISTORY_STORAGE_KEY = 'awa_tts_history_v4';
const ACTIVE_MODE_STORAGE = 'awa_active_mode_v4';
const ELEVENLABS_KEY_STORAGE = 'awa_elevenlabs_key';
const ELEVENLABS_VOICE_STORAGE = 'awa_elevenlabs_voice';
const ELEVENLABS_ENABLED_STORAGE = 'awa_elevenlabs_enabled';

export function useSpeechSynthesis() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [activeEngine, setActiveEngine] = useState<EngineType>('neural');
  const [activeEngineMode, setActiveEngineMode] = useState<ActiveEngineMode>('neural');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Speed and Pitch Tuning
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(0);

  // ElevenLabs State
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState<string>('');
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = useState<string>('CwhRBWXzGAHq8TQ4Fs17'); // Roger
  const [customVoiceId, setCustomVoiceId] = useState<string>('');
  const [isElevenLabsEnabled, setIsElevenLabsEnabled] = useState<boolean>(false);
  const [elevenLabsVoices, setElevenLabsVoices] = useState<ElevenLabsVoice[]>(DEFAULT_ELEVENLABS_VOICES);
  const [isValidatingKey, setIsValidatingKey] = useState<boolean>(false);

  // Load stored settings and history
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem(ACTIVE_MODE_STORAGE) as ActiveEngineMode | null;
      if (savedMode === 'neural' || savedMode === 'elevenlabs') {
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
  const loadElevenLabsVoices = useCallback(async (key?: string) => {
    const cleanKey = (key || elevenLabsApiKey).trim();
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
  }, [elevenLabsApiKey]);

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
      } else {
        setIsElevenLabsEnabled(false);
        localStorage.setItem(ELEVENLABS_ENABLED_STORAGE, 'false');
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

  // Stop playback
  const stop = useCallback(() => {
    globalAudioPlayer.stop();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  // Pause playback
  const pause = useCallback(() => {
    if (globalAudioPlayer.isPlaying()) {
      globalAudioPlayer.pause();
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
    }
  }, []);

  // Play with Microsoft Neural Persian (Studio Quality, NO VPN, NO API Key)
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
        setErrorMessage(msg);
      } finally {
        setIsSynthesizing(false);
      }
    },
    [stop, speechSpeed, speechPitch]
  );

  // Play with ElevenLabs API (192kbps MP3 Output)
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

        // Seamless fallback to high quality neural voice
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
          // Both failed
        }
      } finally {
        setIsSynthesizing(false);
      }
    },
    [stop, customVoiceId, elevenLabsVoiceId, elevenLabsApiKey, speechSpeed, speechPitch]
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

      const normalizedForAnalysis = preparePersianSpeechText(trimmed);
      const detection = detectLanguage(normalizedForAnalysis);

      // Save to history
      const historyItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        text: trimmed,
        language: detection.language,
        voice,
        emotion,
        engine: activeEngineMode === 'elevenlabs' ? 'elevenlabs' : 'neural',
        timestamp: Date.now(),
        duration: detection.estimatedDurationSeconds,
      };

      saveHistory([historyItem, ...history.filter((h) => h.text !== trimmed)]);

      if (activeEngineMode === 'elevenlabs') {
        if (!elevenLabsApiKey.trim()) {
          setErrorMessage('کلید API وارد نشده است. لطفاً ابتدا کلید خود را در منوی سه‌خط بالای صفحه تنظیم کنید.');
          // Use high quality neural voice seamlessly
          await speakWithNeural(trimmed, voice, emotion);
          return;
        }
        await speakWithElevenLabs(trimmed, voice, emotion);
      } else {
        // High quality Neural Voice (No VPN, No API Key, Studio Quality)
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
          // Download pristine neural MP3
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
