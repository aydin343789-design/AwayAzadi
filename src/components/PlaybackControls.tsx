import React from 'react';
import { Play, Square, Pause, Download, Volume2, Loader2, Music, Sparkles } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  isSynthesizing: boolean;
  isElevenLabs: boolean;
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
  isElevenLabs,
  onPlay,
  onPause,
  onResume,
  onStop,
  onDownloadWav,
  onDownloadMp3,
  disabled,
}) => {
  return (
    <div className="w-full bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/40">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Status & Waveform Indicator */}
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
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

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">
                {isSynthesizing
                  ? isElevenLabs
                    ? 'در حال پردازش با ElevenLabs...'
                    : 'در حال تبدیل صدا...'
                  : isPlaying
                  ? isElevenLabs
                    ? 'در حال پخش آنلاین (ElevenLabs)'
                    : 'در حال پخش صدا'
                  : isPaused
                  ? 'پخش موقتاً متوقف شد'
                  : 'آماده برای تبدیل و پخش'}
              </span>
              {isPlaying && (
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>

            {/* Waveform Bars */}
            <div className="flex items-center gap-1 mt-1.5 h-4">
              {[40, 70, 30, 90, 60, 100, 45, 80, 55, 95, 35, 75].map((height, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isPlaying
                      ? isElevenLabs
                        ? 'bg-emerald-400'
                        : 'bg-teal-400'
                      : isSynthesizing
                      ? 'bg-amber-400'
                      : 'bg-slate-700'
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
                isElevenLabs
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 shadow-indigo-600/25'
              }`}
            >
              {isSynthesizing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>در حال تبدیل...</span>
                </>
              ) : (
                <>
                  {isElevenLabs ? (
                    <Sparkles className="w-5 h-5 text-emerald-200" />
                  ) : (
                    <Play className="w-5 h-5 fill-current" />
                  )}
                  <span>{isElevenLabs ? 'پخش با ElevenLabs' : 'پخش صدای طبیعی'}</span>
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

          {/* Download WAV Button */}
          <button
            type="button"
            onClick={onDownloadWav}
            disabled={disabled || isSynthesizing}
            className="flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:border-emerald-500/50 text-xs font-semibold transition-all disabled:opacity-40 shadow-sm"
            title="دانلود فایل صوتی WAV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>دانلود WAV</span>
          </button>

          {/* Download MP3 Button */}
          <button
            type="button"
            onClick={onDownloadMp3}
            disabled={disabled || isSynthesizing}
            className="flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:border-indigo-500/50 text-xs font-semibold transition-all disabled:opacity-40 shadow-sm"
            title="دانلود فایل صوتی با فرمت MP3"
          >
            <Music className="w-4 h-4 text-indigo-400" />
            <span>دانلود MP3</span>
          </button>
        </div>
      </div>
    </div>
  );
};
