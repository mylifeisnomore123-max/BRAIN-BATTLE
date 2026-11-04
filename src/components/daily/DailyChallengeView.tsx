import React, { useState } from 'react';
import { PlayerProfile, GameCategory } from '../../types/game';
import { Calendar, CheckCircle2, Trophy, Flame, ChevronRight } from 'lucide-react';
import { soundFx } from '../../services/sound';
import { haptic } from '../../services/haptics';

interface DailyChallengeViewProps {
  profile: PlayerProfile;
  onPlayStage: (category: GameCategory) => void;
}

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({ profile, onPlayStage }) => {
  const [stages, setStages] = useState([
    { id: 1, title: 'Calculus Sprint', category: 'math' as GameCategory, target: 'Solve 5 quick math puzzles', reward: '80 Coins + 5 Gems', completed: true },
    { id: 2, title: 'Hypersonic Reflex', category: 'reaction' as GameCategory, target: 'React under 280ms', reward: '90 Coins + 5 Gems', completed: false },
    { id: 3, title: 'Grandmaster Deduction', category: 'logic' as GameCategory, target: 'Solve logic teaser', reward: '100 Coins + 10 Gems', completed: false },
  ]);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentStreak = profile.winStreak || 3;

  const handleStageClick = (cat: GameCategory) => {
    haptic.medium();
    soundFx.playClick();
    onPlayStage(cat);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 space-y-5">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#121b3d] via-[#0d132b] to-[#070a18] border border-emerald-500/30 p-5 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
              DAILY BRAIN EXPEDITION
            </span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono font-bold">
            Day #312
          </span>
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight uppercase">
          Synapse Daily Circuit
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-sm">
          Complete all 3 stages today to maintain your mental streak and claim the Grand Daily Chest.
        </p>

        {/* Streak Tracker */}
        <div className="mt-4 pt-3 border-t border-emerald-500/20">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              Daily Streak: <strong className="text-amber-300">{currentStreak} Days</strong>
            </span>
            <span className="text-emerald-400 font-mono font-bold">+150% XP Active</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {daysOfWeek.map((day, idx) => {
              const isDone = idx < 3;
              const isToday = idx === 3;
              return (
                <div
                  key={day}
                  className={`py-2 rounded-xl text-center border transition-all ${
                    isDone
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 font-bold'
                      : isToday
                      ? 'bg-amber-950/80 border-amber-400 text-amber-300 font-black shadow-[0_0_10px_#f59e0b]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="text-[10px] uppercase">{day}</div>
                  <div className="text-xs mt-0.5">{isDone ? '✓' : isToday ? '⚡' : '○'}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3 Stages Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-300">
            Today's 3 Disciplines
          </span>
          <span className="text-xs text-slate-400">1 of 3 Completed</span>
        </div>

        {stages.map((stage) => (
          <div
            key={stage.id}
            onClick={() => handleStageClick(stage.category)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-md ${
              stage.completed
                ? 'bg-emerald-950/20 border-emerald-500/40 hover:bg-emerald-950/30'
                : 'bg-[#0f1738] border-cyan-500/30 hover:border-cyan-400 hover:scale-[1.01]'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                stage.completed ? 'bg-emerald-500 text-black' : 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
              }`}>
                {stage.completed ? '✓' : `0${stage.id}`}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{stage.title}</span>
                  {stage.completed && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                      CLEARED
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-300 mt-0.5">{stage.target}</div>
                <div className="text-[10px] text-amber-300 font-mono mt-1">🎁 Reward: {stage.reward}</div>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};
