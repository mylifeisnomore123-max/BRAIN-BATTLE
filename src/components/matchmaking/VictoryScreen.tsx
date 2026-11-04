import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { PlayerProfile } from '../../types/game';
import { soundFx } from '../../services/sound';
import { haptic } from '../../services/haptics';
import { multiplayer } from '../../services/multiplayer';
import { Trophy, Flame, Zap, ArrowLeft, RefreshCw, CheckCircle, Award } from 'lucide-react';

interface VictoryScreenProps {
  roomCode: string;
  myProfile: PlayerProfile;
  winnerId: string | null;
  stats?: {
    myScore: number;
    oppScore: number;
    ratingDelta: number;
    xpGained: number;
    coinsGained: number;
  };
  rematchRequestedByOpponent?: boolean;
  rematchRequestedByMe?: boolean;
  onReturnHome: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  roomCode,
  myProfile,
  winnerId,
  stats = {
    myScore: 780,
    oppScore: 640,
    ratingDelta: 24,
    xpGained: 150,
    coinsGained: 80,
  },
  rematchRequestedByOpponent,
  rematchRequestedByMe,
  onReturnHome,
}) => {
  const isWinner = winnerId === myProfile.id;
  const isDraw = winnerId === null;
  const [rematchSent, setRematchSent] = useState(rematchRequestedByMe || false);

  useEffect(() => {
    if (isWinner) {
      soundFx.playVictory();
      haptic.success();
      // Confetti burst
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00e5ff', '#a855f7', '#fbbf24', '#3b82f6'],
        });
      } catch (e) {
        // ignore
      }
    } else if (isDraw) {
      soundFx.playCorrect(1);
    } else {
      soundFx.playWrong();
      haptic.error();
    }
  }, [isWinner, isDraw]);

  const handleRequestRematch = () => {
    setRematchSent(true);
    haptic.medium();
    soundFx.playClick();
    multiplayer.requestRematch(roomCode, myProfile.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-[#070914] select-none overflow-y-auto">
      {/* Background glow */}
      <div className={`absolute top-1/4 w-80 h-80 rounded-full blur-[100px] pointer-events-none ${
        isWinner ? 'bg-cyan-500/20' : isDraw ? 'bg-amber-500/15' : 'bg-rose-500/15'
      }`} />

      {/* Header Banner */}
      <div className="text-center pt-4 z-10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300">
          <span>ROOM: {roomCode}</span>
        </div>

        <div className="space-y-1">
          <div className="text-5xl sm:text-6xl animate-bounce">
            {isWinner ? '🏆' : isDraw ? '🤝' : '💀'}
          </div>
          <h1 className={`text-3xl sm:text-4xl font-black uppercase tracking-tight ${
            isWinner
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-purple-400 drop-shadow-[0_0_20px_#00e5ff]'
              : isDraw
              ? 'text-amber-300'
              : 'text-rose-400'
          }`}>
            {isWinner ? 'VICTORY!' : isDraw ? 'STALEMATE DRAW' : 'DEFEAT'}
          </h1>
          <p className="text-xs text-slate-300 font-medium">
            {isWinner
              ? 'Outstanding cognitive performance! Your synapse fired faster.'
              : isDraw
              ? 'Evenly matched intellects! Both showed remarkable mental speed.'
              : 'Close battle! Train in Practice Mode and bounce back stronger.'}
          </p>
        </div>
      </div>

      {/* Match Score & Stats Card */}
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#111838] to-[#0a0f26] border border-cyan-500/30 p-5 shadow-2xl z-10 space-y-4">
        {/* Score Differential */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/40 rounded-2xl border border-white/5">
          <div className="text-center flex-1">
            <div className="text-[10px] text-cyan-400 uppercase font-bold">You</div>
            <div className="text-2xl font-black font-mono text-white">{stats.myScore}</div>
          </div>
          <div className="text-slate-500 font-bold px-2 text-sm">VS</div>
          <div className="text-center flex-1">
            <div className="text-[10px] text-purple-400 uppercase font-bold">Rival</div>
            <div className="text-2xl font-black font-mono text-white">{stats.oppScore}</div>
          </div>
        </div>

        {/* ELO Rating & Rewards */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {/* ELO */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Rating</div>
            <div className={`text-sm font-black font-mono flex items-center justify-center gap-0.5 ${
              stats.ratingDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              <span>{stats.ratingDelta >= 0 ? `+${stats.ratingDelta}` : stats.ratingDelta}</span>
            </div>
          </div>

          {/* XP */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">XP</div>
            <div className="text-sm font-black font-mono text-cyan-300">
              +{stats.xpGained}
            </div>
          </div>

          {/* Coins */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Coins</div>
            <div className="text-sm font-black font-mono text-amber-300">
              +{stats.coinsGained}
            </div>
          </div>
        </div>

        {/* Rematch Status Box */}
        {rematchRequestedByOpponent && !rematchSent && (
          <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-300 text-center animate-pulse">
            🔥 Opponent wants a rematch! Accept below to battle again.
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-2.5 z-10 pb-4">
        {/* Rematch Button */}
        <button
          onClick={handleRequestRematch}
          disabled={rematchSent}
          className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all transform active:scale-98 ${
            rematchSent
              ? 'bg-slate-800 border border-cyan-500/30 text-cyan-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:brightness-110'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${rematchSent ? 'animate-spin' : ''}`} />
          <span>{rematchSent ? 'Waiting for Rival...' : 'Request Rematch'}</span>
        </button>

        {/* Back to Lobby */}
        <button
          onClick={onReturnHome}
          className="w-full py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Lobby</span>
        </button>
      </div>
    </div>
  );
};
