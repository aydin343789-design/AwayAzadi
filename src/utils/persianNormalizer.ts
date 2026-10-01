/**
 * Persian speech text preparation.
 * The goal is to preserve Persian orthography while removing characters that
 * make neural voices stumble, and to make numbers/punctuation unambiguous.
 */

const DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const PERSIAN_DIGITS_MAP: Record<string, string> = {
  '0': 'صفر', '1': 'یک', '2': 'دو', '3': 'سه', '4': 'چهار',
  '5': 'پنج', '6': 'شش', '7': 'هفت', '8': 'هشت', '9': 'نه',
  '۰': 'صفر', '۱': 'یک', '۲': 'دو', '۳': 'سه', '۴': 'چهار',
  '۵': 'پنج', '۶': 'شش', '۷': 'هفت', '۸': 'هشت', '۹': 'نه',
};

const TEENS: Record<string, string> = {
  '10': 'ده', '11': 'یازده', '12': 'دوازده', '13': 'سیزده', '14': 'چهارده',
  '15': 'پانزده', '16': 'شانزده', '17': 'هفده', '18': 'هجده', '19': 'نوزده',
};
const TENS: Record<string, string> = {
  '2': 'بیست', '3': 'سی', '4': 'چهل', '5': 'پنجاه', '6': 'شصت',
  '7': 'هفتاد', '8': 'هشتاد', '9': 'نود',
};
const HUNDREDS: Record<string, string> = {
  '1': 'صد', '2': 'دویست', '3': 'سیصد', '4': 'چهارصد', '5': 'پانصد',
  '6': 'ششصد', '7': 'هفتصد', '8': 'هشتصد', '9': 'نهصد',
};

export function numberToPersianWords(numStr: string): string {
  const normalized = numStr.replace(/[۰-۹]/g, (d) => String(DIGITS.indexOf(d)));
  const n = Number.parseInt(normalized, 10);
  if (!Number.isFinite(n)) return numStr;
  if (n === 0) return 'صفر';
  if (n < 0) return `منفی ${numberToPersianWords(String(-n))}`;
  if (n < 10) return PERSIAN_DIGITS_MAP[String(n)];
  if (n < 20) return TEENS[String(n)];
  if (n < 100) {
    const ten = Math.floor(n / 10);
    const rem = n % 10;
    return rem ? `${TENS[String(ten)]} و ${PERSIAN_DIGITS_MAP[String(rem)]}` : TENS[String(ten)];
  }
  if (n < 1000) {
    const hundred = Math.floor(n / 100);
    const rem = n % 100;
    return rem ? `${HUNDREDS[String(hundred)]} و ${numberToPersianWords(String(rem))}` : HUNDREDS[String(hundred)];
  }
  if (n < 1_000_000) {
    const thousand = Math.floor(n / 1000);
    const rem = n % 1000;
    const prefix = `${numberToPersianWords(String(thousand))} هزار`;
    return rem ? `${prefix} و ${numberToPersianWords(String(rem))}` : prefix;
  }
  return numStr;
}

export function preparePersianSpeechText(rawText: string): string {
  if (!rawText) return '';

  let text = rawText
    // Arabic variants → standard Persian. Keep «آ»; replacing it with «ا» damages pronunciation.
    .replace(/ي/g, 'ی').replace(/ى/g, 'ی').replace(/ك/g, 'ک')
    .replace(/ة/g, 'ت').replace(/ۀ/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ی')
    .replace(/[?]/g, '؟').replace(/[,]/g, '،').replace(/[;]/g, '؛')
    .replace(/[«»“”]/g, '').replace(/…/g, '...')
    .replace(/[\u200B\uFEFF]/g, '')
    // Keep half-space: it is linguistically correct and Edge voices handle it better than a hard split.
    .replace(/\u200D/g, '')
    .replace(/\r\n?/g, '\n');

  // Convert standalone numbers, but leave digits inside latin identifiers/URLs untouched.
  text = text.replace(/(?<![A-Za-z\u0600-\u06FF])[-+]?\d{1,6}(?![A-Za-z\u0600-\u06FF])/g, (m) => numberToPersianWords(m));
  text = text.replace(new RegExp(`(?<![A-Za-z\u0600-\u06FF])[-+]?[$\{DIGITS}]{1,6}(?![A-Za-z\u0600-\u06FF])`, 'g'), (m) => numberToPersianWords(m));

  // Preserve paragraph/sentence boundaries as deliberate pauses instead of flattening the text.
  text = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  text = text.replace(/\s+([،؛؟!:.])/g, '$1');
  if (text && !/[.!؟!؛…]$/.test(text)) text += '.';
  return text;
}
