import React from 'react';
import {
  Sparkles,
  Wifi,
  Key,
  ShieldCheck,
  RefreshCw,
  Settings,
  Check,
} from 'lucide-react';
import { ActiveEngineMode, ElevenLabsVoice } from '../types/tts';

interface EngineSelectorProps {
  activeMode: ActiveEngineMode;
  onChangeMode: (mode: ActiveEngineMode) => void;
  // ElevenLabs Character & Voice settings for main page
  hasApiKey: boolean;
  selectedVoiceId: string;
  onSelectVoiceId: (id: string) => void;
  customVoiceId: string;
  onChangeCustomVoiceId: (id: string) => void;
  elevenLabsVoices: ElevenLabsVoice[];
  isValidatingKey: boolean;
  onRefreshVoices: () => void;
  onOpenSettingsMenu: () => void;
  disabled?: boolean;
}

export const EngineSelector: React.FC<EngineSelectorProps> = ({
  activeMode,
  onChangeMode,
  hasApiKey,
  selectedVoiceId,
  onSelectVoiceId,
  customVoiceId,
  onChangeCustomVoiceId,
  elevenLabsVoices,
  isValidatingKey,
  onRefreshVoices,
  onOpenSettingsMenu,
  disabled,
}) => {
  return (
    <div className="w-full bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl shadow-black/30 space-y-4">
      {/* Title & Quality Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">موتور تبدیل متن به صدا</h2>
            <p className="text-[11px] text-slate-400">سرویس‌های آنلاین با بالاترین کیفیت خروجی استودیویی</p>
          </div>
        </div>

        <span className="text-[11px] px-2.5 py-0.5 rounded-full border bg-emerald-950/60 border-emerald-500/40 text-emerald-300 font-medium inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          کیفیت خروجی حداکثری و شفاف
        </span>
      </div>

      {/* Engine Selection Tabs (Pure Online Engines) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* TAB 1: Neural Studio Voice (NO VPN) */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChangeMode('neural')}
          className={`p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between relative overflow-hidden ${
            activeMode === 'neural'
              ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/40'
              : 'bg-slate-950/40 border-slate-800/90 hover:bg-slate-800/40 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-100">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span>هوشمند بدون وی‌پی‌ان (رایگان و سریع)</span>
            </div>
            {activeMode === 'neural' && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
            صدای عصبی استاندارد ایران (دیلارا و فرید)، تلفظ معیار، بدون نیاز به فیلترشکن با وضوح بالا
          </p>
          <div className="mt-2.5 text-[10px] text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            کیفیت استودیویی 24kHz بدون وقفه
          </div>
        </button>

        {/* TAB 2: ElevenLabs AI */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChangeMode('elevenlabs')}
          className={`p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between relative overflow-hidden ${
            activeMode === 'elevenlabs'
              ? 'bg-slate-800/90 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-950/40'
              : 'bg-slate-950/40 border-slate-800/90 hover:bg-slate-800/40 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-100">
              <Key className="w-4 h-4 text-indigo-400" />
              <span>سرویس ElevenLabs (با کلید API)</span>
            </div>
            {activeMode === 'elevenlabs' && (
              <span className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
            مدل Multilingual v2 با قفل خروجی زبان فارسی ایران، صدای سینمایی و بیت‌ریت ۱۹۲ کیلوبیت
          </p>
          <div className="mt-2.5 text-[10px] text-indigo-400 font-medium">
            {hasApiKey ? 'کلید فعال است (192kbps MP3)' : 'تنظیم کلید در منوی سه‌خط بالای صفحه'}
          </div>
        </button>
      </div>

      {/* ELEVENLABS CHARACTER SELECTION ON MAIN PAGE (API key is in 3-line menu) */}
      {activeMode === 'elevenlabs' && (
        <div className="bg-slate-950/80 border border-indigo-500/30 rounded-xl p-3.5 sm:p-4 space-y-3.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-300">
                شخصیت و گوینده‌های هوش مصنوعی ElevenLabs
              </span>
              <span className="text-[10px] bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                کیفیت 192kbps / fa
              </span>
            </div>

            {/* Quick button to open Hamburger menu if key needs adjustment */}
            <button
              type="button"
              onClick={onOpenSettingsMenu}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{hasApiKey ? 'مدیریت کلید API در منو' : 'تنظیم کلید در منوی سه‌خط'}</span>
            </button>
          </div>

          {!hasApiKey && (
            <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed flex items-center justify-between gap-2">
              <span>
                برای استفاده از این موتور، کلید اختصاصی خود را در <strong>منوی سه‌خط (بالای صفحه)</strong> وارد کنید.
              </span>
              <button
                type="button"
                onClick={onOpenSettingsMenu}
                className="shrink-0 text-[11px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg font-bold"
              >
                باز کردن منو
              </button>
            </div>
          )}

          {/* Voice Selection & Custom Voice ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">
                  شخصیت‌های گلچین‌شده فارسی:
                </label>
                <button
                  type="button"
                  onClick={onRefreshVoices}
                  disabled={isValidatingKey || !hasApiKey}
                  className="text-[10px] text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors disabled:opacity-40"
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
                شناسه صدای دلخواه (Custom Voice ID):
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
        </div>
      )}
    </div>
  );
};
