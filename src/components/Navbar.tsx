import React from 'react';
import { Volume2, Menu, Sparkles, Key } from 'lucide-react';

interface NavbarProps {
  isElevenLabsEnabled: boolean;
  hasApiKey: boolean;
  onOpenMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isElevenLabsEnabled,
  hasApiKey,
  onOpenMenu,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1.5px] shadow-lg shadow-emerald-500/10">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white">
                آوای ایران
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                Studio
              </span>
            </div>
            <span className="text-xs text-slate-400">
              استودیوی تبدیل متن به گفتار
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {isElevenLabsEnabled && hasApiKey && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>ElevenLabs فعال</span>
            </span>
          )}

          <button
            onClick={onOpenMenu}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors"
            aria-label="منو و تنظیمات"
            title="منو و تنظیمات"
          >
            <Menu className="w-5 h-5 text-slate-200" />
          </button>
        </div>
      </div>
    </header>
  );
};
