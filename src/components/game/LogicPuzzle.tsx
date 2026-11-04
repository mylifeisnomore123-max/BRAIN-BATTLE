import React from 'react';
import { QuestionData } from '../../types/game';
import { soundFx } from '../../services/sound';
import { haptic } from '../../services/haptics';

interface LogicPuzzleProps {
  question: QuestionData;
  onAnswer: (answer: string) => void;
  disabled: boolean;
  selectedAnswer: string | null;
}

export const LogicPuzzle: React.FC<LogicPuzzleProps> = ({
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
    <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-5">
      {/* Category Indicator */}
      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-950/60 border border-emerald-500/30 rounded-full text-xs font-semibold tracking-wider text-emerald-300 uppercase">
        <span>💡</span>
        <span>Logic & Deduction</span>
      </div>

      {/* Logic Riddle Card */}
      <div className="w-full bg-gradient-to-b from-[#0f1f28] to-[#0a141b] border border-emerald-500/40 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative">
        <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-3 flex items-center gap-2">
          <span>🧠</span>
          <span>Deduce The Solution</span>
        </div>
        <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
          {question.prompt}
        </p>

        {disabled && question.explanation && (
          <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 leading-relaxed">
            <span className="font-bold">Logic Explanation: </span>
            {question.explanation}
          </div>
        )}
      </div>

      {/* Answer Options */}
      <div className="flex flex-col gap-2.5 w-full">
        {question.options.map((opt, idx) => {
          const isSelected = selectedAnswer === opt;
          const isCorrect = disabled && opt === question.correctAnswer;
          const isWrong = disabled && isSelected && opt !== question.correctAnswer;

          let btnStyle = 'bg-[#12182e] border-slate-700/80 hover:border-emerald-400 text-white';
          if (isCorrect) {
            btnStyle = 'bg-emerald-600/30 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] font-bold';
          } else if (isWrong) {
            btnStyle = 'bg-rose-600/30 border-rose-500 text-rose-200';
          } else if (isSelected) {
            btnStyle = 'bg-emerald-500/30 border-emerald-400 text-emerald-100 font-bold';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(opt)}
              disabled={disabled}
              className={`min-h-[50px] text-sm sm:text-base font-semibold py-3 px-4 rounded-xl border-2 transition-all transform active:scale-98 flex items-center justify-between text-left ${btnStyle}`}
            >
              <span>{opt}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-white/10 font-mono">
                {String.fromCharCode(65 + idx)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
