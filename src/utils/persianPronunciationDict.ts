import { FormantFrequencies } from '../types/tts';
import { enrichWithDiacritics, stripDiacritics } from './persianDiacritics';

/**
 * Acoustic Formant Target Matrix (Hz) for Persian & English vowels and consonants.
 */
export const PHONEME_FORMANTS: Record<string, FormantFrequencies> = {
  // --- Persian Vowels (مصوت‌ها) ---
  // /æ/ - Fatha (َ)
  'æ': { f1: 750, f2: 1550, f3: 2550, bandwidth1: 90, bandwidth2: 120, bandwidth3: 150, gain: 1.0, duration: 110 },
  // /e/ - Kasra (ِ)
  'e': { f1: 450, f2: 1950, f3: 2650, bandwidth1: 70, bandwidth2: 110, bandwidth3: 140, gain: 0.95, duration: 100 },
  // /o/ - Damma (ُ)
  'o': { f1: 480, f2: 950, f3: 2400, bandwidth1: 80, bandwidth2: 100, bandwidth3: 140, gain: 0.95, duration: 110 },
  // /ɒː/ - Alef (آ / ا)
  'ɒ': { f1: 800, f2: 1100, f3: 2500, bandwidth1: 90, bandwidth2: 110, bandwidth3: 160, gain: 1.05, duration: 160 },
  // /uː/ - Vav (او / و)
  'u': { f1: 340, f2: 850, f3: 2250, bandwidth1: 70, bandwidth2: 90, bandwidth3: 130, gain: 0.9, duration: 150 },
  // /iː/ - Yeh (ای / ی)
  'i': { f1: 300, f2: 2250, f3: 2900, bandwidth1: 60, bandwidth2: 100, bandwidth3: 150, gain: 0.9, duration: 150 },

  // --- Persian Special Consonants ---
  // "خ"
  'x': { f1: 500, f2: 1400, f3: 2100, gain: 0.7, duration: 110, isNoise: true },
  // "ش"
  'ʃ': { f1: 350, f2: 1700, f3: 2800, gain: 0.65, duration: 110, isNoise: true },
  // "ژ"
  'ʒ': { f1: 380, f2: 1750, f3: 2750, gain: 0.75, duration: 100, isNoise: true },
  // "چ"
  'tʃ': { f1: 400, f2: 1800, f3: 2700, gain: 0.8, duration: 110, isNoise: true },
  // "ق"
  'q': { f1: 350, f2: 1200, f3: 2200, gain: 0.85, duration: 80 },
  // "غ"
  'ʁ': { f1: 420, f2: 1250, f3: 2150, gain: 0.85, duration: 90, isNoise: false },
  // "ج"
  'dʒ': { f1: 380, f2: 1800, f3: 2600, gain: 0.8, duration: 90 },

  // --- General Consonants ---
  'b': { f1: 220, f2: 900, f3: 2300, gain: 0.7, duration: 70 },
  'p': { f1: 220, f2: 850, f3: 2200, gain: 0.6, duration: 70, isNoise: true },
  't': { f1: 250, f2: 1600, f3: 2600, gain: 0.65, duration: 70, isNoise: true },
  'd': { f1: 250, f2: 1600, f3: 2600, gain: 0.75, duration: 70 },
  'k': { f1: 300, f2: 1800, f3: 2700, gain: 0.65, duration: 75, isNoise: true },
  'g': { f1: 300, f2: 1850, f3: 2650, gain: 0.75, duration: 75 },
  's': { f1: 300, f2: 1700, f3: 3800, gain: 0.6, duration: 100, isNoise: true },
  'z': { f1: 300, f2: 1650, f3: 3600, gain: 0.75, duration: 95 },
  'f': { f1: 280, f2: 1200, f3: 2400, gain: 0.5, duration: 90, isNoise: true },
  'v': { f1: 280, f2: 1100, f3: 2300, gain: 0.7, duration: 80 },
  'm': { f1: 280, f2: 1100, f3: 2400, gain: 0.8, duration: 95 },
  'n': { f1: 300, f2: 1500, f3: 2600, gain: 0.8, duration: 95 },
  'l': { f1: 360, f2: 1300, f3: 2700, gain: 0.85, duration: 90 },
  'r': { f1: 380, f2: 1350, f3: 1850, gain: 0.85, duration: 80 },
  'h': { f1: 450, f2: 1500, f3: 2500, gain: 0.5, duration: 80, isNoise: true },
  'j': { f1: 320, f2: 2100, f3: 2800, gain: 0.8, duration: 80 },
  'w': { f1: 320, f2: 800, f3: 2200, gain: 0.8, duration: 80 },

  // --- Pauses ---
  'pause_short': { f1: 0, f2: 0, f3: 0, gain: 0.0001, duration: 120 },
  'pause_long': { f1: 0, f2: 0, f3: 0, gain: 0.0001, duration: 280 },
};

export const PERSIAN_SPECIAL_WORDS: Record<string, string[]> = {
  'ایران': ['i', 'r', 'ɒ', 'n'],
  'آزاد': ['ɒ', 'z', 'ɒ', 'd'],
  'آزادی': ['ɒ', 'z', 'ɒ', 'd', 'i'],
  'زن': ['z', 'æ', 'n'],
  'زندگی': ['z', 'e', 'n', 'd', 'e', 'g', 'i'],
  'میهن': ['m', 'i', 'h', 'æ', 'n'],
  'مردم': ['m', 'æ', 'r', 'd', 'o', 'm'],
  'صلح': ['s', 'o', 'l', 'h'],
  'عشق': ['e', 'ʃ', 'q'],
  'امید': ['o', 'm', 'i', 'd'],
  'نور': ['n', 'u', 'r'],
  'وطن': ['v', 'æ', 't', 'æ', 'n'],
  'سلام': ['s', 'æ', 'l', 'ɒ', 'm'],
  'درود': ['d', 'o', 'r', 'u', 'd'],
  'سپاس': ['s', 'e', 'p', 'ɒ', 's'],
  'خدا': ['x', 'o', 'd', 'ɒ'],
  'خوبی': ['x', 'u', 'b', 'i'],
  'خواهر': ['x', 'ɒ', 'h', 'æ', 'r'],
  'خواستن': ['x', 'ɒ', 's', 't', 'æ', 'n'],
  'خواندن': ['x', 'ɒ', 'n', 'd', 'æ', 'n'],
  'خویش': ['x', 'i', 'ʃ'],
  'خواب': ['x', 'ɒ', 'b'],
  'خورشید': ['x', 'o', 'r', 'ʃ', 'i', 'd'],
  'است': ['æ', 's', 't'],
  'هست': ['h', 'æ', 's', 't'],
  'نیست': ['n', 'i', 's', 't'],
  'بود': ['b', 'u', 'd'],
  'شد': ['ʃ', 'o', 'd'],
  'برای': ['b', 'æ', 'r', 'ɒ', 'j', 'e'],
  'همیشه': ['h', 'æ', 'm', 'i', 'ʃ', 'e'],
};

/**
 * Returns single phoneme for a Persian character (NEVER appends unprompted 'æ')
 */
export function charToPhoneme(char: string): string[] {
  switch (char) {
    case 'آ':
    case 'ا':
      return ['ɒ'];
    case '\u064E': // َ Fatha
      return ['æ'];
    case '\u0650': // ِ Kasra
      return ['e'];
    case '\u064F': // ُ Damma
      return ['o'];
    case 'ب':
      return ['b'];
    case 'پ':
      return ['p'];
    case 'ت':
    case 'ط':
      return ['t'];
    case 'ث':
    case 'س':
    case 'ص':
      return ['s'];
    case 'ج':
      return ['dʒ'];
    case 'چ':
      return ['tʃ'];
    case 'ح':
    case 'ه':
      return ['h'];
    case 'خ':
      return ['x'];
    case 'د':
      return ['d'];
    case 'ذ':
    case 'ز':
    case 'ض':
    case 'ظ':
      return ['z'];
    case 'ر':
      return ['r'];
    case 'ژ':
      return ['ʒ'];
    case 'ش':
      return ['ʃ'];
    case 'ع':
    case 'ء':
      return ['e'];
    case 'غ':
      return ['ʁ'];
    case 'ف':
      return ['f'];
    case 'ق':
      return ['q'];
    case 'ک':
      return ['k'];
    case 'گ':
      return ['g'];
    case 'ل':
      return ['l'];
    case 'م':
      return ['m'];
    case 'ن':
      return ['n'];
    case 'و':
      return ['u'];
    case 'ی':
    case 'ي':
      return ['i'];
    case ' ':
      return ['pause_short'];
    case '.':
    case '؛':
    case '!':
    case '؟':
    case '?':
      return ['pause_long'];
    default:
      return [];
  }
}

function isVowelPhoneme(p: string): boolean {
  return p === 'æ' || p === 'e' || p === 'o' || p === 'ɒ' || p === 'u' || p === 'i';
}

/**
 * Converts English characters/words into approximate phonetic symbols
 */
export function englishWordToPhonemes(word: string): string[] {
  const w = word.toLowerCase();
  const phonemes: string[] = [];

  for (let i = 0; i < w.length; i++) {
    const c = w[i];
    const next = w[i + 1] || '';

    if (c === 's' && next === 'h') {
      phonemes.push('ʃ');
      i++;
      continue;
    }
    if (c === 'c' && next === 'h') {
      phonemes.push('tʃ');
      i++;
      continue;
    }
    if (c === 'e' && next === 'e') {
      phonemes.push('i');
      i++;
      continue;
    }
    if (c === 'o' && next === 'o') {
      phonemes.push('u');
      i++;
      continue;
    }

    switch (c) {
      case 'a':
        phonemes.push('æ');
        break;
      case 'e':
        phonemes.push('e');
        break;
      case 'i':
        phonemes.push('i');
        break;
      case 'o':
        phonemes.push('o');
        break;
      case 'u':
        phonemes.push('u');
        break;
      case 'b':
        phonemes.push('b');
        break;
      case 'c':
      case 'k':
        phonemes.push('k');
        break;
      case 'd':
        phonemes.push('d');
        break;
      case 'f':
        phonemes.push('f');
        break;
      case 'g':
        phonemes.push('g');
        break;
      case 'h':
        phonemes.push('h');
        break;
      case 'j':
        phonemes.push('dʒ');
        break;
      case 'l':
        phonemes.push('l');
        break;
      case 'm':
        phonemes.push('m');
        break;
      case 'n':
        phonemes.push('n');
        break;
      case 'p':
        phonemes.push('p');
        break;
      case 'r':
        phonemes.push('r');
        break;
      case 's':
        phonemes.push('s');
        break;
      case 't':
        phonemes.push('t');
        break;
      case 'v':
        phonemes.push('v');
        break;
      case 'w':
        phonemes.push('w');
        break;
      case 'y':
        phonemes.push('i');
        break;
      case 'z':
        phonemes.push('z');
        break;
      default:
        break;
    }
  }

  return phonemes;
}

/**
 * Text-to-Phonemes Engine for Persian text
 */
export function textToPhonemeSequence(rawText: string): string[] {
  const enriched = enrichWithDiacritics(rawText);
  const words = enriched.split(/\s+/).filter(Boolean);
  const sequence: string[] = [];

  for (let wIndex = 0; wIndex < words.length; wIndex++) {
    const rawWord = words[wIndex];
    const stripped = stripDiacritics(rawWord).replace(/[.,!?;:()،«»]/g, '');

    // Check Persian Special Dictionary
    if (PERSIAN_SPECIAL_WORDS[stripped]) {
      sequence.push(...PERSIAN_SPECIAL_WORDS[stripped]);
    } else if (/[a-zA-Z]/.test(rawWord)) {
      sequence.push(...englishWordToPhonemes(rawWord));
    } else {
      const wordPhonemes: string[] = [];
      for (let i = 0; i < rawWord.length; i++) {
        const char = rawWord[i];
        const nextChar = rawWord[i + 1];

        // Specific compound characters (خواب -> kh + a + b)
        if (char === 'خ' && nextChar === 'و') {
          const third = rawWord[i + 2];
          if (third === 'ا' || third === 'آ') {
            wordPhonemes.push('x', 'ɒ');
            i += 2;
            continue;
          }
        }

        const phs = charToPhoneme(char);
        wordPhonemes.push(...phs);
      }

      // Add vowel bridges between adjacent consonants so words are pronounceable
      for (let p = 0; p < wordPhonemes.length; p++) {
        const currentPh = wordPhonemes[p];
        const nextPh = wordPhonemes[p + 1];
        sequence.push(currentPh);

        // If two non-pause consonants occur consecutively and no vowel follows
        if (
          !isVowelPhoneme(currentPh) &&
          !currentPh.startsWith('pause') &&
          nextPh &&
          !isVowelPhoneme(nextPh) &&
          !nextPh.startsWith('pause') &&
          p === 0 // only bridge initial cluster
        ) {
          sequence.push('æ');
        }
      }
    }

    // Inter-word breath or pause
    if (wIndex < words.length - 1) {
      if (/[.!?،؛]/.test(rawWord)) {
        sequence.push('pause_long');
      } else {
        sequence.push('pause_short');
      }
    }
  }

  return sequence;
}
