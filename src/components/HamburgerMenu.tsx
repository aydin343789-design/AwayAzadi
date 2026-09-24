import React, { useState } from 'react';
import {
  X,
  Key,
  ExternalLink,
  History,
  Trash2,
  Play,
  Copy,
  Check,
  Smartphone,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  Volume2,
  Clock,
  Layers,
  Cpu,
} from 'lucide-react';
import { EmotionType, HistoryItem, VoiceType, ElevenLabsVoice, OfflineEngineMode } from '../types/tts';

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
  // Offline Engine
  offlineEngineMode: OfflineEngineMode;
  onChangeOfflineEngineMode: (mode: OfflineEngineMode) => void;
  // History
  history: HistoryItem[];
  onPlayHistoryItem: (text: string, voice: VoiceType, emotion: EmotionType) => void;
  onSelectHistoryItem: (text: string) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
  // APK
  onOpenApkGuide: () => void;
}

const VOICE_LABELS: Record<VoiceType, string> = {
  male: 'مرد',
  female: 'زن',
  child: 'کودک',
};

const EMOTION_LABELS: Record<EmotionType, string> = {
  normal: 'عادی',
  news: 'خبری',
  emotional: 'احساسی',
  happy: 'شاد',
  sad: 'غمگین',
  excited: 'هیجان‌زده',
};

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
  offlineEngineMode,
  onChangeOfflineEngineMode,
  history,
  onPlayHistoryItem,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onClearHistory,
  onOpenApkGuide,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [localKey, setLocalKey] = useState(apiKey);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'elevenlabs' | 'history'>('all');

  if (!isOpen) return null;

  const handleKeySave = () => {
    onUpdateKey(localKey);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
              <h2 className="font-bold text-sm sm:text-base text-white">منوی تنظیمات و تاریخچه</h2>
              <p className="text-[11px] text-slate-400">سرویس ElevenLabs، موتور آفلاین و سوابق</p>
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
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>ElevenLabs</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>تاریخچه ({history.length})</span>
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* SECTION: Offline Engine Configuration */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-100">
                  موتور تبدیل آفلاین (بدون اینترنت)
                </h3>
                <p className="text-[10px] text-slate-400">نحوه خوانش متن در صورت عدم دسترسی به اینترنت</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onChangeOfflineEngineMode('system')}
                className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                  offlineEngineMode === 'system'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold flex items-center justify-between w-full">
                  <span>صدای سیستم دستگاه</span>
                  {offlineEngineMode === 'system' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  خوانش روان صوتی با موتور محلی دستگاه (توصیه شده)
                </span>
              </button>

              <button
                type="button"
                onClick={() => onChangeOfflineEngineMode('dsp')}
                className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                  offlineEngineMode === 'dsp'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold flex items-center justify-between w-full">
                  <span>شبیه‌ساز Web Audio</span>
                  {offlineEngineMode === 'dsp' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  سنتز فرمنتی آکوستیک با نوسانگرهای داخلی مرورگر
                </span>
              </button>
            </div>
          </div>

          {/* SECTION 1: ElevenLabs API Settings */}
          {(activeTab === 'all' || activeTab === 'elevenlabs') && (
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-100">
                      صدای هوش مصنوعی ElevenLabs
                    </h3>
                    <p className="text-[10px] text-slate-400">کیفیت استودیویی فوق طبیعی (آنلاین)</p>
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
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Status Note */}
              <div
                className={`text-[11px] p-2.5 rounded-xl border mb-3 flex items-start gap-2 ${
                  isElevenLabsEnabled && apiKey.trim()
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                    isElevenLabsEnabled && apiKey.trim()
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-slate-600'
                  }`}
                />
                <span>
                  {isElevenLabsEnabled && apiKey.trim()
                    ? 'سرویس آنلاین ElevenLabs فعال است. متن‌ها با مدل Eleven Multilingual v2 با کیفیت فوق‌العاده پخش می‌شوند.'
                    : 'در صورت عدم استفاده از ElevenLabs یا قطع اینترنت، صدا به صورت آفلاین بدون نیاز به شبکه پخش می‌شود.'}
                </span>
              </div>

              {/* API Key Input */}
              <div className="space-y-2 mb-3">
                <label className="block text-xs font-semibold text-slate-300">
                  کلید اختصاصی API (ElevenLabs API Key):
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={localKey}
                    onChange={(e) => setLocalKey(e.target.value)}
                    placeholder="sk_..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 pl-16 font-mono"
                  />
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="p-1 text-slate-400 hover:text-slate-200"
                      title={showKey ? 'مخفی کردن' : 'نمایش'}
                    >
                      {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    {localKey !== apiKey && (
                      <button
                        type="button"
                        onClick={handleKeySave}
                        className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                      >
                        ذخیره
                      </button>
                    )}
                  </div>
                </div>

                {/* Direct Link to Key generator */}
                <a
                  href="https://elevenlabs.io/app/developers/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors pt-0.5"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>دریافت رایگان کلید API از پنل کاربری ElevenLabs</span>
                </a>
              </div>

              {/* Voice Picker for ElevenLabs */}
              {isElevenLabsEnabled && (
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      انتخاب صدای استودیویی ElevenLabs:
                    </label>
                    <button
                      type="button"
                      onClick={() => onRefreshVoices(localKey || apiKey)}
                      disabled={isValidatingKey || !localKey.trim()}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-400 transition-colors disabled:opacity-40"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${isValidatingKey ? 'animate-spin text-emerald-400' : ''}`}
                      />
                      <span>بروزرسانی صداها</span>
                    </button>
                  </div>

                  <select
                    value={selectedVoiceId}
                    onChange={(e) => onSelectVoiceId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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

          {/* SECTION 2: History (Moved into Hamburger Menu) */}
          {(activeTab === 'all' || activeTab === 'history') && (
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-100">
                      تاریخچه تولید صدا
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      تعداد آیتم‌ها: {history.length}
                    </span>
                  </div>
                </div>

                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearHistory}
                    className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 px-2 py-1 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>پاک کردن</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">
                  تاریخچه خالی است. هر متنی که تبدیل کنید اینجا ذخیره می‌شود.
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {history.map((item) => {
                    const timeStr = new Date(item.timestamp).toLocaleTimeString('fa-IR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={item.id}
                        className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl transition-all"
                      >
                        <p
                          onClick={() => {
                            onSelectHistoryItem(item.text);
                            onClose();
                          }}
                          className="text-xs text-slate-200 hover:text-emerald-400 cursor-pointer line-clamp-2 leading-relaxed"
                          title="کلیک برای بارگذاری در متن"
                        >
                          {item.text}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50 text-[10px] text-slate-400">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400 flex items-center gap-1">
                              <Volume2 className="w-2.5 h-2.5" />
                              {VOICE_LABELS[item.voice] || item.voice}
                            </span>
                            <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400">
                              {EMOTION_LABELS[item.emotion] || item.emotion}
                            </span>
                            {item.engine === 'elevenlabs' && (
                              <span className="bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                ElevenLabs
                              </span>
                            )}
                            <span className="flex items-center gap-0.5 text-slate-500">
                              <Clock className="w-2.5 h-2.5" />
                              {timeStr}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                onPlayHistoryItem(item.text, item.voice, item.emotion);
                                onClose();
                              }}
                              className="p-1 rounded bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors"
                              title="پخش مجدد"
                            >
                              <Play className="w-3 h-3 fill-current" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyText(item.id, item.text)}
                              className="p-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                              title="کپی متن"
                            >
                              {copiedId === item.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteHistoryItem(item.id)}
                              className="p-1 rounded bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: APK Guide */}
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenApkGuide();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-all"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>راهنمای ساخت فایل نصبی APK اندروید</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
