import React from 'react';
import { QuestionData } from '../../types/game';
import { soundFx } from '../../services/sound';
import { haptic } from '../../services/haptics';

interface MathChallengeProps {
  question: QuestionData;
  onAnswer: (answer: string) => void;
  disabled: boolean;
  selectedAnswer: string | null;
}

export const MathChallenge: React.FC<MathChallengeProps> = ({
  question,
  onAnswer,
  disabled,
  selectedAnswer,
}) => {
  const handleSelect = (opt: string) => {
    if (disabled) return;
    haptic.medium();
    soundFx.playClick();
    onAnswer(opt);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-6">
      {/* Category Indicator */}
      <div className="flex items-center gap-2 px-3 py-1 bg-cyan-950/60 border border-cyan-500/30 rounded-full text-xs font-semibold tracking-wider text-cyan-400 uppercase">
        <span>📐</span>
        <span>Math Challenge</span>
      </div>

      {/* Main Math Formula Card */}
      <div className="w-full bg-gradient-to-b from-[#131b38] to-[#0d1329] border border-cyan-500/40 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">
          Calculate Instantly
        </div>
        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono py-4">
          {question.prompt}
        </div>
      </div>

      {/* 4 Answer Choice Buttons */}
      <div className="grid grid-cols-2 gap-3.5 w-full">
        {question.options.map((opt, idx) => {
          const isSelected = selectedAnswer === opt;
          const isCorrect = selectedAnswer && opt === question.correctAnswer;
          const isWrong = isSelected && opt !== question.correctAnswer;

          let btnStyle = 'bg-[#12182e] border-slate-700/80 hover:border-cyan-400 hover:bg-[#1a2342] text-white';
          if (disabled && isCorrect) {
            btnStyle = 'bg-emerald-600/30 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse';
          } else if (disabled && isWrong) {
            btnStyle = 'bg-rose-600/30 border-rose-500 text-rose-200';
          } else if (isSelected) {
            btnStyle = 'bg-cyan-500/30 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.4)]';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(opt)}
              disabled={disabled}
              className={`min-h-[68px] text-xl font-bold py-3.5 px-4 rounded-xl border-2 transition-all transform active:scale-95 flex items-center justify-center font-mono ${btnStyle}`}
            >
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
