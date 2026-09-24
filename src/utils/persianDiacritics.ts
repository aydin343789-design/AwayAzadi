/**
 * Persian Diacritics, Normalization, and Syllable/Phonetic Enrichment Engine
 * Handles short vowels (َ ِ ُ), long vowels (آ، او، ای), tanwin, and auto-heuristics.
 */

// Diacritic Unicode codepoints
export const DIACRITICS = {
  FATHA: '\u064E', // َ  æ
  DAMMA: '\u064F', // ُ  o
  KASRA: '\u0650', // ِ  e
  SHADDA: '\u0651', // ّ
  SUKUN: '\u0652', // ْ
  TANWIN_FATH: '\u064B', // ً  an
  TANWIN_DAMM: '\u064C', // ٌ  on
  TANWIN_KASR: '\u064D', // ٍ  en
};

/**
 * Standardize Persian characters (unify Ye, Ke, half-spaces, digits)
 */
export function normalizePersianText(input: string): string {
  if (!input) return '';

  return input
    // Arabic Yeh to Persian Ye
    .replace(/ي/g, 'ی')
    // Arabic Kaf to Persian Ke
    .replace(/ك/g, 'ک')
    // Arabic Heh with Yeh above to He + Half-space + Ye
    .replace(/ۀ/g, 'ه‌ی')
    // Arabic Ta Marbuta to Heh or Te based on context
    .replace(/ة/g, 'ت')
    // Zero-width non-joiner normalization
    .replace(/\u200C+/g, '\u200C')
    // Remove tatweel (kashida)
    .replace(/\u0640/g, '')
    // Standardize Persian numbers to Latin or phonetic words
    .replace(/۰/g, '0')
    .replace(/۱/g, '1')
    .replace(/۲/g, '2')
    .replace(/۳/g, '3')
    .replace(/۴/g, '4')
    .replace(/۵/g, '5')
    .replace(/۶/g, '6')
    .replace(/۷/g, '7')
    .replace(/۸/g, '8')
    .replace(/۹/g, '9');
}

/**
 * Heuristic auto-diacritization for common Persian grammatical particles and affixes
 * When words lack explicit harakat, inject phonological helpers for natural synthesis.
 */
export function enrichWithDiacritics(text: string): string {
  let normalized = normalizePersianText(text);

  // Common affixes and clitics
  const replacements: Array<[RegExp, string]> = [
    // Prepositions
    [/\bبه\s+/g, 'بِه '],
    [/\bاز\s+/g, 'اَز '],
    [/\bبر\s+/g, 'بَر '],
    [/\bدر\s+/g, 'دَر '],
    [/\bکه\s+/g, 'کِه '],
    [/\bچه\s+/g, 'چِه '],
    [/\bبا\s+/g, 'با '],
    [/\bبرای\s+/g, 'بَرایِ '],
    [/\bاگر\s+/g, 'اَگَر '],
    [/\bاما\s+/g, 'اَمّا '],
    [/\bهم\s+/g, 'هَم '],
    [/\bیک\s+/g, 'یِک '],
    [/\bاین\s+/g, 'این '],
    [/\bآن\s+/g, 'آن '],
    [/\bاو\s+/g, 'او '],
    [/\bما\s+/g, 'ما '],
    [/\bشما\s+/g, 'شُما '],
    [/\bایشان\s+/g, 'ایشْان '],
    [/\bآنها\s+/g, 'آن‌ها '],
    [/\bمن\s+/g, 'مَن '],
    [/\bتو\s+/g, 'تو '],

    // Common verbs
    [/\bمی‌([^\s]+)/g, 'می‌$1'], // Keep mi- prefix clean
    [/\bنمی‌([^\s]+)/g, 'نِمی‌$1'],
    [/\bشد\b/g, 'شُد'],
    [/\bشده\b/g, 'شُدِه'],
    [/\bشدن\b/g, 'شُدَن'],
    [/\bبود\b/g, 'بود'],
    [/\bبودن\b/g, 'بودَن'],
    [/\bاست\b/g, 'اَسْت'],
    [/\bهست\b/g, 'هَسْت'],
    [/\bنیست\b/g, 'نیسْت'],
    [/\bکرد\b/g, 'کَرد'],
    [/\bکردن\b/g, 'کَردَن'],
    [/\bکرده\b/g, 'کَردِه'],
    [/\bگفت\b/g, 'گُفْت'],
    [/\bگفتن\b/g, 'گُفْتَن'],
    [/\bداد\b/g, 'داد'],
    [/\bدادن\b/g, 'دادَن'],
    [/\bرفت\b/g, 'رَفْت'],
    [/\bرفتن\b/g, 'رَفْتَن'],
    [/\bآمد\b/g, 'آمَد'],
    [/\bآمدن\b/g, 'آمَدَن'],

    // Common words
    [/\bایران\b/g, 'ایران'],
    [/\bآزاد\b/g, 'آزاد'],
    [/\bآزادی\b/g, 'آزادی'],
    [/\bزن\b/g, 'زَن'],
    [/\bزندگی\b/g, 'زِندِگی'],
    [/\bمیهن\b/g, 'میهَن'],
    [/\bمردم\b/g, 'مَردُم'],
    [/\bکشور\b/g, 'کِشوَر'],
    [/\bجهان\b/g, 'جَهان'],
    [/\bسلام\b/g, 'سَلام'],
    [/\bدرود\b/g, 'دُرود'],
    [/\bخوب\b/g, 'خوب'],
    [/\bسپاس\b/g, 'سِپاس'],
    [/\bامید\b/g, 'اُمید'],
    [/\bنور\b/g, 'نور'],
    [/\bعشق\b/g, 'عِشْق'],
  ];

  for (const [regex, replacement] of replacements) {
    normalized = normalized.replace(regex, replacement);
  }

  return normalized;
}

/**
 * Remove all diacritics if clean text without harakat is needed
 */
export function stripDiacritics(text: string): string {
  return text.replace(/[\u064B-\u065F\u0670]/g, '');
}
