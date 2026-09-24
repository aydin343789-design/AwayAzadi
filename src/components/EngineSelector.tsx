import React, { useState } from 'react';
import {
  Sparkles,
  Wifi,
  WifiOff,
  Key,
  Eye,
  EyeOff,
  Check,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { ActiveEngineMode, ElevenLabsVoice } from '../types/tts';

interface EngineSelectorProps {
  activeMode: ActiveEngineMode;
  onChangeMode: (mode: ActiveEngineMode) => void;
  // ElevenLabs
  apiKey: string;
  onUpdateApiKey: (key: string) => void;
  selectedVoiceId: string;
  onSelectVoiceId: (id: string) => void;
  customVoiceId: string;
  onChangeCustomVoiceId: (id: string) => void;
  elevenLabsVoices: ElevenLabsVoice[];
  isValidatingKey: boolean;
  onRefreshVoices: (key: string) => void;
  disabled?: boolean;
}

export const EngineSelector: React.FC<EngineSelectorProps> = ({
  activeMode,
  onChangeMode,
  apiKey,
  onUpdateApiKey,
  selectedVoiceId,
  onSelectVoiceId,
  customVoiceId,
  onChangeCustomVoiceId,
  elevenLabsVoices,
  isValidatingKey,
  onRefreshVoices,
  disabled,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [localKey, setLocalKey] = useState(apiKey);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveKey = () => {
    onUpdateApiKey(localKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="w-full bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl shadow-black/30 space-y-4">
      {/* Title & Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">موتور تبدیل متن به صدا</h2>
            <p className="text-[11px] text-slate-400">انتخاب سرویس هوشمند، بدون فیلترشکن یا آفلاین</p>
          </div>
        </div>

        <span className="text-[11px] px-2 py-0.5 rounded-full border bg-emerald-950/60 border-emerald-500/40 text-emerald-300 font-medium hidden sm:inline-flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          تلفظ معیار فارسی ایران
        </span>
      </div>

      {/* Engine Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* TAB 1: Neural Voice (NO VPN) */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChangeMode('neural')}
          className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between relative overflow-hidden ${
            activeMode === 'neural'
              ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/40'
              : 'bg-slate-950/40 border-slate-800/90 hover:bg-slate-800/40 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-100">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>هوشمند (بدون نیاز به وی‌پی‌ان)</span>
            </div>
            {activeMode === 'neural' && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
            صدای عصبی طبیعی و روان (دیلارا و فرید)، رایگان، بدون فیلترشکن و بدون لهجه غیرمعیار
          </p>
          <div className="mt-2 text-[10px] text-emerald-400 font-medium">کیفیت استودیویی فوق‌العاده</div>
        </button>

        {/* TAB 2: ElevenLabs AI */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChangeMode('elevenlabs')}
          className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between relative overflow-hidden ${
            activeMode === 'elevenlabs'
              ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/40'
              : 'bg-slate-950/40 border-slate-800/90 hover:bg-slate-800/40 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-100">
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              <span>ElevenLabs (با کلید API)</span>
            </div>
            {activeMode === 'elevenlabs' && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
            مدل هوش مصنوعی Multilingual v2 با قفل زبان فارسی و پایداری بالا جهت حذف لهجه‌های متفرقه
          </p>
          <div className="mt-2 text-[10px] text-indigo-400 font-medium">قابلیت شبیه‌سازی و شخصی‌سازی</div>
        </button>

        {/* TAB 3: Offline System */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChangeMode('offline')}
          className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between relative overflow-hidden ${
            activeMode === 'offline'
              ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/40'
              : 'bg-slate-950/40 border-slate-800/90 hover:bg-slate-800/40 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-100">
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span>موتور محلی دستگاه (آفلاین)</span>
            </div>
            {activeMode === 'offline' && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
            اجرا مستقیم روی پردازنده گوشی یا کامپیوتر بدون نیاز به اینترنت و بدون صدای ناهنجار
          </p>
          <div className="mt-2 text-[10px] text-amber-400 font-medium">صدای بومی سیستم شما</div>
        </button>
      </div>

      {/* ELEVENLABS IN-PAGE CONTROLS (Displayed when ElevenLabs is selected) */}
      {activeMode === 'elevenlabs' && (
        <div className="bg-slate-950/80 border border-indigo-500/30 rounded-xl p-3.5 sm:p-4 space-y-3.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-300">
                تنظیمات کلید API و شخصیت صدای ElevenLabs
              </span>
              <span className="text-[10px] bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 px-2 py-0.5 rounded-full">
                قفل زبان: فارسی (fa) فعال
              </span>
            </div>
            <a
              href="https://elevenlabs.io/app/developers/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>دریافت رایگان کلید API</span>
            </a>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>کلید اختصاصی API (ElevenLabs API Key):</span>
              {apiKey && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  کلید فعال است
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder="sk_..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 pl-24 font-mono"
              />
              <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1 text-slate-400 hover:text-slate-200"
                  title={showKey ? 'مخفی کردن' : 'نمایش'}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleSaveKey}
                  disabled={!localKey.trim()}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all disabled:opacity-40"
                >
                  {isSaved ? 'ذخیره شد' : 'ذخیره'}
                </button>
              </div>
            </div>
          </div>

          {/* Voice Selection & Custom Voice ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">
                  شخصیت‌های گلچین‌شده فارسی:
                </label>
                <button
                  type="button"
                  onClick={() => onRefreshVoices(localKey || apiKey)}
                  disabled={isValidatingKey || !localKey.trim()}
                  className="text-[10px] text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isValidatingKey ? 'animate-spin text-indigo-400' : ''}`} />
                  <span>بروزرسانی</span>
                </button>
              </div>
              <select
                value={selectedVoiceId}
                onChange={(e) => onSelectVoiceId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {elevenLabsVoices.map((voice) => (
                  <option key={voice.voice_id} value={voice.voice_id}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                شناسه صدای دلخواه (Custom Voice ID اختیاری):
              </label>
              <input
                type="text"
                value={customVoiceId}
                onChange={(e) => onChangeCustomVoiceId(e.target.value)}
                placeholder="مثال: CwhRBWXzGAHq8TQ4Fs17"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Persian Accent & Dialect Notice */}
          <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-200/90 leading-relaxed flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
            <span>
              <strong>رفع لهجه کردی/افغانی:</strong> در این نسخه کد زبان خروجی به فارسی ایران (<code className="text-indigo-300">language_code: "fa"</code>) و پایداری صدا به ۶۸٪ قفل شده تا کلمات به صورت کاملاً معیار و بدون لهجه خارجی تلفظ شوند.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
