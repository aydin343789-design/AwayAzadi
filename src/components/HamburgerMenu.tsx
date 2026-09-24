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
  RefreshCw,
  Sliders,
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
  const [activeTab, setActiveTab] = useState<'elevenlabs' | 'history'>('elevenlabs');

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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md h-full bg-slate-900 border-r sm:border-r-0 sm:border-l border-slate-800 shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm text-white">تنظیمات و ابزارها</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 p-2 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('elevenlabs')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'elevenlabs'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>تنظیمات ElevenLabs</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>تاریخچه ({history.length})</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'elevenlabs' && (
            <div className="space-y-4">
              {/* Toggle Switch */}
              <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-200">فعال‌سازی سرویس ElevenLabs</span>
                  <span className="text-[11px] text-slate-400">استفاده از مدل صوتی Multilingual v2</span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isElevenLabsEnabled}
                    onChange={(e) => onToggleEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* API Key Input */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300">کلید API (ElevenLabs):</label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={localKey}
                    onChange={(e) => setLocalKey(e.target.value)}
                    placeholder="sk_..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 pl-20 font-mono"
                  />
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="p-1 text-slate-400 hover:text-slate-200"
                    >
                      {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleKeySave}
                      disabled={!localKey.trim()}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isSaved
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {isSaved ? 'ذخیره شد' : 'ذخیره'}
                    </button>
                  </div>
                </div>

                <a
                  href="https://elevenlabs.io/app/developers/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 pt-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>دریافت کلید API از وب‌سایت ElevenLabs</span>
                </a>
              </div>

              {/* Voice Picker */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300">گوینده پیش‌فرض:</label>
                  <button
                    type="button"
                    onClick={() => onRefreshVoices(localKey || apiKey)}
                    disabled={isValidatingKey || !localKey.trim()}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 disabled:opacity-40"
                  >
                    <RefreshCw className={`w-3 h-3 ${isValidatingKey ? 'animate-spin' : ''}`} />
                    <span>بروزرسانی لیست</span>
                  </button>
                </div>

                <select
                  value={selectedVoiceId}
                  onChange={(e) => onSelectVoiceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {elevenLabsVoices.map((voice) => (
                    <option key={voice.voice_id} value={voice.voice_id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Android APK Link */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenApkGuide();
                  }}
                  className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-medium text-slate-200">راهنمای بیلد اندروید (APK)</span>
                  </div>
                  <span className="text-xs text-slate-400">مشاهده</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {history.length > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={onClearHistory}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>پاکسازی تاریخچه</span>
                  </button>
                </div>
              )}

              {history.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  تاریخچه‌ای ثبت نشده است.
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2"
                    >
                      <p
                        onClick={() => {
                          onSelectHistoryItem(item.text);
                          onClose();
                        }}
                        className="text-xs text-slate-200 line-clamp-2 cursor-pointer hover:text-emerald-400 transition-colors leading-relaxed"
                      >
                        {item.text}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">
                            {item.engine === 'elevenlabs' ? 'ElevenLabs' : 'Neural'}
                          </span>
                          <span>{item.voice === 'female' ? 'زن' : item.voice === 'child' ? 'کودک' : 'مرد'}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyText(item.id, item.text)}
                            className="p-1 rounded text-slate-400 hover:text-slate-200"
                            title="کپی"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {copiedId === item.id && (
                            <span className="text-emerald-400 text-[10px]">کپی شد</span>
                          )}
                          <button
                            onClick={() => {
                              onPlayHistoryItem(item.text, item.voice, item.emotion);
                              onClose();
                            }}
                            className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>پخش</span>
                          </button>
                          <button
                            onClick={() => onDeleteHistoryItem(item.id)}
                            className="p-1 text-slate-500 hover:text-rose-400"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
