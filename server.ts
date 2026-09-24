import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import { EdgeTTS } from 'node-edge-tts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Text preparation for standard Iranian Persian
function cleanAndPunctuatePersian(input: string): string {
  if (!input) return '';
  let str = input
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ت')
    .replace(/ۀ/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ی')
    .replace(/,/g, '،')
    .replace(/\?/g, '؟')
    .replace(/[«»"]/g, '')
    .replace(/[\u200B\uFEFF]/g, '')
    .replace(/[\u200C\u200D]/g, ' ')
    .trim();

  // Ensure end of sentence has terminal punctuation for proper intonation
  if (!/[.!?؟،؛]$/.test(str)) {
    str += '.';
  }
  return str;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // High-Quality Iranian Neural TTS API (No VPN needed, 100% fluent standard Persian)
  app.post('/api/tts', async (req, res) => {
    try {
      const {
        text,
        voice = 'female',
        emotion = 'normal',
        rate = 0,
        pitch = 0,
      } = req.body;

      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'متنی ارسال نشده است' });
      }

      // Map voice to Microsoft Persian Neural Models
      // Dilara (زن) & Farid (مرد)
      let selectedNeuralVoice = 'fa-IR-DilaraNeural';
      let targetPitch = 0;
      let targetRate = 0;

      if (voice === 'male') {
        selectedNeuralVoice = 'fa-IR-FaridNeural';
      } else if (voice === 'child') {
        selectedNeuralVoice = 'fa-IR-DilaraNeural';
        targetPitch += 34;
        targetRate += 10;
      } else {
        selectedNeuralVoice = 'fa-IR-DilaraNeural';
      }

      // Enhanced Emotion Prosody
      switch (emotion) {
        case 'news':
          // رسمی و خبری: لحن استوار، شمرده و بدون نوسان شدید
          targetRate += 6;
          targetPitch -= 2;
          break;
        case 'emotional':
          // احساسی و صمیمی: ضرب‌آهنگ آرام، گرم و پرمحبت
          targetRate -= 10;
          targetPitch += 5;
          break;
        case 'happy':
          // شاد و پرانرژی: لحن نشاط‌آور و ریتم صعودی
          targetRate += 12;
          targetPitch += 16;
          break;
        case 'sad':
          // غمگین و آرام: افت سرعت، فرود لحن و مکث‌های عمیق‌تر
          targetRate -= 18;
          targetPitch -= 14;
          break;
        case 'excited':
          // هیجان‌زده و حماسی: پرتوان، پرشور و سریع
          targetRate += 18;
          targetPitch += 20;
          break;
        case 'normal':
        default:
          targetRate += 0;
          targetPitch += 0;
          break;
      }

      // User custom adjustments
      targetRate += Number(rate) || 0;
      targetPitch += Number(pitch) || 0;

      // Bound rates and pitches to valid Edge TTS ranges
      const clampedRate = Math.max(-50, Math.min(100, targetRate));
      const clampedPitch = Math.max(-50, Math.min(50, targetPitch));

      const rateStr = (clampedRate >= 0 ? `+${clampedRate}` : `${clampedRate}`) + '%';
      const pitchStr = (clampedPitch >= 0 ? `+${clampedPitch}` : `${clampedPitch}`) + 'Hz';

      const processedText = cleanAndPunctuatePersian(text);

      const tempFile = path.join(
        os.tmpdir(),
        `tts-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.mp3`
      );

      const tts = new EdgeTTS({
        voice: selectedNeuralVoice,
        rate: rateStr,
        pitch: pitchStr,
        outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
      });

      await tts.ttsPromise(processedText, tempFile);

      if (!fs.existsSync(tempFile)) {
        throw new Error('فایل صوتی تولید نشد');
      }

      const audioBuffer = await fs.promises.readFile(tempFile);
      await fs.promises.unlink(tempFile).catch(() => {});

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.send(audioBuffer);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Error in /api/tts:', msg);
      return res.status(500).json({
        error: 'خطا در سنتز صدا با موتور عصبی',
        details: msg,
      });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
