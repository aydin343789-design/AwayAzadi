export type Language = 'fa' | 'en' | 'auto';

export type DetectedLanguage = 'fa' | 'en' | 'mixed';

export type VoiceType = 'male' | 'female' | 'child';

export type EmotionType = 'normal' | 'happy' | 'sad' | 'excited' | 'news' | 'emotional';

export type EngineType = 'neural' | 'elevenlabs';

export type ActiveEngineMode = 'neural' | 'elevenlabs';

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category?: string;
  labels?: Record<string, string>;
}

export interface VoiceOption {
  id: VoiceType;
  name: string;
  description: string;
  neuralVoiceName: string;
  avatar: string;
  gender: 'male' | 'female';
}

export interface EmotionOption {
  id: EmotionType;
  name: string;
  description: string;
  iconName: string;
  pitchOffset: number;
  speedMultiplier: number;
}

export interface HistoryItem {
  id: string;
  text: string;
  language: 'fa' | 'en';
  voice: VoiceType;
  emotion: EmotionType;
  engine: EngineType;
  timestamp: number;
  duration?: number;
}
