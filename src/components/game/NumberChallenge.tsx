import React from 'react';
import { QuestionData } from '../../types/game';
import { soundFx } from '../../services/sound';
import { haptic } from '../../services/haptics';

interface NumberChallengeProps {
  question: QuestionData;
  onAnswer: (answer: string) => void;
  disabled: boolean;
  selectedAnswer: string | null;
}

export const NumberChallenge: React.FC<NumberChallengeProps> = ({
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
      <div className="flex items-center gap-2 px-3 py-1 bg-violet-950/60 border border-violet-500/30 rounded-full text-xs font-semibold tracking-wider text-violet-300 uppercase">
        <span>🔢</span>
        <span>Number Patterns & Sequences</span>
      </div>

      {/* Number Card */}
      <div className="w-full bg-gradient-to-b from-[#181133] to-[#0c081c] border border-violet-500/40 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(139,92,246,0.15)] relative">
        <div className="text-xs uppercase tracking-widest text-violet-300 font-bold mb-3">
          Identify The Number Rule
        </div>

        <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-wide py-2 whitespace-pre-line leading-relaxed">
          {question.prompt}
        </div>

        {disabled && question.explanation && (
          <div className="mt-3 p-2.5 bg-violet-950/40 border border-violet-500/30 rounded-xl text-xs text-violet-300">
            <span className="font-bold">Pattern: </span>
            {question.explanation}
          </div>
        )}
      </div>

      {/* Answer Choice Grid */}
      <div className="grid grid-cols-2 gap-3.5 w-full">
        {question.options.map((opt, idx) => {
          const isSelected = selectedAnswer === opt;
          const isCorrect = disabled && opt === question.correctAnswer;
          const isWrong = disabled && isSelected && opt !== question.correctAnswer;

          let btnStyle = 'bg-[#12182e] border-slate-700/80 hover:border-violet-400 text-white';
          if (isCorrect) {
            btnStyle = 'bg-emerald-600/30 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] font-bold';
          } else if (isWrong) {
            btnStyle = 'bg-rose-600/30 border-rose-500 text-rose-200';
          } else if (isSelected) {
            btnStyle = 'bg-violet-500/30 border-violet-400 text-violet-100 font-bold';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(opt)}
              disabled={disabled}
              className={`min-h-[64px] text-xl font-bold py-3.5 px-4 rounded-xl border-2 transition-all transform active:scale-95 flex items-center justify-center font-mono ${btnStyle}`}
            >
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
