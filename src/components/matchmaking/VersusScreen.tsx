import React, { useEffect, useState } from 'react';
import { ActiveMatchPlayer } from '../../types/game';
import { getAvatar, getRankBadge, getCountry } from '../../data/avatars';
import { soundFx } from '../../services/sound';

interface VersusScreenProps {
  players: ActiveMatchPlayer[];
  category: string;
  onCountdownComplete: () => void;
}

export const VersusScreen: React.FC<VersusScreenProps> = ({
  players,
  category,
  onCountdownComplete,
}) => {
  const [countdown, setCountdown] = useState<number>(3);

  const p1 = players[0] || { id: 'p1', name: 'Player 1', avatar: 'cyber_ninja', country: 'BD', rating: 1200 };
  const p2 = players[1] || { id: 'p2', name: 'Rival Mind', avatar: 'neon_cyborg', country: 'US', rating: 1230 };

  const p1Avatar = getAvatar(p1.avatar);
  const p2Avatar = getAvatar(p2.avatar);
  const p1Country = getCountry(p1.country);
  const p2Country = getCountry(p2.country);
  const p1Rank = getRankBadge(p1.rating);
  const p2Rank = getRankBadge(p2.rating);

  useEffect(() => {
    soundFx.playCountdownTick(false);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          soundFx.playCountdownTick(true);
          setTimeout(() => {
            onCountdownComplete();
          }, 600);
          return 0;
        }
        soundFx.playCountdownTick(false);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-[#070914] select-none overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/15 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Header Info */}
      <div className="text-center pt-4 z-10">
        <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40">
          BRAIN BATTLE 1V1 ARENA
        </span>
        <h2 className="text-sm font-semibold text-slate-300 mt-2 capitalize">
          Category: <span className="text-white font-extrabold">{category}</span>
        </h2>
      </div>

      {/* Versus Combatants Clash */}
      <div className="w-full max-w-md flex items-center justify-between gap-4 z-10 py-6">
        {/* Player 1 Card */}
        <div className="flex-1 flex flex-col items-center text-center space-y-2">
          <div className="relative">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${p1Avatar.gradient} p-0.5 shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center justify-center transform -rotate-3`}>
              <span className="text-4xl">{p1Avatar.emoji}</span>
            </div>
            <span className="absolute -bottom-1 -right-1 text-sm">{p1Country.flag}</span>
          </div>

          <div>
            <div className="font-extrabold text-base text-white truncate max-w-[120px]">
              {p1.name}
            </div>
            <div className={`text-[10px] font-bold px-1.5 py-0.2 rounded border inline-block ${p1Rank.color}`}>
              {p1Rank.icon} {p1.rating}
            </div>
          </div>
        </div>

        {/* Center VS Emblem */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 p-0.5 shadow-[0_0_30px_rgba(168,85,247,0.6)] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              <span className="font-black text-xl italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-mono">
                VS
              </span>
            </div>
          </div>
        </div>

        {/* Player 2 Card */}
        <div className="flex-1 flex flex-col items-center text-center space-y-2">
          <div className="relative">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${p2Avatar.gradient} p-0.5 shadow-[0_0_25px_rgba(168,85,247,0.5)] flex items-center justify-center transform rotate-3`}>
              <span className="text-4xl">{p2Avatar.emoji}</span>
            </div>
            <span className="absolute -bottom-1 -right-1 text-sm">{p2Country.flag}</span>
          </div>

          <div>
            <div className="font-extrabold text-base text-white truncate max-w-[120px]">
              {p2.name}
            </div>
            <div className={`text-[10px] font-bold px-1.5 py-0.2 rounded border inline-block ${p2Rank.color}`}>
              {p2Rank.icon} {p2.rating}
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Ring */}
      <div className="text-center pb-8 z-10 flex flex-col items-center">
        <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">
          MATCH COMMENCING IN
        </div>
        <div className="w-20 h-20 rounded-full border-4 border-cyan-400/80 bg-cyan-950/40 flex items-center justify-center text-4xl font-black text-cyan-300 font-mono shadow-[0_0_30px_#00e5ff] animate-pulse">
          {countdown > 0 ? countdown : 'GO!'}
        </div>
      </div>
    </div>
  );
};
