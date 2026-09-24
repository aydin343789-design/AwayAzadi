import React from 'react';
import { User, Users, Baby, Activity } from 'lucide-react';
import { ActiveEngineMode, VoiceType } from '../types/tts';

interface VoiceSelectorProps {
  selectedVoice: VoiceType;
  onSelectVoice: (voice: VoiceType) => void;
  activeMode?: ActiveEngineMode;
  disabled?: boolean;
}

interface VoiceOption {
  id: VoiceType;
  title: string;
  characterName: string;
  subTitle: string;
  badge: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
  activeMode = 'neural',
  disabled,
}) => {
  const VOICES: VoiceOption[] = [
    {
      id: 'female',
      title: 'صدای زن',
      characterName: activeMode === 'neural' ? 'دیلارا (Dilara)' : 'آلیس / بانو',
      subTitle: 'روشن، شفاف، لحن بسیار طبیعی و روان',
      badge: 'لهجه معیار تهران',
      icon: Users,
      gradient: 'from-emerald-600/20 to-teal-600/20',
      borderColor: 'border-emerald-500',
    },
    {
      id: 'male',
      title: 'صدای مرد',
      characterName: activeMode === 'neural' ? 'فرید (Farid)' : 'راجر / راوی',
      subTitle: 'بم، باوقار، گوینده کتاب صوتی و خبر',
      badge: 'پرطنین و رسا',
      icon: User,
      gradient: 'from-blue-600/20 to-indigo-600/20',
      borderColor: 'border-blue-500',
    },
    {
      id: 'child',
      title: 'صدای کودک',
      characterName: activeMode === 'neural' ? 'شاداب (نوگل)' : 'دنیل / نوجوان',
      subTitle: 'شاداب، نازک، صمیمی و پرانرژی',
      badge: 'کودک و نوجوان',
      icon: Baby,
      gradient: 'from-amber-600/20 to-rose-600/20',
      borderColor: 'border-amber-500',
    },
  ];

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl shadow-black/30">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          شخصیت و گوینده گفتار (Voice Character)
        </h2>
        <span className="text-[11px] text-slate-400">تطبیق بلندی و جنس صدا</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {VOICES.map((v) => {
          const Icon = v.icon;
          const isSelected = selectedVoice === v.id;

          return (
            <button
              key={v.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectVoice(v.id)}
              className={`group relative text-right p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? `bg-slate-800/90 ${v.borderColor} ring-2 ring-emerald-500/30 shadow-lg`
                  : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              {isSelected && (
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${v.gradient} opacity-40 pointer-events-none`}
                />
              )}

              <div className="flex items-start justify-between relative z-10 w-full">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-slate-100">{v.title}</h3>
                      <span className="text-[10px] text-emerald-400 font-medium">({v.characterName})</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{v.subTitle}</p>
                  </div>
                </div>

                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected ? 'border-emerald-400 bg-emerald-500' : 'border-slate-600 bg-slate-900'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/50 text-[10px] text-slate-400 flex items-center justify-between relative z-10">
                <span className="text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded">{v.badge}</span>
                <span className={isSelected ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                  {isSelected ? 'انتخاب شده' : 'انتخاب'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
