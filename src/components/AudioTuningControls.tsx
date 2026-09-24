import React from 'react';
import { Sliders, RotateCcw } from 'lucide-react';

interface AudioTuningControlsProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  pitch: number;
  onPitchChange: (pitch: number) => void;
  disabled?: boolean;
}

export const AudioTuningControls: React.FC<AudioTuningControlsProps> = ({
  speed,
  onSpeedChange,
  pitch,
  onPitchChange,
  disabled,
}) => {
  const handleReset = () => {
    onSpeedChange(1.0);
    onPitchChange(0);
  };

  const isCustomized = speed !== 1.0 || pitch !== 0;

  return (
    <div className="w-full bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span>تنظیمات صدا</span>
        </span>
        {isCustomized && (
          <button
            type="button"
            onClick={handleReset}
            disabled={disabled}
            className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>بازنشانی</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Speed Slider */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">سرعت خوانش:</span>
            <span className="text-emerald-400 font-mono font-bold">{speed.toFixed(2)}x</span>
          </div>

          <input
            type="range"
            min="0.75"
            max="1.45"
            step="0.05"
            value={speed}
            disabled={disabled}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Pitch Slider */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">گام صدا:</span>
            <span className="text-emerald-400 font-mono font-bold">
              {pitch > 0 ? `+${pitch}` : pitch}
            </span>
          </div>

          <input
            type="range"
            min="-20"
            max="25"
            step="1"
            value={pitch}
            disabled={disabled}
            onChange={(e) => onPitchChange(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
