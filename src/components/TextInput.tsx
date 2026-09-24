import React from 'react';
import { Languages, Trash2, Clipboard, Clock } from 'lucide-react';
import { detectLanguage } from '../utils/languageDetector';

interface TextInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ value, onChange, disabled }) => {
  const stats = detectLanguage(value);

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onChange(clipText);
      }
    } catch {
      // Fallback
    }
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="w-full bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl shadow-black/30 transition-all focus-within:border-emerald-500/50">
      {/* Top toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-emerald-400" />
            متن ورودی (فارسی یا انگلیسی)
          </span>

          {value.trim() && (
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                stats.language === 'fa'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                  : 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30'
              }`}
            >
              {stats.primaryLang === 'mixed'
                ? 'دوزبانه (فارسی و انگلیسی)'
                : stats.language === 'fa'
                ? 'زبان فارسی'
                : 'English Language'}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePaste}
            disabled={disabled}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors"
            title="چسباندن متن از حافظه کلیپ‌بورد"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>چسباندن</span>
          </button>
          {value && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/20 transition-colors"
              title="پاک کردن متن"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>پاکسازی</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          dir={stats.language === 'fa' ? 'rtl' : 'ltr'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="متن فارسی یا انگلیسی خود را اینجا بنویسید..."
          rows={6}
          className="w-full bg-slate-950/70 text-slate-100 placeholder-slate-500 rounded-xl p-3.5 text-sm sm:text-base border border-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 resize-y min-h-[160px] leading-relaxed tracking-wide font-normal transition-all"
        />
      </div>

      {/* Bottom stats counter */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/40">
        <div className="flex items-center gap-4">
          <span>
            تعداد کاراکتر: <strong className="text-slate-200">{stats.charCount}</strong>
          </span>
          <span>
            تعداد کلمه: <strong className="text-slate-200">{stats.wordCount}</strong>
          </span>
        </div>
        {stats.charCount > 0 && (
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              مدت تخمینی صدا: <strong className="text-emerald-400">~{stats.estimatedDurationSeconds} ثانیه</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
