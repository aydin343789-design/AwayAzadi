import React from 'react';
import { User, Users, Baby } from 'lucide-react';
import { ActiveEngineMode, VoiceType } from '../types/tts';

interface VoiceSelectorProps {
  selectedVoice: VoiceType;
  onSelectVoice: (voice: VoiceType) => void;
  activeMode?: ActiveEngineMode;
  disabled?: boolean;
}

interface VoiceItem {
  id: VoiceType;
  label: string;
  name: string;
  icon: React.ElementType;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
  activeMode = 'neural',
  disabled,
}) => {
  const VOICES: VoiceItem[] = [
    {
      id: 'female',
      label: 'صدای زن',
      name: activeMode === 'neural' ? 'دیلارا' : 'بانو',
      icon: Users,
    },
    {
      id: 'male',
      label: 'صدای مرد',
      name: activeMode === 'neural' ? 'فرید' : 'راوی',
      icon: User,
    },
    {
      id: 'child',
      label: 'صدای کودک',
      name: activeMode === 'neural' ? 'نوگل' : 'نوجوان',
      icon: Baby,
    },
  ];

  return (
    <div className="w-full bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>انتخاب گوینده</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {VOICES.map((v) => {
          const Icon = v.icon;
          const isSelected = selectedVoice === v.id;

          return (
            <button
              key={v.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectVoice(v.id)}
              className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500/60 ring-1 ring-emerald-500/40 text-white shadow-sm'
                  : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100">{v.label}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{v.name}</div>
                </div>
              </div>

              <span
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-500'
                    : 'border-slate-600 bg-slate-900'
                }`}
              >
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
