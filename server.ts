import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import { EdgeTTS } from 'node-edge-tts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;

function cleanAndPunctuatePersian(input: string): string {
  let text = input
    .replace(/ي/g, 'ی').replace(/ى/g, 'ی').replace(/ك/g, 'ک')
    .replace(/ة/g, 'ت').replace(/ۀ/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ی')
    .replace(/[?]/g, '؟').replace(/[,]/g, '،').replace(/[;]/g, '؛')
    .replace(/[«»“”]/g, '').replace(/[\u200B\uFEFF]/g, '').replace(/\u200D/g, '')
    .replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ')
    .replace(/\s+([،؛؟!:.])/g, '$1').trim();
  if (text && !/[.!؟!؛…]$/.test(text)) text += '.';
  return text;
}

function signed(value: number, suffix: string): string {
  return `${value >= 0 ? '+' : ''}${value}${suffix}`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true, engine: 'microsoft-edge-neural', voices: ['fa-IR-DilaraNeural', 'fa-IR-FaridNeural'] }));

  app.post('/api/tts', async (req, res) => {
    let tempFile = '';
    try {
      const { text, voice = 'female', emotion = 'normal', rate = 0, pitch = 0 } = req.body ?? {};
      if (typeof text !== 'string' || !text.trim()) return res.status(400).json({ error: 'متنی ارسال نشده است' });

      const selectedVoice = voice === 'male' ? 'fa-IR-FaridNeural' : 'fa-IR-DilaraNeural';
      // Conservative prosody is more natural than large pitch/rate jumps.
      const emotionProfile: Record<string, [number, number]> = {
        normal: [0, 0], news: [-2, -1], emotional: [-6, 2], happy: [5, 5], sad: [-8, -5], excited: [8, 7],
      };
      const [emotionRate, emotionPitch] = emotionProfile[emotion] ?? emotionProfile.normal;
      const childAdjust = voice === 'child' ? [4, 8] : [0, 0];
      const finalRate = Math.max(-35, Math.min(35, emotionRate + childAdjust[0] + (Number(rate) || 0)));
      const finalPitch = Math.max(-20, Math.min(20, emotionPitch + childAdjust[1] + (Number(pitch) || 0)));
      const processedText = cleanAndPunctuatePersian(text);

      tempFile = path.join(os.tmpdir(), `tts-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp3`);
      const tts = new EdgeTTS({
        voice: selectedVoice,
        rate: signed(finalRate, '%'),
        pitch: signed(finalPitch, 'Hz'),
        outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
      });
      await tts.ttsPromise(processedText, tempFile);
      const audioBuffer = await fs.promises.readFile(tempFile);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioBuffer.length);
      res.setHeader('Cache-Control', 'no-store');
      return res.send(audioBuffer);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Error in /api/tts:', msg);
      return res.status(500).json({ error: 'خطا در سنتز صدا با موتور عصبی', details: msg });
    } finally {
      if (tempFile) await fs.promises.unlink(tempFile).catch(() => {});
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => res.sendFile(path.resolve(__dirname, 'dist', 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`Server listening on http://0.0.0.0:${PORT}`));
}

startServer().catch((err) => { console.error('Failed to start server:', err); process.exit(1); });
