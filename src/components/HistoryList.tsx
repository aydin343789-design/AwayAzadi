import React from 'react';
import { History, Play, Trash2, Clock, Volume2, Sparkles, Copy, Check } from 'lucide-react';
import { HistoryItem, VoiceType, EmotionType } from '../types/tts';

interface HistoryListProps {
  history: HistoryItem[];
  onPlayItem: (text: string, voice: VoiceType, emotion: EmotionType) => void;
  onSelectItem: (text: string) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
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

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onPlayItem,
  onSelectItem,
  onDeleteItem,
  onClearHistory,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (history.length === 0) {
    return (
      <div className="w-full bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 text-center text-slate-400">
        <History className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
        <p className="text-sm font-medium">تاریخچه پخش خالی است</p>
        <p className="text-xs text-slate-500 mt-1">
          هر متنی که پخش یا تبدیل کنید، برای دسترسی آفلاین سریع در اینجا ذخیره می‌شود.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl shadow-black/30">
      <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-200">تاریخچه تبدیل‌های اخیر</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {history.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onClearHistory}
          className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2.5 py-1 rounded-lg transition-colors"
          title="پاکسازی تمام تاریخچه"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>پاک کردن تاریخچه</span>
        </button>
      </div>

      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        {history.map((item) => {
          const dateStr = new Date(item.timestamp).toLocaleTimeString('fa-IR', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={item.id}
              className="group bg-slate-950/50 hover:bg-slate-800/50 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              {/* Text and meta */}
              <div className="flex-1 min-w-0">
                <p
                  onClick={() => onSelectItem(item.text)}
                  className="text-xs sm:text-sm text-slate-200 hover:text-emerald-400 font-medium line-clamp-2 cursor-pointer transition-colors leading-relaxed"
                  title="کلیک برای بارگذاری در کادر متن"
                >
                  {item.text}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    <Volume2 className="w-3 h-3" />
                    {VOICE_LABELS[item.voice] || item.voice}
                  </span>

                  <span className="flex items-center gap-1 text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20">
                    <Sparkles className="w-3 h-3" />
                    {EMOTION_LABELS[item.emotion] || item.emotion}
                  </span>

                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {dateStr}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onPlayItem(item.text, item.voice, item.emotion)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all"
                  title="پخش مجدد این آیتم"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>پخش</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(item.id, item.text)}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                  title="کپی متن"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 transition-colors"
                  title="حذف از تاریخچه"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
