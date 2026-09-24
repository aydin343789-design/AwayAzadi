import React from 'react';
import { Play, Square, Pause, Download, Volume2, Loader2, Music, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { ActiveEngineMode } from '../types/tts';

interface PlaybackControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  isSynthesizing: boolean;
  activeMode: ActiveEngineMode;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onDownloadWav: () => void;
  onDownloadMp3: () => void;
  disabled?: boolean;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  isPaused,
  isSynthesizing,
  activeMode,
  onPlay,
  onPause,
  onResume,
  onStop,
  onDownloadWav,
  onDownloadMp3,
  disabled,
}) => {
  const getModeLabel = () => {
    switch (activeMode) {
      case 'elevenlabs':
        return 'ElevenLabs AI';
      case 'offline':
        return 'موتور آفلاین دستگاه';
      case 'neural':
      default:
        return 'صدای هوشمند (بدون وی‌پی‌ان)';
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/40">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Status & Waveform Indicator */}
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              isPlaying
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {isSynthesizing ? (
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            ) : (
              <Volume2 className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
            )}
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">
                {isSynthesizing
                  ? `در حال پردازش با ${getModeLabel()}...`
                  : isPlaying
                  ? `در حال پخش صدا (${getModeLabel()})`
                  : isPaused
                  ? 'پخش موقتاً متوقف شد'
                  : 'آماده برای تبدیل متن به گفتار'}
              </span>
              {isPlaying && (
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>

            {/* Waveform Bars */}
            <div className="flex items-center gap-1 mt-1.5 h-4">
              {[40, 70, 30, 90, 60, 100, 45, 80, 55, 95, 35, 75, 50, 85].map((height, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isPlaying
                      ? activeMode === 'elevenlabs'
                        ? 'bg-indigo-400'
                        : 'bg-emerald-400'
                      : isSynthesizing
                      ? 'bg-amber-400'
                      : 'bg-slate-800'
                  }`}
                  style={{
                    height: isPlaying
                      ? `${Math.max(20, (height * (1 + Math.sin(Date.now() / 150 + i))) / 2)}%`
                      : '25%',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Playback & Export Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 w-full md:w-auto">
          {/* Main Play / Pause Button */}
          {!isPlaying && !isPaused ? (
            <button
              type="button"
              onClick={onPlay}
              disabled={disabled || isSynthesizing}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none ${
                activeMode === 'elevenlabs'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/30'
                  : activeMode === 'offline'
                  ? 'bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 shadow-amber-600/30'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
              }`}
            >
              {isSynthesizing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>در حال تبدیل...</span>
                </>
              ) : (
                <>
                  {activeMode === 'elevenlabs' ? (
                    <Sparkles className="w-5 h-5 text-indigo-200" />
                  ) : activeMode === 'offline' ? (
                    <WifiOff className="w-5 h-5 text-amber-200" />
                  ) : (
                    <Wifi className="w-5 h-5 text-emerald-200" />
                  )}
                  <span>
                    {activeMode === 'elevenlabs'
                      ? 'پخش با ElevenLabs'
                      : activeMode === 'offline'
                      ? 'پخش آفلاین دستگاه'
                      : 'پخش صدای طبیعی (بدون فیلترشکن)'}
                  </span>
                </>
              )}
            </button>
          ) : isPlaying ? (
            <button
              type="button"
              onClick={onPause}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-600/30 active:scale-[0.98] transition-all"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>مکث</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onResume}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>ادامه پخش</span>
            </button>
          )}

          {/* Stop Button */}
          <button
            type="button"
            onClick={onStop}
            disabled={!isPlaying && !isPaused}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-sm font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none"
            title="توقف کامل"
          >
            <Square className="w-4 h-4 fill-current text-rose-400" />
            <span className="hidden sm:inline">توقف</span>
          </button>

          {/* Download Audio (MP3) */}
          <button
            type="button"
            onClick={onDownloadMp3}
            disabled={disabled || isSynthesizing}
            className="flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:border-emerald-500/50 text-xs font-semibold transition-all disabled:opacity-40 shadow-sm"
            title="دانلود فایل صوتی MP3 با کیفیت بالا"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>دانلود MP3</span>
          </button>
        </div>
      </div>
    </div>
  );
};
