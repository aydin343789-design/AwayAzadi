import { EmotionType, VoiceType } from '../types/tts';
import { preparePersianSpeechText } from '../utils/persianNormalizer';

export interface NeuralSpeechOptions {
  text: string;
  voice: VoiceType;
  emotion: EmotionType;
  rate?: number;
  pitch?: number;
}

const SERVER_URL_KEY = 'awa_tts_server_url';

/** URL can be configured for a packaged APK; web builds continue to use same-origin. */
export function getNeuralServerUrl(): string {
  if (typeof window === 'undefined') return '';
  return (localStorage.getItem(SERVER_URL_KEY) || '').trim().replace(/\/$/, '');
}

export function setNeuralServerUrl(url: string): void {
  if (typeof window === 'undefined') return;
  const clean = url.trim().replace(/\/$/, '');
  if (clean) localStorage.setItem(SERVER_URL_KEY, clean);
  else localStorage.removeItem(SERVER_URL_KEY);
}

export async function synthesizeNeuralSpeech(options: NeuralSpeechOptions): Promise<Blob> {
  const { text, voice, emotion, rate = 0, pitch = 0 } = options;
  const normalizedText = preparePersianSpeechText(text);
  if (!normalizedText) throw new Error('متنی برای تولید صدا وارد نشده است.');

  const baseUrl = getNeuralServerUrl();
  const response = await fetch(`${baseUrl}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: normalizedText, voice, emotion, rate, pitch }),
  });

  if (!response.ok) {
    let errMessage = `خطای سرور صوتی (${response.status})`;
    try {
      const errJson = await response.json();
      if (errJson?.error) errMessage = `${errJson.error}${errJson.details ? `: ${errJson.details}` : ''}`;
    } catch { /* non-JSON server error */ }
    throw new Error(errMessage);
  }

  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength < 100) throw new Error('فایل صوتی دریافت‌شده نامعتبر است.');
  return new Blob([arrayBuffer], { type: 'audio/mpeg' });
}
