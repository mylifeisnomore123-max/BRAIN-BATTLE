import React, { useState, useEffect } from 'react';
import { QuestionData } from '../../types/game';
import { soundFx } from '../../services/sound';
import { haptic } from '../../services/haptics';

interface MemoryTestProps {
  question: QuestionData;
  onAnswer: (answer: string) => void;
  disabled: boolean;
  selectedAnswer: string | null;
}

const COLOR_MAP: Record<string, { bg: string; border: string; glow: string; freq: number }> = {
  BLUE: { bg: 'bg-blue-500', border: 'border-blue-400', glow: 'shadow-[0_0_20px_#3b82f6]', freq: 330 },
  RED: { bg: 'bg-red-500', border: 'border-red-400', glow: 'shadow-[0_0_20px_#ef4444]', freq: 440 },
  GREEN: { bg: 'bg-emerald-500', border: 'border-emerald-400', glow: 'shadow-[0_0_20px_#10b981]', freq: 554 },
  YELLOW: { bg: 'bg-amber-400', border: 'border-amber-300', glow: 'shadow-[0_0_20px_#f59e0b]', freq: 659 },
  PURPLE: { bg: 'bg-purple-500', border: 'border-purple-400', glow: 'shadow-[0_0_20px_#a855f7]', freq: 784 },
};

export const MemoryTest: React.FC<MemoryTestProps> = ({
  question,
  onAnswer,
  disabled,
  selectedAnswer,
}) => {
  const sequence: string[] = question.visualData?.sequence || ['BLUE', 'RED', 'GREEN', 'PURPLE'];
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isPlayingSeq, setIsPlayingSeq] = useState<boolean>(true);
  const [userSequence, setUserSequence] = useState<string[]>([]);

  // Automatically playback sequence on question load
  useEffect(() => {
    setIsPlayingSeq(true);
    setUserSequence([]);
    let step = 0;

    const interval = setInterval(() => {
      if (step < sequence.length) {
        const color = sequence[step];
        setActiveStep(step);
        soundFx.playTone(COLOR_MAP[color]?.freq || 440, 0.25);
        step++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setActiveStep(null);
          setIsPlayingSeq(false);
        }, 400);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [question.id]);

  const handleTileTap = (color: string) => {
    if (disabled || isPlayingSeq) return;
    haptic.light();
    soundFx.playTone(COLOR_MAP[color]?.freq || 440, 0.15);

    const nextUserSeq = [...userSequence, color];
    setUserSequence(nextUserSeq);

    // If completed the sequence length
    if (nextUserSeq.length === sequence.length) {
      const fullAnswer = nextUserSeq.join(' - ');
      onAnswer(fullAnswer);
    }
  };

  const handleOptionSelect = (opt: string) => {
    if (disabled || isPlayingSeq) return;
    haptic.medium();
    soundFx.playClick();
    onAnswer(opt);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-5">
      {/* Category Indicator */}
      <div className="flex items-center gap-2 px-3 py-1 bg-purple-950/60 border border-purple-500/30 rounded-full text-xs font-semibold tracking-wider text-purple-300 uppercase">
        <span>🧩</span>
        <span>Memory Sequence Test</span>
      </div>

      {/* Memory Grid Arena */}
      <div className="w-full bg-gradient-to-b from-[#15122b] to-[#0c091d] border border-purple-500/30 rounded-2xl p-5 shadow-[0_0_25px_rgba(168,85,247,0.15)] flex flex-col items-center">
        <div className="text-xs uppercase tracking-widest text-purple-300 font-bold mb-3 flex items-center gap-2">
          {isPlayingSeq ? (
            <span className="flex items-center gap-2 text-cyan-400 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Memorize Pattern Order ({sequence.length} Steps)...
            </span>
          ) : (
            <span className="text-emerald-400">
              Reproduce Pattern ({userSequence.length}/{sequence.length})
            </span>
          )}
        </div>

        {/* Visual Pulse Grid */}
        <div className="flex gap-2 mb-4">
          {sequence.map((color, idx) => {
            const isFlashing = activeStep === idx;
            const userEntered = userSequence[idx];
            return (
              <div
                key={idx}
                className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all duration-200 ${
                  isFlashing
                    ? `${COLOR_MAP[color]?.bg} ${COLOR_MAP[color]?.glow} scale-110 border-white text-white font-bold`
                    : userEntered
                    ? `${COLOR_MAP[userEntered]?.bg} border-white/60 text-white font-bold`
                    : 'bg-slate-800/80 border-slate-700 text-slate-500'
                }`}
              >
                <span className="text-xs">{idx + 1}</span>
              </div>
            );
          })}
        </div>

        {/* 5 Interactive Color Beacons */}
        <div className="grid grid-cols-5 gap-2 w-full pt-1">
          {Object.keys(COLOR_MAP).map((col) => {
            const conf = COLOR_MAP[col];
            return (
              <button
                key={col}
                type="button"
                onClick={() => handleTileTap(col)}
                disabled={disabled || isPlayingSeq}
                className={`h-16 rounded-xl border flex flex-col items-center justify-center transition-all transform active:scale-90 ${conf.bg} ${conf.border} text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <span className="text-[10px] font-black tracking-tight">{col}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Or Select Full Sequence Options */}
      <div className="w-full space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
          Or Select Exact Sequence:
        </div>
        <div className="grid grid-cols-1 gap-2">
          {question.options.map((opt, idx) => {
            const isSelected = selectedAnswer === opt;
            const isCorrect = disabled && opt === question.correctAnswer;
            const isWrong = disabled && isSelected && opt !== question.correctAnswer;

            let btnStyle = 'bg-[#12182e] border-slate-700/80 hover:border-purple-400 text-white';
            if (isCorrect) {
              btnStyle = 'bg-emerald-600/30 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)]';
            } else if (isWrong) {
              btnStyle = 'bg-rose-600/30 border-rose-500 text-rose-200';
            } else if (isSelected) {
              btnStyle = 'bg-purple-500/30 border-purple-400 text-purple-100';
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(opt)}
                disabled={disabled || isPlayingSeq}
                className={`py-2.5 px-3 rounded-xl border text-sm font-semibold tracking-wide transition-all text-center ${btnStyle}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
