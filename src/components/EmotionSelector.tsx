import React from 'react';
import { Smile, Radio, Heart, Sun, Frown, Flame, Sparkles } from 'lucide-react';
import { EmotionType } from '../types/tts';

interface EmotionSelectorProps {
  selectedEmotion: EmotionType;
  onSelectEmotion: (emotion: EmotionType) => void;
  disabled?: boolean;
}

interface EmotionOption {
  id: EmotionType;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  activeBorder: string;
}

const EMOTIONS: EmotionOption[] = [
  {
    id: 'normal',
    title: 'عادی',
    description: 'بیان طبیعی، محاوره‌ای و ملایم',
    icon: Smile,
    color: 'text-slate-300',
    activeBorder: 'border-slate-400',
  },
  {
    id: 'news',
    title: 'خبری و رسمی',
    description: 'رسمی، استوار و بدون افت و خیز زیاد',
    icon: Radio,
    color: 'text-blue-400',
    activeBorder: 'border-blue-500',
  },
  {
    id: 'emotional',
    title: 'احساسی و عاطفی',
    description: 'گرم، پرمحبت، لرزش لطیف و آهنگین',
    icon: Heart,
    color: 'text-rose-400',
    activeBorder: 'border-rose-500',
  },
  {
    id: 'happy',
    title: 'شاد و پرانرژی',
    description: 'تمپو سریع‌تر، لحن صعودی و نشاط‌آور',
    icon: Sun,
    color: 'text-amber-400',
    activeBorder: 'border-amber-500',
  },
  {
    id: 'sad',
    title: 'غمگین و آرام',
    description: 'آهسته، محزون، ریتم آرام با فرود ملایم',
    icon: Frown,
    color: 'text-indigo-400',
    activeBorder: 'border-indigo-500',
  },
  {
    id: 'excited',
    title: 'هیجان‌زده و حماسی',
    description: 'پرتوان، سرشار از شور و انگیزه',
    icon: Flame,
    color: 'text-orange-400',
    activeBorder: 'border-orange-500',
  },
];

export const EmotionSelector: React.FC<EmotionSelectorProps> = ({
  selectedEmotion,
  onSelectEmotion,
  disabled,
}) => {
  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl shadow-black/30">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          لحن و بیان احساسی صدا
        </h2>
        <span className="text-[11px] text-slate-400">تنظیم تنالیته، گام و سرعت</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {EMOTIONS.map((emo) => {
          const Icon = emo.icon;
          const isSelected = selectedEmotion === emo.id;

          return (
            <button
              key={emo.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectEmotion(emo.id)}
              className={`text-right p-3 rounded-xl border transition-all flex flex-col justify-between ${
                isSelected
                  ? `bg-slate-800/90 ${emo.activeBorder} ring-2 ring-emerald-500/20 shadow-md`
                  : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`p-1.5 rounded-lg ${
                    isSelected ? 'bg-slate-950/70' : 'bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${emo.color}`} />
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>

              <div>
                <h3 className="font-bold text-xs text-slate-200">{emo.title}</h3>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                  {emo.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
