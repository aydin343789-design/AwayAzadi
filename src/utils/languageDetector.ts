import { DetectedLanguage } from '../types/tts';

export interface LanguageDetectionResult {
  language: 'fa' | 'en';
  primaryLang: DetectedLanguage;
  persianRatio: number;
  charCount: number;
  wordCount: number;
  estimatedDurationSeconds: number;
}

const PERSIAN_REGEX = /[\u0600-\u06FF\uFB8A\u067E\u0686\u0698\u06AF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
const ENGLISH_REGEX = /[a-zA-Z]/g;

export function detectLanguage(text: string): LanguageDetectionResult {
  const trimmed = text.trim();
  const charCount = trimmed.length;

  if (charCount === 0) {
    return {
      language: 'fa',
      primaryLang: 'fa',
      persianRatio: 1,
      charCount: 0,
      wordCount: 0,
      estimatedDurationSeconds: 0,
    };
  }

  const persianMatches = trimmed.match(PERSIAN_REGEX) || [];
  const englishMatches = trimmed.match(ENGLISH_REGEX) || [];

  const persianCount = persianMatches.length;
  const englishCount = englishMatches.length;
  const totalLetters = persianCount + englishCount || 1;
  const persianRatio = persianCount / totalLetters;

  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Average reading speed: ~130 words per minute for Persian / 150 for English
  const wordsPerSec = persianRatio >= 0.5 ? 2.2 : 2.5;
  const estimatedDurationSeconds = Math.max(1, Math.round(wordCount / wordsPerSec));

  let language: 'fa' | 'en' = 'fa';
  let primaryLang: DetectedLanguage = 'fa';

  if (englishCount > persianCount) {
    language = 'en';
    primaryLang = persianCount > 0 ? 'mixed' : 'en';
  } else if (englishCount > 0 && persianCount > 0) {
    primaryLang = 'mixed';
  }

  return {
    language,
    primaryLang,
    persianRatio,
    charCount,
    wordCount,
    estimatedDurationSeconds,
  };
}
