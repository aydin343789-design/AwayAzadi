import React from 'react';
import { Cpu, Sparkles, Settings, RefreshCw } from 'lucide-react';
import { ActiveEngineMode, ElevenLabsVoice } from '../types/tts';

interface EngineSelectorProps {
  activeMode: ActiveEngineMode;
  onChangeMode: (mode: ActiveEngineMode) => void;
  hasApiKey: boolean;
  selectedVoiceId: string;
  onSelectVoiceId: (id: string) => void;
  customVoiceId: string;
  onChangeCustomVoiceId: (id: string) => void;
  elevenLabsVoices: ElevenLabsVoice[];
  isValidatingKey: boolean;
  onRefreshVoices: () => void;
  onOpenSettingsMenu: () => void;
  disabled?: boolean;
}

export const EngineSelector: React.FC<EngineSelectorProps> = ({
  activeMode,
  onChangeMode,
  hasApiKey,
  selectedVoiceId,
  onSelectVoiceId,
  customVoiceId,
  onChangeCustomVoiceId,
  elevenLabsVoices,
  isValidatingKey,
  onRefreshVoices,
  onOpenSettingsMenu,
  disabled,
}) => {
  return (
    <div className="w-full bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>موتور تبدیل صوت</span>
        </span>
      </div>

      {/* Segmented Engine Switcher */}
      <div className="grid grid-cols-2 p-1 bg-slate-950/70 rounded-xl border border-slate-800/80 gap-1">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChangeMode('neural')}
          className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            activeMode === 'neural'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className={`w-4 h-4 ${activeMode === 'neural' ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span>موتور عصبی (Neural)</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onChangeMode('elevenlabs')}
          className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            activeMode === 'elevenlabs'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${activeMode === 'elevenlabs' ? 'text-indigo-400' : 'text-slate-500'}`} />
          <span>ElevenLabs</span>
        </button>
      </div>

      {/* ElevenLabs Configuration (Clean & Minimal) */}
      {activeMode === 'elevenlabs' && (
        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3.5 space-y-3">
          {!hasApiKey ? (
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-400">
                کلید API برای ElevenLabs تنظیم نشده است.
              </span>
              <button
                type="button"
                onClick={onOpenSettingsMenu}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-medium transition-colors shrink-0 flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>تنظیم کلید</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300">گوینده ElevenLabs:</label>
                  <button
                    type="button"
                    onClick={onRefreshVoices}
                    disabled={isValidatingKey}
                    className="text-[11px] text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${isValidatingKey ? 'animate-spin' : ''}`} />
                    <span>بروزرسانی</span>
                  </button>
                </div>
                <select
                  value={selectedVoiceId}
                  onChange={(e) => onSelectVoiceId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {elevenLabsVoices.map((v) => (
                    <option key={v.voice_id} value={v.voice_id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">شناسه اختصاصی (اختیاری):</label>
                <input
                  type="text"
                  value={customVoiceId}
                  onChange={(e) => onChangeCustomVoiceId(e.target.value)}
                  placeholder="Voice ID"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
