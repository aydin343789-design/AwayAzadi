/**
 * High-precision Persian text normalizer for natural, fluent Speech Synthesis.
 * Resolves pronunciation issues, accent drift, and numbers misreading.
 */

const PERSIAN_DIGITS_MAP: Record<string, string> = {
  '0': 'صفر',
  '1': 'یک',
  '2': 'دو',
  '3': 'سه',
  '4': 'چهار',
  '5': 'پنج',
  '6': 'شش',
  '7': 'هفت',
  '8': 'هشت',
  '9': 'نه',
  '۰': 'صفر',
  '۱': 'یک',
  '۲': 'دو',
  '۳': 'سه',
  '۴': 'چهار',
  '۵': 'پنج',
  '۶': 'شش',
  '۷': 'هفت',
  '۸': 'هشت',
  '۹': 'نه',
};

const TEENS: Record<string, string> = {
  '10': 'ده',
  '11': 'یازده',
  '12': 'دوازده',
  '13': 'سیزده',
  '14': 'چهارده',
  '15': 'پانزده',
  '16': 'شانزده',
  '17': 'هفده',
  '18': 'هجده',
  '19': 'نوزده',
};

const TENS: Record<string, string> = {
  '2': 'بیست',
  '3': 'سی',
  '4': 'چهل',
  '5': 'پنجاه',
  '6': 'شصت',
  '7': 'هفتاد',
  '8': 'هشتاد',
  '9': 'نود',
};

const HUNDREDS: Record<string, string> = {
  '1': 'صد',
  '2': 'دویست',
  '3': 'سیصد',
  '4': 'چهارصد',
  '5': 'پانصد',
  '6': 'ششصد',
  '7': 'هفتصد',
  '8': 'هشتصد',
  '9': 'نهصد',
};

export function numberToPersianWords(numStr: string): string {
  const n = parseInt(numStr.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))), 10);
  if (isNaN(n)) return numStr;
  if (n === 0) return 'صفر';
  if (n < 0) return 'منفی ' + numberToPersianWords(String(-n));

  if (n < 10) return PERSIAN_DIGITS_MAP[String(n)] || String(n);
  if (n >= 10 && n < 20) return TEENS[String(n)] || String(n);
  if (n < 100) {
    const ten = Math.floor(n / 10);
    const rem = n % 10;
    return rem === 0 ? TENS[String(ten)] : `${TENS[String(ten)]} و ${PERSIAN_DIGITS_MAP[String(rem)]}`;
  }
  if (n < 1000) {
    const hun = Math.floor(n / 100);
    const rem = n % 100;
    return rem === 0 ? HUNDREDS[String(hun)] : `${HUNDREDS[String(hun)]} و ${numberToPersianWords(String(rem))}`;
  }
  if (n < 1000000) {
    const thou = Math.floor(n / 1000);
    const rem = n % 1000;
    const thouWord = `${numberToPersianWords(String(thou))} هزار`;
    return rem === 0 ? thouWord : `${thouWord} و ${numberToPersianWords(String(rem))}`;
  }
  return numStr;
}

/**
 * Normalizes text for Persian speech synthesis
 */
export function preparePersianSpeechText(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // 1. Convert Arabic specific letters to Persian standard letters
  text = text
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ت')
    .replace(/ۀ/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ی')
    .replace(/إ|أ|آ/g, 'ا');

  // 2. Normalize punctuation for Persian cadence
  text = text
    .replace(/\?/g, '؟')
    .replace(/,/g, '،')
    .replace(/;/g, '؛')
    .replace(/[«»"]/g, '')
    .replace(/…/g, '...');

  // 3. Convert numbers to words so the engine doesn't read them in English or with accents
  text = text.replace(/\b\d{1,6}\b/g, (match) => {
    return numberToPersianWords(match);
  });
  text = text.replace(/[۰-۹]{1,6}/g, (match) => {
    return numberToPersianWords(match);
  });

  // 4. Clean invisible and zero-width characters
  text = text.replace(/[\u200B\uFEFF]/g, '');
  text = text.replace(/[\u200C\u200D]/g, ' '); // Half-space to subtle space for neural phoneme separation

  // 5. Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}
