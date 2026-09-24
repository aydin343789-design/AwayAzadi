import { EmotionType, ElevenLabsVoice, VoiceType } from '../types/tts';

export const CURATED_PERSIAN_ELEVENLABS_VOICES: ElevenLabsVoice[] = [
  {
    voice_id: 'CwhRBWXzGAHq8TQ4Fs17',
    name: 'راجر (Roger) - مرد رسمی، راوی شیوا و بدون لهجه',
    category: 'premade',
    labels: { gender: 'male', accent: 'persian-recommended' },
  },
  {
    voice_id: 'nPczCjzI2devNBz1zQrb',
    name: 'برایان (Brian) - مرد بم، عمیق و مناسب پادکست',
    category: 'premade',
    labels: { gender: 'male', accent: 'persian-recommended' },
  },
  {
    voice_id: 'Xb7hH8MSUJpSbSDYk0k2',
    name: 'آلیس (Alice) - زن جوان، با احساس و صمیمی',
    category: 'premade',
    labels: { gender: 'female', accent: 'persian-recommended' },
  },
  {
    voice_id: '21m00Tcm4TlvDq8ikWAM',
    name: 'ریچل (Rachel) - زن آرام، شیوا و شفاف',
    category: 'premade',
    labels: { gender: 'female', accent: 'persian-recommended' },
  },
  {
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'بلا (Bella) - زن پرانرژی و هیجان‌انگیز',
    category: 'premade',
    labels: { gender: 'female', accent: 'persian-recommended' },
  },
  {
    voice_id: 'JBFqnCBsd6RMkjVDRZzb',
    name: 'جورج (George) - مرد گرم، رادیویی و کلاسیک',
    category: 'premade',
    labels: { gender: 'male', accent: 'persian-recommended' },
  },
  {
    voice_id: 'onwK4e9ZLuTAKqWW03F9',
    name: 'دنیل (Daniel) - جوان، محاوره‌ای و شاد (کودک/نوجوان)',
    category: 'premade',
    labels: { gender: 'child', accent: 'persian-recommended' },
  },
];

export const DEFAULT_ELEVENLABS_VOICES: ElevenLabsVoice[] = CURATED_PERSIAN_ELEVENLABS_VOICES;

export function getVoiceIdForType(voice: VoiceType, preferredVoiceId?: string): string {
  if (preferredVoiceId && preferredVoiceId.trim()) return preferredVoiceId.trim();
  switch (voice) {
    case 'male':
      return 'CwhRBWXzGAHq8TQ4Fs17'; // Roger
    case 'female':
      return 'Xb7hH8MSUJpSbSDYk0k2'; // Alice
    case 'child':
      return 'onwK4e9ZLuTAKqWW03F9'; // Daniel
    default:
      return 'CwhRBWXzGAHq8TQ4Fs17';
  }
}

/**
 * Optimized voice settings for standard Iranian Persian (Farsi)
 * Prevents Kurdish/Afghan accent drift by preserving high stability and similarity
 */
export function getEmotionVoiceSettings(emotion: EmotionType) {
  switch (emotion) {
    case 'news':
      return { stability: 0.75, similarity_boost: 0.88, style: 0.12, use_speaker_boost: true };
    case 'emotional':
      return { stability: 0.55, similarity_boost: 0.82, style: 0.35, use_speaker_boost: true };
    case 'happy':
      return { stability: 0.58, similarity_boost: 0.82, style: 0.30, use_speaker_boost: true };
    case 'sad':
      return { stability: 0.70, similarity_boost: 0.78, style: 0.22, use_speaker_boost: true };
    case 'excited':
      return { stability: 0.52, similarity_boost: 0.85, style: 0.40, use_speaker_boost: true };
    case 'normal':
    default:
      return { stability: 0.68, similarity_boost: 0.85, style: 0.20, use_speaker_boost: true };
  }
}

/**
 * Normalizes Persian characters and removes Arabic phoneme substitutions
 * so ElevenLabs doesn't misread Persian words
 */
export function normalizePersianForTTS(input: string): string {
  return input
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ت')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ی')
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetch available voices using the user's ElevenLabs API key
 */
export async function fetchElevenLabsVoices(apiKey: string): Promise<ElevenLabsVoice[]> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) return DEFAULT_ELEVENLABS_VOICES;

  try {
    const res = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': cleanKey,
      },
    });

    if (res.status === 401) {
      throw new Error('کلید API وارد شده برای ElevenLabs نامعتبر است.');
    }

    if (!res.ok) {
      throw new Error(`خطای دریافت صداها از ElevenLabs (کد ${res.status})`);
    }

    const data = await res.json();
    if (Array.isArray(data.voices) && data.voices.length > 0) {
      const userVoices: ElevenLabsVoice[] = data.voices.map(
        (v: { voice_id: string; name: string; category?: string }) => ({
          voice_id: v.voice_id,
          name: v.name,
          category: v.category,
        })
      );

      // Merge user custom voices first, followed by curated voices
      const combined = [...userVoices];
      for (const cur of CURATED_PERSIAN_ELEVENLABS_VOICES) {
        if (!combined.some((v) => v.voice_id === cur.voice_id)) {
          combined.push(cur);
        }
      }
      return combined;
    }
    return DEFAULT_ELEVENLABS_VOICES;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error('عدم امکان برقراری ارتباط با سرویس ElevenLabs');
  }
}

/**
 * Synthesize speech using ElevenLabs Multilingual v2 with locked Iranian Persian language code
 */
export async function synthesizeWithElevenLabs(
  text: string,
  apiKey: string,
  voiceId: string,
  emotion: EmotionType
): Promise<Blob> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error('کلید API الون‌لبز وارد نشده است.');
  }

  const normalizedText = normalizePersianForTTS(text);
  const voiceSettings = getEmotionVoiceSettings(emotion);

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': cleanKey,
        },
        body: JSON.stringify({
          text: normalizedText,
          model_id: 'eleven_multilingual_v2',
          // Explicitly lock to Persian language so ElevenLabs doesn't use Kurdish/Dari/Pashto accents!
          language_code: 'fa',
          voice_settings: voiceSettings,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('کلید API الون‌لبز نامعتبر یا منقضی است. لطفاً کلید صحیح را در بخش تنظیمات وارد کنید.');
      }
      if (response.status === 429) {
        throw new Error('سهمیه کاراکتر حساب ElevenLabs به پایان رسیده است.');
      }

      let errDetail = `کد ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson?.detail?.message) {
          errDetail = errJson.detail.message;
        }
      } catch {
        // Fallback
      }
      throw new Error(`خطای سرور ElevenLabs: ${errDetail}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength < 100) {
      throw new Error('پاسخ صوتی نامعتبر از ElevenLabs دریافت شد.');
    }

    return new Blob([arrayBuffer], { type: 'audio/mpeg' });
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error('عدم امکان اتصال به سرویس تبدیل صدای ElevenLabs');
  }
}
