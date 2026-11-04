import React, { useState, useEffect, useRef } from 'react';
import { PlayerProfile, QuestionData, ActiveMatchPlayer } from '../../types/game';
import { MathChallenge } from '../game/MathChallenge';
import { MemoryTest } from '../game/MemoryTest';
import { ReactionTest } from '../game/ReactionTest';
import { LogicPuzzle } from '../game/LogicPuzzle';
import { NumberChallenge } from '../game/NumberChallenge';
import { multiplayer } from '../../services/multiplayer';
import { soundFx } from '../../services/sound';
import { haptic } from '../../services/haptics';
import { getAvatar } from '../../data/avatars';
import { Flame, Clock, Send, MessageCircle } from 'lucide-react';

interface MatchPlayScreenProps {
  roomCode: string;
  myProfile: PlayerProfile;
  players: ActiveMatchPlayer[];
  question: QuestionData;
  questionIndex: number;
  totalQuestions: number;
  lastRoundAnswer?: {
    isCorrect: boolean;
    correctAnswer: string;
    explanation?: string;
    roundScore: number;
  };
  onForfeit: () => void;
}

export const MatchPlayScreen: React.FC<MatchPlayScreenProps> = ({
  roomCode,
  myProfile,
  players,
  question,
  questionIndex,
  totalQuestions,
  lastRoundAnswer,
  onForfeit,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(question.timeLimitSeconds);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string; x: number }[]>([]);

  const questionStartTime = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  const me = players.find((p) => p.id === myProfile.id) || {
    id: myProfile.id,
    name: myProfile.name,
    avatar: myProfile.avatar,
    country: myProfile.country,
    rating: myProfile.rating,
    score: 0,
    combo: 0,
  };

  const opponent = players.find((p) => p.id !== myProfile.id) || {
    id: 'opp_default',
    name: 'Opponent',
    avatar: 'neon_cyborg',
    country: 'US',
    rating: 1200,
    score: 0,
    combo: 0,
  };

  const myAvatar = getAvatar(me.avatar);
  const oppAvatar = getAvatar(opponent.avatar);

  // Reset state on each new question
  useEffect(() => {
    setSelectedAnswer(null);
    setHasAnswered(false);
    setTimeLeft(question.timeLimitSeconds);
    questionStartTime.current = Date.now();

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // If time expires without answer
          if (!hasAnswered) {
            handleAnswerSubmission('__TIMEOUT__');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [question.id]);

  // Listen for incoming emoji reactions
  useEffect(() => {
    const unsub = multiplayer.on('emoji_received', (data) => {
      const newEmoji = {
        id: Math.random().toString(),
        emoji: data.emoji,
        x: Math.floor(Math.random() * 60) + 20, // 20% to 80%
      };
      setFloatingEmojis((prev) => [...prev, newEmoji]);
      setTimeout(() => {
        setFloatingEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
      }, 2500);
    });

    return () => unsub();
  }, []);

  const handleAnswerSubmission = (ans: string) => {
    if (hasAnswered) return;
    setHasAnswered(true);
    setSelectedAnswer(ans);

    const timeTakenMs = Date.now() - questionStartTime.current;
    multiplayer.submitAnswer(roomCode, myProfile.id, questionIndex, ans, timeTakenMs);
  };

  const handleSendEmoji = (emoji: string) => {
    haptic.light();
    soundFx.playClick();
    multiplayer.sendEmoji(roomCode, myProfile.id, emoji);
  };

  // Score comparison calculation
  const totalBoth = Math.max(1, me.score + opponent.score);
  const myScorePct = Math.round((me.score / totalBoth) * 100);

  return (
    <div className="min-h-screen bg-[#070914] text-slate-100 flex flex-col justify-between p-3 sm:p-5 select-none relative overflow-hidden">
      {/* Floating Emojis */}
      {floatingEmojis.map((e) => (
        <div
          key={e.id}
          className="absolute bottom-20 text-4xl animate-float-up pointer-events-none z-50 transition-all"
          style={{ left: `${e.x}%` }}
        >
          {e.emoji}
        </div>
      ))}

      {/* Top HUD Bar */}
      <div className="w-full max-w-xl mx-auto space-y-3 pt-1">
        {/* Opponent vs Me Header */}
        <div className="grid grid-cols-2 gap-3 items-center">
          {/* Me */}
          <div className="bg-[#0e1633] border border-cyan-500/30 rounded-2xl p-2.5 flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${myAvatar.gradient} flex items-center justify-center text-xl shrink-0`}>
              {myAvatar.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate">{me.name} (You)</span>
                {me.combo > 1 && (
                  <span className="text-[10px] text-amber-400 font-extrabold flex items-center gap-0.5">
                    <Flame className="w-3 h-3 fill-amber-400" /> {me.combo}x
                  </span>
                )}
              </div>
              <div className="text-lg font-black font-mono text-cyan-400 leading-none mt-0.5">
                {me.score}
              </div>
            </div>
          </div>

          {/* Opponent */}
          <div className="bg-[#191129] border border-purple-500/30 rounded-2xl p-2.5 flex items-center gap-2.5 text-right flex-row-reverse">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${oppAvatar.gradient} flex items-center justify-center text-xl shrink-0`}>
              {oppAvatar.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between flex-row-reverse">
                <span className="text-xs font-bold text-white truncate">{opponent.name}</span>
                {opponent.combo > 1 && (
                  <span className="text-[10px] text-amber-400 font-extrabold flex items-center gap-0.5">
                    <Flame className="w-3 h-3 fill-amber-400" /> {opponent.combo}x
                  </span>
                )}
              </div>
              <div className="text-lg font-black font-mono text-purple-400 leading-none mt-0.5">
                {opponent.score}
              </div>
            </div>
          </div>
        </div>

        {/* Tug of war score bar */}
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden flex border border-slate-700/60">
          <div
            className="h-full bg-cyan-400 transition-all duration-500"
            style={{ width: `${Math.max(10, Math.min(90, myScorePct))}%` }}
          />
          <div className="h-full bg-purple-500 flex-1 transition-all duration-500" />
        </div>

        {/* Question Counter & Timer */}
        <div className="flex items-center justify-between px-1 text-xs">
          <span className="font-extrabold text-cyan-400 uppercase tracking-wider font-mono">
            ROUND {questionIndex + 1} OF {totalQuestions}
          </span>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono font-black ${
            timeLeft <= 3
              ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Center Active Mini-Game View */}
      <div className="w-full max-w-xl mx-auto my-auto py-2">
        {question.category === 'math' && (
          <MathChallenge
            question={question}
            onAnswer={handleAnswerSubmission}
            disabled={hasAnswered}
            selectedAnswer={selectedAnswer}
          />
        )}
        {question.category === 'memory' && (
          <MemoryTest
            question={question}
            onAnswer={handleAnswerSubmission}
            disabled={hasAnswered}
            selectedAnswer={selectedAnswer}
          />
        )}
        {question.category === 'reaction' && (
          <ReactionTest
            question={question}
            onAnswer={handleAnswerSubmission}
            disabled={hasAnswered}
            selectedAnswer={selectedAnswer}
          />
        )}
        {question.category === 'logic' && (
          <LogicPuzzle
            question={question}
            onAnswer={handleAnswerSubmission}
            disabled={hasAnswered}
            selectedAnswer={selectedAnswer}
          />
        )}
        {question.category === 'number' && (
          <NumberChallenge
            question={question}
            onAnswer={handleAnswerSubmission}
            disabled={hasAnswered}
            selectedAnswer={selectedAnswer}
          />
        )}
      </div>

      {/* Bottom Bar: Emoji Reactions & Forfeit Option */}
      <div className="w-full max-w-xl mx-auto flex items-center justify-between pt-2 border-t border-slate-800/80">
        {/* Quick Reaction Emojis */}
        <div className="flex items-center gap-1.5">
          {['🧠', '🔥', '⚡', '🤯', '👏', '😂'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSendEmoji(emoji)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-400 active:scale-90 transition-all text-base"
            >
              {emoji}
            </button>
          ))}
        </div>

        <button
          onClick={onForfeit}
          className="text-xs text-slate-500 hover:text-rose-400 transition-colors font-medium underline"
        >
          Forfeit Match
        </button>
      </div>
    </div>
  );
};
