import React from 'react';
import { AlignRight, Trash2, Clipboard } from 'lucide-react';
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
    <div className="w-full bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
          <AlignRight className="w-4 h-4 text-emerald-400" />
          <span>متن ورودی</span>
        </span>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePaste}
            disabled={disabled}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
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
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>پاکسازی</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Textarea */}
      <div>
        <textarea
          dir={stats.language === 'fa' ? 'rtl' : 'ltr'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="متن مورد نظر خود را بنویسید..."
          rows={5}
          className="w-full bg-slate-950/70 text-slate-100 placeholder-slate-500 rounded-xl p-3.5 text-sm sm:text-base border border-slate-800/80 focus:outline-none focus:border-emerald-500 resize-y min-h-[140px] leading-relaxed transition-all"
        />
      </div>

      {/* Bottom Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-800/40">
        <div className="flex items-center gap-4">
          <span>{stats.charCount} کاراکتر</span>
          <span>{stats.wordCount} کلمه</span>
        </div>
        {stats.charCount > 0 && (
          <span>تخمین زمان: ~{stats.estimatedDurationSeconds} ثانیه</span>
        )}
      </div>
    </div>
  );
};
