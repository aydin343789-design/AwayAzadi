export type VoiceType = 'male' | 'female' | 'child';

export type EmotionType = 'normal' | 'news' | 'emotional' | 'happy' | 'sad' | 'excited';

export type DetectedLanguage = 'fa' | 'en' | 'mixed';

export type EngineType = 'neural' | 'elevenlabs' | 'browser' | 'dsp';

export type ActiveEngineMode = 'neural' | 'elevenlabs' | 'offline';

export type OfflineEngineMode = 'system' | 'dsp';

export interface HistoryItem {
  id: string;
  text: string;
  language: 'fa' | 'en';
  voice: VoiceType;
  emotion: EmotionType;
  engine: EngineType;
  timestamp: number;
  duration?: number;
  audioBlobUrl?: string;
}

export interface VoiceConfig {
  id: VoiceType;
  titleFa: string;
  titleEn: string;
  basePitch: number;
  speedMultiplier: number;
  descriptionFa: string;
}

export interface EmotionConfig {
  id: EmotionType;
  titleFa: string;
  titleEn: string;
  pitchOffset: number;
  tempoMultiplier: number;
  vibratoRate: number;
  vibratoDepth: number;
  energy: number;
  descriptionFa: string;
}

export interface FormantFrequencies {
  f1: number;
  f2: number;
  f3: number;
  bandwidth1?: number;
  bandwidth2?: number;
  bandwidth3?: number;
  gain?: number;
  duration?: number;
  isNoise?: boolean;
}

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category?: string;
  preview_url?: string;
  labels?: Record<string, string>;
}
