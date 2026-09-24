import React from 'react';
import { Smile, Radio, Heart, Sun, Frown, Flame, Sparkles } from 'lucide-react';
import { EmotionType } from '../types/tts';

interface EmotionSelectorProps {
  selectedEmotion: EmotionType;
  onSelectEmotion: (emotion: EmotionType) => void;
  disabled?: boolean;
}

interface EmotionItem {
  id: EmotionType;
  label: string;
  icon: React.ElementType;
}

const EMOTIONS: EmotionItem[] = [
  { id: 'normal', label: 'عادی', icon: Smile },
  { id: 'news', label: 'رسمی', icon: Radio },
  { id: 'emotional', label: 'احساسی', icon: Heart },
  { id: 'happy', label: 'شاد', icon: Sun },
  { id: 'sad', label: 'غمگین', icon: Frown },
  { id: 'excited', label: 'حماسی', icon: Flame },
];

export const EmotionSelector: React.FC<EmotionSelectorProps> = ({
  selectedEmotion,
  onSelectEmotion,
  disabled,
}) => {
  return (
    <div className="w-full bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>لحن گفتار</span>
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {EMOTIONS.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedEmotion === item.id;

          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectEmotion(item.id)}
              className={`p-2.5 rounded-xl border transition-all flex flex-col items-center justify-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500/60 ring-1 ring-emerald-500/40 text-emerald-300 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
