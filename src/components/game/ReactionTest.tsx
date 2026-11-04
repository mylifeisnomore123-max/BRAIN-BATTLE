import React, { useState, useEffect, useRef } from 'react';
import { QuestionData } from '../../types/game';
import { soundFx } from '../../services/sound';
import { haptic } from '../../services/haptics';

interface ReactionTestProps {
  question: QuestionData;
  onAnswer: (answer: string) => void;
  disabled: boolean;
  selectedAnswer: string | null;
}

export const ReactionTest: React.FC<ReactionTestProps> = ({
  question,
  onAnswer,
  disabled,
  selectedAnswer,
}) => {
  const isFlashMode = question.correctAnswer === 'CYAN' || question.correctAnswer === 'GREEN';
  const [flashState, setFlashState] = useState<'waiting' | 'ready' | 'too_early'>('waiting');
  const [reactionTimeMs, setReactionTimeMs] = useState<number | null>(null);
  const flashStartTime = useRef<number>(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isFlashMode) {
      setFlashState('waiting');
      setReactionTimeMs(null);
      const delay = 1200 + Math.random() * 2000;
      timerRef.current = setTimeout(() => {
        setFlashState('ready');
        flashStartTime.current = Date.now();
        soundFx.playCountdownTick(true);
      }, delay);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [question.id, isFlashMode]);

  const handleFlashTrigger = () => {
    if (disabled) return;
    if (flashState === 'waiting') {
      // Too early tap!
      setFlashState('too_early');
      haptic.error();
      soundFx.playWrong();
      if (timerRef.current) clearTimeout(timerRef.current);
      setTimeout(() => {
        onAnswer('TOO_EARLY');
      }, 1000);
      return;
    }

    if (flashState === 'ready') {
      const elapsed = Date.now() - flashStartTime.current;
      setReactionTimeMs(elapsed);
      haptic.success();
      soundFx.playCorrect(2);
      onAnswer(question.correctAnswer);
    }
  };

  const handleOptionSelect = (opt: string) => {
    if (disabled) return;
    haptic.medium();
    soundFx.playClick();
    onAnswer(opt);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-5">
      {/* Category Indicator */}
      <div className="flex items-center gap-2 px-3 py-1 bg-amber-950/60 border border-amber-500/30 rounded-full text-xs font-semibold tracking-wider text-amber-300 uppercase">
        <span>⚡</span>
        <span>Reaction & Reflex Test</span>
      </div>

      {/* If Millisecond Flash Arena */}
      {isFlashMode ? (
        <div
          onClick={handleFlashTrigger}
          className={`w-full min-h-[220px] rounded-2xl border-2 flex flex-col items-center justify-center p-6 cursor-pointer select-none transition-all transform active:scale-98 shadow-xl ${
            flashState === 'waiting'
              ? 'bg-[#181124] border-red-500/50 hover:border-red-400'
              : flashState === 'ready'
              ? 'bg-gradient-to-br from-cyan-400 to-blue-500 border-white shadow-[0_0_50px_#00e5ff] text-black font-black animate-pulse'
              : 'bg-rose-950 border-rose-600 text-rose-300'
          }`}
        >
          {flashState === 'waiting' && (
            <div className="text-center space-y-2">
              <span className="text-4xl animate-bounce inline-block">🔴</span>
              <div className="text-2xl font-black text-white tracking-wide">WAIT FOR CYAN...</div>
              <p className="text-xs text-slate-400 font-medium">Do not tap yet! Penalized for false start.</p>
            </div>
          )}

          {flashState === 'ready' && (
            <div className="text-center space-y-1">
              <span className="text-5xl">⚡</span>
              <div className="text-4xl font-black text-black tracking-tight uppercase">TAP NOW!</div>
              <p className="text-xs text-black/80 font-bold">REACT WITH MAXIMUM SPEED!</p>
            </div>
          )}

          {flashState === 'too_early' && (
            <div className="text-center space-y-1">
              <span className="text-4xl">⚠️</span>
              <div className="text-xl font-bold text-rose-200">Too Early! False Start</div>
              <p className="text-xs text-rose-300">Wait for the color shift before tapping.</p>
            </div>
          )}

          {reactionTimeMs !== null && (
            <div className="mt-3 px-4 py-1.5 bg-black/40 rounded-full text-white font-mono text-sm font-bold">
              ⚡ Reflex Speed: {reactionTimeMs} ms!
            </div>
          )}
        </div>
      ) : (
        /* Stroop / Visual Challenge Card */
        <div className="w-full bg-gradient-to-b from-[#16122e] to-[#0c091f] border border-amber-500/30 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(245,158,11,0.15)]">
          <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">
            Read Instruction Carefully
          </div>

          <p className="text-base font-semibold text-slate-200 mb-4 whitespace-pre-line leading-relaxed">
            {question.prompt}
          </p>

          {question.visualData?.word && (
            <div
              className="text-4xl sm:text-5xl font-black tracking-wider py-4 font-mono select-none drop-shadow-md"
              style={{ color: question.visualData.colorHex }}
            >
              {question.visualData.word}
            </div>
          )}
        </div>
      )}

      {/* Answer Buttons */}
      <div className="grid grid-cols-2 gap-3.5 w-full">
        {question.options.map((opt, idx) => {
          const isSelected = selectedAnswer === opt;
          const isCorrect = disabled && opt === question.correctAnswer;
          const isWrong = disabled && isSelected && opt !== question.correctAnswer;

          let btnStyle = 'bg-[#12182e] border-slate-700/80 hover:border-amber-400 text-white';
          if (isCorrect) {
            btnStyle = 'bg-emerald-600/30 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)]';
          } else if (isWrong) {
            btnStyle = 'bg-rose-600/30 border-rose-500 text-rose-200';
          } else if (isSelected) {
            btnStyle = 'bg-amber-500/30 border-amber-400 text-amber-100';
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionSelect(opt)}
              disabled={disabled}
              className={`min-h-[58px] text-lg font-bold py-3 px-4 rounded-xl border-2 transition-all transform active:scale-95 flex items-center justify-center ${btnStyle}`}
            >
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
