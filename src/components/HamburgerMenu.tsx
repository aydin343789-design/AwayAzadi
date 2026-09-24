import React, { useState } from 'react';
import {
  X,
  Key,
  Eye,
  EyeOff,
  History,
  Trash2,
  Play,
  Copy,
  ExternalLink,
  Smartphone,
  Sparkles,
  RefreshCw,
  Layers,
  Wifi,
  ShieldCheck,
} from 'lucide-react';
import { HistoryItem, VoiceType, EmotionType, ElevenLabsVoice } from '../types/tts';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  // ElevenLabs
  apiKey: string;
  isElevenLabsEnabled: boolean;
  selectedVoiceId: string;
  elevenLabsVoices: ElevenLabsVoice[];
  isValidatingKey: boolean;
  onUpdateKey: (key: string) => void;
  onToggleEnabled: (enabled: boolean) => void;
  onSelectVoiceId: (voiceId: string) => void;
  onRefreshVoices: (key: string) => void;
  // History
  history: HistoryItem[];
  onPlayHistoryItem: (text: string, voice: VoiceType, emotion: EmotionType) => void;
  onSelectHistoryItem: (text: string) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
  // APK Modal trigger
  onOpenApkGuide: () => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  apiKey,
  isElevenLabsEnabled,
  selectedVoiceId,
  elevenLabsVoices,
  isValidatingKey,
  onUpdateKey,
  onToggleEnabled,
  onSelectVoiceId,
  onRefreshVoices,
  history,
  onPlayHistoryItem,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onClearHistory,
  onOpenApkGuide,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [localKey, setLocalKey] = useState(apiKey);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'elevenlabs' | 'history'>('all');

  React.useEffect(() => {
    setLocalKey(apiKey);
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const handleKeySave = () => {
    onUpdateKey(localKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-slate-900 border-r sm:border-r-0 sm:border-l border-slate-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-white">تنظیمات و تاریخچه</h2>
              <p className="text-[11px] text-slate-400">کلید ElevenLabs و سوابق تبدیل متن</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="بستن منو"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 p-1.5 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            همه بخش‌ها
          </button>
          <button
            onClick={() => setActiveTab('elevenlabs')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'elevenlabs'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>تنظیم کلید API</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>تاریخچه ({history.length})</span>
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* SECTION 1: ElevenLabs API Settings */}
          {(activeTab === 'all' || activeTab === 'elevenlabs') && (
            <div className="bg-slate-950/70 border border-indigo-500/30 rounded-2xl p-4 shadow-lg space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-100">
                      کلید اختصاصی ElevenLabs API
                    </h3>
                    <p className="text-[10px] text-slate-400">کیفیت استودیویی ۱۹۲ کیلوبیت / ثانیه</p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isElevenLabsEnabled}
                    onChange={(e) => onToggleEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Status Note */}
              <div
                className={`text-[11px] p-2.5 rounded-xl border flex items-start gap-2 ${
                  isElevenLabsEnabled && apiKey.trim()
                    ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                    isElevenLabsEnabled && apiKey.trim()
                      ? 'bg-indigo-400 animate-pulse'
                      : 'bg-slate-600'
                  }`}
                />
                <span>
                  {isElevenLabsEnabled && apiKey.trim()
                    ? 'کلید ذخیره و فعال است. مدل Eleven Multilingual v2 با کیفیت فوق‌العاده ۱۹۲ کیلوبیت پخش می‌شود.'
                    : 'کلید اختصاصی خود را در کادر زیر وارد کنید و دکمه ذخیره را بزنید.'}
                </span>
              </div>

              {/* API Key Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  کلید API (ElevenLabs API Key):
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={localKey}
                    onChange={(e) => setLocalKey(e.target.value)}
                    placeholder="sk_..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 pl-20 font-mono"
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
                      onClick={handleKeySave}
                      disabled={!localKey.trim()}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        isSaved
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {isSaved ? 'ذخیره شد ✓' : 'ذخیره'}
                    </button>
                  </div>
                </div>

                <a
                  href="https://elevenlabs.io/app/developers/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors pt-0.5"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>دریافت رایگان کلید API از وب‌سایت ElevenLabs</span>
                </a>
              </div>

              {/* Voice Picker for ElevenLabs in Menu */}
              {isElevenLabsEnabled && (
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      شخصیت پیش‌فرض ElevenLabs:
                    </label>
                    <button
                      type="button"
                      onClick={() => onRefreshVoices(localKey || apiKey)}
                      disabled={isValidatingKey || !localKey.trim()}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-indigo-400 transition-colors disabled:opacity-40"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${isValidatingKey ? 'animate-spin text-indigo-400' : ''}`}
                      />
                      <span>بروزرسانی</span>
                    </button>
                  </div>

                  <select
                    value={selectedVoiceId}
                    onChange={(e) => onSelectVoiceId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {elevenLabsVoices.map((voice) => (
                      <option key={voice.voice_id} value={voice.voice_id}>
                        {voice.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: No-VPN Engine Overview */}
          {activeTab === 'all' && (
            <div className="bg-slate-950/70 border border-emerald-500/30 rounded-2xl p-4 shadow-lg space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-100">
                    موتور هوشمند بدون وی‌پی‌ان (رایگان)
                  </h3>
                  <p className="text-[10px] text-slate-400">بدون نیاز به کلید، بدون محدودیت و باکیفیت بالا</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                این موتور با بهره‌گیری از مدل‌های عصبی استاندارد زبان فارسی ایران (دیلارا و فرید)، صدایی کاملاً طبیعی و بدون هرگونه لهجه کردی یا افغانی ارائه می‌دهد.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>بهینه‌سازی شده با تلفظ روان و تبدیل اعداد به حروف</span>
              </div>
            </div>
          )}

          {/* SECTION 3: History */}
          {(activeTab === 'all' || activeTab === 'history') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-100">
                      تاریخچه تبدیل‌ها ({history.length})
                    </h3>
                  </div>
                </div>

                {history.length > 0 && (
                  <button
                    onClick={onClearHistory}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>پاکسازی کل</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/60 text-slate-500 text-xs">
                  هنوز متنی تبدیل نشده است. با تایپ و زدن دکمه پخش، متن‌ها در این بخش ذخیره می‌شوند.
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          onClick={() => {
                            onSelectHistoryItem(item.text);
                            onClose();
                          }}
                          className="text-xs text-slate-200 line-clamp-2 cursor-pointer hover:text-emerald-400 transition-colors leading-relaxed"
                          title="کلیک برای درج در کادر متن"
                        >
                          {item.text}
                        </p>
                        <button
                          onClick={() => onDeleteHistoryItem(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors shrink-0"
                          title="حذف"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded font-medium ${
                              item.engine === 'elevenlabs'
                                ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/20'
                                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/20'
                            }`}
                          >
                            {item.engine === 'elevenlabs' ? 'ElevenLabs' : 'بدون وی‌پی‌ان'}
                          </span>
                          <span>{item.voice === 'female' ? 'خانم' : item.voice === 'child' ? 'کودک' : 'آقا'}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyText(item.id, item.text)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="کپی متن"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          {copiedId === item.id && (
                            <span className="text-emerald-400 text-[9px]">کپی شد</span>
                          )}

                          <button
                            onClick={() => {
                              onPlayHistoryItem(item.text, item.voice, item.emotion);
                              onClose();
                            }}
                            className="p-1 px-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 transition-all"
                            title="پخش مجدد"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>پخش</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: Android APK Guide */}
          <div className="bg-gradient-to-r from-emerald-950/30 to-indigo-950/30 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">خروجی اپلیکیشن اندروید (APK)</h4>
                <p className="text-[10px] text-slate-400">راهنمای دریافت فایل نصب بدون نیاز به کامپیوتر</p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenApkGuide();
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/50"
            >
              راهنما
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
