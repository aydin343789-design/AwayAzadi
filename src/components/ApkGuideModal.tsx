import React from 'react';
import { X, Smartphone, Check, Copy, Terminal, Github } from 'lucide-react';

interface ApkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMANDS = [
  'git init',
  'git add .',
  'git commit -m "Build Android APK"',
  'git branch -M main',
  'git remote add origin https://github.com/USERNAME/REPO.git',
  'git push -u origin main',
];

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const [copiedAll, setCopiedAll] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyCmd = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(COMMANDS.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              راهنمای ساخت فایل نصبی اندروید (APK)
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 text-xs text-slate-300">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Github className="w-4 h-4" />
                <span>دستورات ارسال کد به مخزن GitHub:</span>
              </span>
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                {copiedAll ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>کپی همه</span>
              </button>
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              {COMMANDS.map((cmd, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800"
                >
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <span className="text-slate-500">{idx + 1}.</span>
                    <span className="text-slate-200">{cmd}</span>
                  </div>
                  <button
                    onClick={() => handleCopyCmd(cmd, idx)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>دانلود فایل نهایی APK:</span>
            </span>
            <p className="text-slate-400 leading-relaxed">
              پس از Push به مخزن، وارد تب <strong className="text-slate-200">Actions</strong> در ریپازیتوری گیت‌هاب شوید. ورک‌فلو ساخت APK به طور خودکار اجرا شده و پس از اتمام، فایل <strong className="text-emerald-400 font-mono">AvayeIranAzad-APK</strong> در بخش Artifacts قابل دریافت خواهد بود.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
