import { EmotionType, ElevenLabsVoice, VoiceType } from '../types/tts';

export const DEFAULT_ELEVENLABS_VOICES: ElevenLabsVoice[] = [
  {
    voice_id: 'pNInz6obpgDQGcFmaJgB',
    name: 'آدام (Adam) - مرد پرطنین',
    category: 'premade',
    labels: { gender: 'male', accent: 'persian/english' },
  },
  {
    voice_id: '21m00Tcm4TlvDq8ikWAM',
    name: 'ریچل (Rachel) - زن آرام و شفاف',
    category: 'premade',
    labels: { gender: 'female', accent: 'persian/english' },
  },
  {
    voice_id: 'ErXwobaYiN019PkySvjV',
    name: 'آنتونی (Antoni) - مرد رسمی و خبری',
    category: 'premade',
    labels: { gender: 'male', accent: 'persian/english' },
  },
  {
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'بلا (Bella) - زن احساسی و پرانرژی',
    category: 'premade',
    labels: { gender: 'female', accent: 'persian/english' },
  },
  {
    voice_id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'جاش (Josh) - جوان و صمیمی (کودک/نوجوان)',
    category: 'premade',
    labels: { gender: 'child', accent: 'persian/english' },
  },
];

export function getVoiceIdForType(voice: VoiceType, preferredVoiceId?: string): string {
  if (preferredVoiceId && preferredVoiceId.trim()) return preferredVoiceId;
  switch (voice) {
    case 'male':
      return 'pNInz6obpgDQGcFmaJgB'; // Adam
    case 'female':
      return '21m00Tcm4TlvDq8ikWAM'; // Rachel
    case 'child':
      return 'TxGEqnHWrfWFTfGW9XjX'; // Josh
    default:
      return 'pNInz6obpgDQGcFmaJgB';
  }
}

export function getEmotionVoiceSettings(emotion: EmotionType) {
  switch (emotion) {
    case 'news':
      return { stability: 0.75, similarity_boost: 0.85, style: 0.15, use_speaker_boost: true };
    case 'emotional':
      return { stability: 0.35, similarity_boost: 0.8, style: 0.65, use_speaker_boost: true };
    case 'happy':
      return { stability: 0.45, similarity_boost: 0.75, style: 0.5, use_speaker_boost: true };
    case 'sad':
      return { stability: 0.6, similarity_boost: 0.7, style: 0.4, use_speaker_boost: true };
    case 'excited':
      return { stability: 0.3, similarity_boost: 0.8, style: 0.75, use_speaker_boost: true };
    case 'normal':
    default:
      return { stability: 0.5, similarity_boost: 0.75, style: 0.25, use_speaker_boost: true };
  }
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
      return data.voices.map((v: { voice_id: string; name: string; category?: string }) => ({
        voice_id: v.voice_id,
        name: v.name,
        category: v.category,
      }));
    }
    return DEFAULT_ELEVENLABS_VOICES;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error('عدم امکان برقراری ارتباط با سرویس ElevenLabs');
  }
}

/**
 * Synthesize speech using ElevenLabs Multilingual v2
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
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: voiceSettings,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('کلید API الون‌لبز نامعتبر یا منقضی است. لطفاً کلید صحیح را در منو وارد کنید.');
      }
      if (response.status === 429) {
        throw new Error('سهمیه کاراکتر رایگان حساب ElevenLabs به پایان رسیده است.');
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
