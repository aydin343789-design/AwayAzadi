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
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 shadow-lg shadow-black/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-indigo-600 to-rose-500 p-[2px] shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
              آوای ایران آزاد
            </h1>
            <span className="text-[11px] text-slate-400">
              تبدیل هوشمند متن فارسی و انگلیسی به صدا
            </span>
          </div>
        </div>

        {/* Right Action: Mode Badge & Hamburger Menu Button */}
        <div className="flex items-center gap-2.5">
          {/* ElevenLabs Status Quick Indicator */}
          <button
            onClick={onOpenMenu}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              isElevenLabsEnabled && hasApiKey
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="کلیک برای تنظیم کلید الون‌لبز یا تاریخچه"
          >
            {isElevenLabsEnabled && hasApiKey ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>الون‌لبز فعال است</span>
              </>
            ) : (
              <>
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>اتصال به ElevenLabs</span>
              </>
            )}
          </button>

          {/* Hamburger Menu Button */}
          <button
            onClick={onOpenMenu}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 transition-all shadow-sm"
            aria-label="منوی اصلی و تنظیمات"
            title="منوی اصلی و تاریخچه"
          >
            <Menu className="w-5 h-5 text-emerald-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
