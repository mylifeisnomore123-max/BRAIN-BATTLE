import React from 'react';
import { PlayerProfile } from '../../types/game';
import { Trophy, Users, Award, Shield, ChevronRight } from 'lucide-react';
import { soundFx } from '../../services/sound';
import { haptic } from '../../services/haptics';

interface TournamentViewProps {
  profile: PlayerProfile;
  onEnterMatch: () => void;
}

export const TournamentView: React.FC<TournamentViewProps> = ({ profile, onEnterMatch }) => {
  const bracketMatches = [
    { id: 'm1', round: 'Quarter-Final', p1: `${profile.name} (BD 🇧🇩)`, p2: 'Alex_UK (GB 🇬🇧)', score: 'Advancing', isUser: true },
    { id: 'm2', round: 'Quarter-Final', p1: 'Aarav_MathX (IN 🇮🇳)', p2: 'Kenji_Zero (JP 🇯🇵)', score: 'Aarav Wins', isUser: false },
    { id: 'm3', round: 'Quarter-Final', p1: 'QuantumBrain (US 🇺🇸)', p2: 'Lukas_DE (DE 🇩🇪)', score: 'Quantum Wins', isUser: false },
    { id: 'm4', round: 'Quarter-Final', p1: 'Nafisa_Logic (BD 🇧🇩)', p2: 'Arthur_Mind (GB 🇬🇧)', score: 'Nafisa Wins', isUser: false },
  ];

  const handleEnter = () => {
    haptic.medium();
    soundFx.playClick();
    onEnterMatch();
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 space-y-5">
      {/* Trophy Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#2a133b] via-[#1b0d2b] to-[#0d0718] border border-purple-500/40 p-5 shadow-[0_0_35px_rgba(168,85,247,0.2)] relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
              BRAIN BATTLE CROWN CUP #42
            </span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-400/50 text-purple-300 font-mono font-bold">
            Knockout 8
          </span>
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight uppercase">
          World Intellectual Cup
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-sm">
          Knockout tournament: 3 back-to-back elimination matches. Survive all rounds to earn the Gold Crown Trophy and 5,000 Coins.
        </p>

        {/* Prize Pool Box */}
        <div className="mt-4 p-3 bg-black/40 rounded-2xl border border-purple-500/30 flex items-center justify-between text-xs">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">1st Place Prize</div>
            <div className="text-amber-300 font-black font-mono text-sm mt-0.5">
              🏆 Crown Trophy + 5,000 🪙 + 100 💎
            </div>
          </div>
          <button
            onClick={handleEnter}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black rounded-xl text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            Play Next Round
          </button>
        </div>
      </div>

      {/* Bracket Tree */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-300">
            Tournament Bracket Tree
          </span>
          <span className="text-xs text-cyan-400 font-bold">Stage 1: Quarter-Finals</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {bracketMatches.map((m) => (
            <div
              key={m.id}
              className={`p-3.5 rounded-2xl border ${
                m.isUser
                  ? 'bg-gradient-to-br from-[#121f42] to-[#0b142e] border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-[#0f1429] border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold mb-2">
                <span>{m.round}</span>
                <span className={m.isUser ? 'text-cyan-400' : 'text-slate-500'}>{m.score}</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className={`p-2 rounded-lg flex items-center justify-between font-semibold ${
                  m.isUser ? 'bg-cyan-500/20 text-white font-bold border border-cyan-500/30' : 'bg-black/30 text-slate-200'
                }`}>
                  <span>{m.p1}</span>
                  <span className="text-[10px] text-emerald-400">ADV</span>
                </div>
                <div className="p-2 rounded-lg bg-black/20 text-slate-400 flex items-center justify-between font-medium">
                  <span>{m.p2}</span>
                  <span className="text-[10px] text-slate-600">ELIM</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
