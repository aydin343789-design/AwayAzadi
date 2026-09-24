import React from 'react';
import { Play, Square, Pause, Download, Volume2, Loader2 } from 'lucide-react';
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
  onPlay,
  onPause,
  onResume,
  onStop,
  onDownloadMp3,
  disabled,
}) => {
  return (
    <div className="w-full bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status & Visualizer */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              isPlaying
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700/80'
            }`}
          >
            {isSynthesizing ? (
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            ) : (
              <Volume2 className={`w-5 h-5 ${isPlaying ? 'text-emerald-400' : ''}`} />
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-300">
              {isSynthesizing
                ? 'در حال پردازش گفتار...'
                : isPlaying
                ? 'در حال پخش'
                : isPaused
                ? 'متوقف شده'
                : 'آماده پخش'}
            </span>

            {/* Waveform indicator */}
            <div className="flex items-center gap-1 mt-1.5 h-3">
              {[40, 70, 30, 90, 60, 100, 45, 80, 55, 95, 35, 75].map((height, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isPlaying
                      ? 'bg-emerald-400'
                      : isSynthesizing
                      ? 'bg-amber-400'
                      : 'bg-slate-800'
                  }`}
                  style={{
                    height: isPlaying
                      ? `${Math.max(25, (height * (1 + Math.sin(Date.now() / 150 + i))) / 2)}%`
                      : '25%',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Main Play / Pause */}
          {!isPlaying && !isPaused ? (
            <button
              type="button"
              onClick={onPlay}
              disabled={disabled || isSynthesizing}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSynthesizing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال تبدیل...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>پخش گفتار</span>
                </>
              )}
            </button>
          ) : isPlaying ? (
            <button
              type="button"
              onClick={onPause}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>مکث</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onResume}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>ادامه</span>
            </button>
          )}

          {/* Stop */}
          <button
            type="button"
            onClick={onStop}
            disabled={!isPlaying && !isPaused}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 text-xs font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none"
            title="توقف"
          >
            <Square className="w-3.5 h-3.5 fill-current text-rose-400" />
            <span className="hidden sm:inline">توقف</span>
          </button>

          {/* Download Audio */}
          <button
            type="button"
            onClick={onDownloadMp3}
            disabled={disabled || isSynthesizing}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 text-xs font-medium transition-colors disabled:opacity-40"
            title="دانلود فایل صوتی"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>دانلود</span>
          </button>
        </div>
      </div>
    </div>
  );
};
