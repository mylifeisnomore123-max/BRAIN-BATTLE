import React from 'react';
import { PlayerProfile, GameMode, GameCategory } from '../../types/game';
import { getAvatar, getRankBadge, getCountry } from '../../data/avatars';
import { soundFx } from '../../services/sound';
import { haptic } from '../../services/haptics';
import { Swords, Users, Zap, Calendar, Trophy, Dumbbell, Flame, ChevronRight, Award } from 'lucide-react';

interface HomeViewProps {
  profile: PlayerProfile;
  onStartMatchmaking: (mode: GameMode, category?: GameCategory) => void;
  onOpenCreateRoom: () => void;
  onOpenJoinRoom: () => void;
  onSelectTab: (tab: any) => void;
  onOpenShop: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  onStartMatchmaking,
  onOpenCreateRoom,
  onOpenJoinRoom,
  onSelectTab,
  onOpenShop,
}) => {
  const avatar = getAvatar(profile.avatar);
  const rank = getRankBadge(profile.rating);
  const country = getCountry(profile.country);

  const handleQuickPlay = () => {
    haptic.medium();
    soundFx.playClick();
    onStartMatchmaking('quick', 'all-round');
  };

  const gameModes = [
    {
      id: 'quick',
      title: '1v1 Quick Match',
      desc: 'Instant ranked clash with online rivals',
      icon: Swords,
      gradient: 'from-cyan-600/30 to-blue-900/40 border-cyan-500/50',
      badge: 'POPULAR',
      badgeColor: 'bg-cyan-500 text-black',
      action: () => onStartMatchmaking('quick', 'all-round'),
    },
    {
      id: 'friends',
      title: 'Play With Friends',
      desc: 'Create or join private room with code',
      icon: Users,
      gradient: 'from-purple-600/30 to-indigo-900/40 border-purple-500/50',
      badge: 'CUSTOM',
      badgeColor: 'bg-purple-500 text-white',
      action: onOpenCreateRoom,
    },
    {
      id: 'ranked',
      title: 'Random Online Opponent',
      desc: 'High stakes competitive ELO ranking',
      icon: Zap,
      gradient: 'from-amber-600/30 to-orange-900/40 border-amber-500/50',
      badge: 'COMPETITIVE',
      badgeColor: 'bg-amber-500 text-black',
      action: () => onStartMatchmaking('ranked', 'all-round'),
    },
    {
      id: 'daily',
      title: 'Daily Challenge',
      desc: '3 curated daily puzzles for bonus gems',
      icon: Calendar,
      gradient: 'from-emerald-600/30 to-teal-900/40 border-emerald-500/50',
      badge: '+150% XP',
      badgeColor: 'bg-emerald-500 text-black',
      action: () => onSelectTab('daily'),
    },
    {
      id: 'tournament',
      title: 'Tournament Cup',
      desc: '8-player knockout bracket championship',
      icon: Trophy,
      gradient: 'from-rose-600/30 to-pink-900/40 border-rose-500/50',
      badge: 'SEASON 4',
      badgeColor: 'bg-rose-500 text-white',
      action: () => onSelectTab('tournaments'),
    },
    {
      id: 'practice',
      title: 'Practice & Training',
      desc: 'Solo drills with custom difficulty levels',
      icon: Dumbbell,
      gradient: 'from-blue-600/30 to-slate-800/40 border-blue-500/50',
      badge: 'OFFLINE',
      badgeColor: 'bg-slate-700 text-slate-200',
      action: () => onSelectTab('practice'),
    },
  ];

  const miniGames = [
    { id: 'math', title: 'Math Challenge', icon: '📐', stat: 'Speed Arithmetic', color: 'border-cyan-500/30 bg-cyan-950/20' },
    { id: 'memory', title: 'Memory Test', icon: '🧩', stat: 'Pattern Recall', color: 'border-purple-500/30 bg-purple-950/20' },
    { id: 'reaction', title: 'Reaction Test', icon: '⚡', stat: 'Sub-300ms Reflex', color: 'border-amber-500/30 bg-amber-950/20' },
    { id: 'logic', title: 'Logic Puzzle', icon: '💡', stat: 'Brain Teasers', color: 'border-emerald-500/30 bg-emerald-950/20' },
    { id: 'number', title: 'Number Challenge', icon: '🔢', stat: 'Sequences & Series', color: 'border-violet-500/30 bg-violet-950/20' },
  ];

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 space-y-5">
      {/* Hero Card */}
      <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-[#0c132c] via-[#090e24] to-[#060814] p-5 shadow-[0_0_35px_rgba(6,182,212,0.15)]">
        <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <span className="text-xs font-black tracking-widest text-cyan-400 uppercase">
              BRAIN BATTLE ESPORTS
            </span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            1.4K PLAYERS ONLINE
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase leading-none mb-1.5">
          Challenge Your Mind.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400">
            Defeat Your Rival.
          </span>
        </h1>
        <p className="text-xs text-slate-300 mb-4 max-w-sm">
          Real-time 1v1 intellectual brain clashes. Mathematics, memory, reaction speed, logic and pattern deduction.
        </p>

        {/* Big Action Button */}
        <button
          onClick={handleQuickPlay}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-black font-black text-lg tracking-wide shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] transition-all transform active:scale-98 flex items-center justify-center gap-3"
        >
          <Swords className="w-6 h-6 text-black" />
          <span>FIND 1V1 MATCH NOW</span>
          <ChevronRight className="w-5 h-5 text-black" />
        </button>

        {/* Secondary Friends Row */}
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          <button
            onClick={onOpenCreateRoom}
            className="py-2 px-3 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs font-bold hover:bg-purple-900/60 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>➕</span> Create Room Code
          </button>
          <button
            onClick={onOpenJoinRoom}
            className="py-2 px-3 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>🔑</span> Join With Code
          </button>
        </div>
      </div>

      {/* Player Standing Card */}
      <div className="bg-[#0b1026] border border-cyan-500/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${avatar.gradient} p-0.5 flex items-center justify-center shadow-md`}>
            <span className="text-2xl">{avatar.emoji}</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-white">{profile.name}</span>
              <span>{country.flag}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-1.5 py-0.2 rounded border font-bold ${rank.color}`}>
                {rank.icon} {rank.title}
              </span>
              <span className="text-cyan-400 font-mono font-bold">{profile.rating} ELO</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400 font-medium">Win Streak</div>
          <div className="text-amber-400 font-extrabold text-lg flex items-center justify-end gap-1 font-mono">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>{profile.winStreak}W</span>
          </div>
        </div>
      </div>

      {/* Game Modes Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-300">
            Battle Modes
          </span>
          <span className="text-[11px] text-cyan-400 font-medium">Select Arena</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {gameModes.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                onClick={m.action}
                className={`p-3.5 rounded-2xl border bg-gradient-to-br ${m.gradient} hover:scale-[1.01] transition-all cursor-pointer shadow-md flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white">{m.title}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${m.badgeColor}`}>
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-1">{m.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            );
          })}
        </div>
      </div>

      {/* The 5 Mini-Games Practice / Drill Spotlight */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-300">
            5 Core Cognitive Disciplines
          </span>
          <button
            onClick={() => onSelectTab('practice')}
            className="text-[11px] text-cyan-400 hover:underline font-bold"
          >
            Practice All →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {miniGames.map((g) => (
            <button
              key={g.id}
              onClick={() => onStartMatchmaking('quick', g.id as GameCategory)}
              className={`p-2.5 rounded-xl border ${g.color} text-left transition-all hover:border-cyan-400 active:scale-95`}
            >
              <div className="text-xl mb-1">{g.icon}</div>
              <div className="text-xs font-bold text-white leading-tight">{g.title}</div>
              <div className="text-[10px] text-slate-400 font-medium">{g.stat}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
