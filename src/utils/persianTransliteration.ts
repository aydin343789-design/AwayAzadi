import { enrichWithDiacritics, stripDiacritics } from './persianDiacritics';

const COMMON_WORDS_PHONETIC: Record<string, string> = {
  'ایران': 'Iraan',
  'آزاد': 'Aazaad',
  'آزادی': 'Aazaadi',
  'زن': 'Zan',
  'زندگی': 'Zendegi',
  'میهن': 'Mihan',
  'مردم': 'Mardom',
  'صلح': 'Solh',
  'عشق': 'Eshgh',
  'امید': 'Omid',
  'نور': 'Noor',
  'وطن': 'Vatan',
  'سلام': 'Salaam',
  'درود': 'Dorood',
  'سپاس': 'Sepaas',
  'خدا': 'Khodaa',
  'خوب': 'Khoob',
  'خوبی': 'Khoobi',
  'خواهر': 'Khaahar',
  'خواستن': 'Khaastan',
  'خواندن': 'Khaandan',
  'خویش': 'Kheesh',
  'خواب': 'Khaab',
  'خورشید': 'Khorshid',
  'است': 'Ast',
  'هست': 'Hast',
  'نیست': 'Neest',
  'بود': 'Bood',
  'شد': 'Shod',
  'برای': 'Baraaye',
  'همیشه': 'Hamisheh',
  'همه': 'Hameh',
  'یک': 'Yek',
  'این': 'Een',
  'آن': 'Aan',
  'او': 'Oo',
  'ما': 'Maa',
  'شما': 'Shomaa',
  'من': 'Man',
  'تو': 'To',
  'به': 'Be',
  'از': 'Az',
  'در': 'Dar',
  'با': 'Baa',
  'بر': 'Bar',
  'که': 'Ke',
  'چه': 'Che',
  'روز': 'Rooz',
  'شب': 'Shab',
  'دل': 'Del',
  'دست': 'Dast',
  'چشم': 'Cheshm',
  'جان': 'Jaan',
  'جهان': 'Jahaan',
  'کشور': 'Keshvar',
  'نام': 'Naam',
  'صدا': 'Sedaa',
  'آوا': 'Aavaa',
};

/**
 * Transliterates Persian text into natural phonetic Latin (Pinglish)
 * so that any standard local text-to-speech engine can clearly pronounce it.
 */
export function persianToPhoneticLatin(rawText: string): string {
  if (!rawText.trim()) return '';

  const enriched = enrichWithDiacritics(rawText);
  const words = enriched.split(/\s+/);
  const resultWords: string[] = [];

  for (const word of words) {
    if (!word) continue;

    const punctuationMatch = word.match(/([.,!?;:()،«»؟]+)$/);
    const punctuation = punctuationMatch ? punctuationMatch[1] : '';
    const cleanWord = word.replace(/[.,!?;:()،«»؟]/g, '');
    const stripped = stripDiacritics(cleanWord);

    // If English word, keep as is
    if (/^[a-zA-Z0-9]+$/.test(cleanWord)) {
      resultWords.push(word);
      continue;
    }

    // Check predefined frequent words
    if (COMMON_WORDS_PHONETIC[stripped]) {
      resultWords.push(COMMON_WORDS_PHONETIC[stripped] + (punctuation ? convertPunctuation(punctuation) : ''));
      continue;
    }

    // Character by character phonetic parsing
    let phonetic = '';
    const len = cleanWord.length;

    for (let i = 0; i < len; i++) {
      const char = cleanWord[i];
      const next = cleanWord[i + 1] || '';
      const prev = cleanWord[i - 1] || '';

      // Silent Vav in Persian (خوا)
      if (char === 'خ' && next === 'و' && (cleanWord[i + 2] === 'ا' || cleanWord[i + 2] === 'آ')) {
        phonetic += 'khaa';
        i += 2;
        continue;
      }

      switch (char) {
        case 'آ':
          phonetic += 'aa';
          break;
        case 'ا':
          if (i === 0) {
            if (next === '\u064E') phonetic += 'a';
            else if (next === '\u0650') phonetic += 'e';
            else if (next === '\u064F') phonetic += 'o';
            else phonetic += 'a';
          } else {
            phonetic += 'aa';
          }
          break;
        case '\u064E': // َ
          phonetic += 'a';
          break;
        case '\u0650': // ِ
          phonetic += 'e';
          break;
        case '\u064F': // ُ
          phonetic += 'o';
          break;
        case 'ب':
          phonetic += 'b';
          break;
        case 'پ':
          phonetic += 'p';
          break;
        case 'ت':
        case 'ط':
          phonetic += 't';
          break;
        case 'ث':
        case 'س':
        case 'ص':
          phonetic += 's';
          break;
        case 'ج':
          phonetic += 'j';
          break;
        case 'چ':
          phonetic += 'ch';
          break;
        case 'ح':
        case 'ه':
          phonetic += 'h';
          break;
        case 'خ':
          phonetic += 'kh';
          break;
        case 'د':
          phonetic += 'd';
          break;
        case 'ذ':
        case 'ز':
        case 'ض':
        case 'ظ':
          phonetic += 'z';
          break;
        case 'ر':
          phonetic += 'r';
          break;
        case 'ژ':
          phonetic += 'zh';
          break;
        case 'ش':
          phonetic += 'sh';
          break;
        case 'ع':
        case 'ء':
          if (i === 0) phonetic += 'a';
          break;
        case 'غ':
        case 'ق':
          phonetic += 'gh';
          break;
        case 'ف':
          phonetic += 'f';
          break;
        case 'ک':
          phonetic += 'k';
          break;
        case 'گ':
          phonetic += 'g';
          break;
        case 'ل':
          phonetic += 'l';
          break;
        case 'م':
          phonetic += 'm';
          break;
        case 'ن':
          phonetic += 'n';
          break;
        case 'و':
          if (i === 0) {
            phonetic += 'v';
          } else if (isConsonant(prev)) {
            phonetic += 'oo';
          } else {
            phonetic += 'v';
          }
          break;
        case 'ی':
          if (i === 0) {
            phonetic += 'y';
          } else if (isConsonant(prev)) {
            phonetic += 'ee';
          } else {
            phonetic += 'y';
          }
          break;
        default:
          break;
      }

      // If two consonants are together without a vowel, add a subtle transition vowel 'a' or 'e'
      if (isConsonant(char) && isConsonant(next) && next !== 'و' && next !== 'ی' && next !== 'ا' && next !== 'آ') {
        // e.g. "مرد" -> m-a-r-d
        if (i === 0 && len <= 3) {
          phonetic += 'a';
        }
      }
    }

    resultWords.push(phonetic + (punctuation ? convertPunctuation(punctuation) : ''));
  }

  return resultWords.join(' ');
}

function isConsonant(char: string): boolean {
  return /[بتپثجچحخدذرزژسشصضطظعغفقکگلمنه]/.test(char);
}

function convertPunctuation(p: string): string {
  return p.replace(/،/g, ',').replace(/؛/g, ';').replace(/؟/g, '?');
}
