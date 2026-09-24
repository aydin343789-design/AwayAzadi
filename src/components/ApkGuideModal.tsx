import React from 'react';
import { X, Smartphone, Check, Copy, Terminal, Github, ShieldCheck } from 'lucide-react';

interface ApkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMANDS = [
  'git init',
  'git add .',
  'git commit -m "Initial commit"',
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
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                راهنمای دریافت فایل نصبی اندروید (APK)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ساخت کاملاً خودکار APK با GitHub Actions بدون نیاز به اندروید استودیو
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-4 text-sm text-slate-300">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h4 className="font-bold text-emerald-400 flex items-center gap-2 mb-2 text-xs sm:text-sm">
              <Github className="w-4 h-4" />
              مراحل پوش به گیت‌هاب و بیلد خودکار:
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              یک مخزن خالی (Repository) در GitHub بسازید و دستورات زیر را در ترمینال پروژه اجرا کنید:
            </p>

            <div className="space-y-1.5 font-mono text-xs">
              {COMMANDS.map((cmd, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800"
                >
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <span className="text-slate-500">{idx + 1}.</span>
                    <span className="text-emerald-300">{cmd}</span>
                  </div>
                  <button
                    onClick={() => handleCopyCmd(cmd, idx)}
                    className="p-1 text-slate-400 hover:text-white rounded transition-colors mr-2"
                    title="کپی دستور"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-end">
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>کپی تمام دستورات</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h4 className="font-bold text-indigo-400 flex items-center gap-2 mb-2 text-xs sm:text-sm">
              <Terminal className="w-4 h-4" />
              دانلود فایل APK آماده:
            </h4>
            <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5 leading-relaxed">
              <li>پس از Push، به صفحه مخزن خود در گیت‌هاب بروید.</li>
              <li>وارد تب <strong className="text-slate-200">Actions</strong> شوید.</li>
              <li>ورک‌فلو با عنوان <strong className="text-slate-200">Build Android APK</strong> در حال اجراست.</li>
              <li>پس از حدود ۳ دقیقه و سبزرنگ شدن فرآیند، روی بیلد کلیک کنید.</li>
              <li>در بخش <strong className="text-emerald-400">Artifacts</strong>، فایل <strong className="text-white font-mono">AvayeIranAzad-APK</strong> را مستقیماً دانلود و روی گوشی خود نصب کنید.</li>
            </ol>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400/90 bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              این برنامه پس از نصب روی گوشی اندروید کاملاً مستقل عمل کرده و به هیچ اینترنت، اشتراک یا API نیازی ندارد.
            </span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            متوجه شدم و بستن
          </button>
        </div>
      </div>
    </div>
  );
};
