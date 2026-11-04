import React, { useState, useEffect } from 'react';
import { PlayerProfile, LeaderboardEntry } from '../../types/game';
import { getAvatar, getCountry, getRankBadge } from '../../data/avatars';
import { Trophy, Globe, Flame, Shield, ArrowUpRight } from 'lucide-react';
import { soundFx } from '../../services/sound';
import { haptic } from '../../services/haptics';

interface LeaderboardViewProps {
  profile: PlayerProfile;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ profile }) => {
  const [regionFilter, setRegionFilter] = useState<'GLOBAL' | 'BD' | 'US' | 'IN'>('GLOBAL');
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'all-time'>('weekly');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [regionFilter, timeframe]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const url = regionFilter === 'BD' ? '/api/leaderboard?region=BD' : '/api/leaderboard';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (e) {
      console.warn('API error, using cached rankings', e);
    } finally {
      setLoading(false);
    }
  };

  const top3 = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  const handleTabClick = (reg: any) => {
    haptic.light();
    soundFx.playClick();
    setRegionFilter(reg);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 space-y-5">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#121a3b] to-[#070b1a] border border-cyan-500/30 p-5 shadow-[0_0_30px_rgba(6,182,212,0.15)] text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-950/80 border border-cyan-500/40 rounded-full text-xs font-bold text-cyan-300 uppercase tracking-widest mb-2">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Competitive Hall of Fame</span>
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
          Global & Country Rankings
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
          Season 4 Cognitive Standings. Climb the ELO ladder to qualify for the Championship Invitational.
        </p>

        {/* Region Filter Buttons */}
        <div className="grid grid-cols-4 gap-1.5 mt-4">
          {[
            { id: 'GLOBAL', label: 'Global 🌐' },
            { id: 'BD', label: 'Bangladesh 🇧🇩' },
            { id: 'US', label: 'USA 🇺🇸' },
            { id: 'IN', label: 'India 🇮🇳' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id as any)}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                regionFilter === tab.id
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_#00e5ff] font-extrabold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 pt-2 items-end">
          {/* 2nd Place */}
          <div className="p-3 rounded-2xl bg-gradient-to-t from-[#141b36] to-[#0d1226] border border-slate-500/30 flex flex-col items-center text-center">
            <span className="text-2xl">🥈</span>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-400 to-slate-600 flex items-center justify-center text-2xl my-1.5 shadow-md">
              {getAvatar(top3[1].avatar).emoji}
            </div>
            <div className="text-xs font-bold text-white truncate max-w-[90px]">{top3[1].name}</div>
            <div className="text-[10px] text-cyan-300 font-mono font-bold">{top3[1].rating} ELO</div>
            <span className="text-xs mt-0.5">{getCountry(top3[1].country).flag}</span>
          </div>

          {/* 1st Place (Gold) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-t from-amber-950/60 to-[#121c3b] border-2 border-amber-400/70 flex flex-col items-center text-center -translate-y-2 shadow-[0_0_25px_rgba(251,191,36,0.25)]">
            <span className="text-3xl animate-bounce">👑</span>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-3xl my-1.5 shadow-lg">
              {getAvatar(top3[0].avatar).emoji}
            </div>
            <div className="text-xs font-black text-amber-200 truncate max-w-[100px]">{top3[0].name}</div>
            <div className="text-xs text-amber-400 font-mono font-black">{top3[0].rating} ELO</div>
            <span className="text-xs mt-0.5">{getCountry(top3[0].country).flag}</span>
          </div>

          {/* 3rd Place */}
          <div className="p-3 rounded-2xl bg-gradient-to-t from-[#141b36] to-[#0d1226] border border-amber-700/30 flex flex-col items-center text-center">
            <span className="text-2xl">🥉</span>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-700 to-orange-800 flex items-center justify-center text-2xl my-1.5 shadow-md">
              {getAvatar(top3[2].avatar).emoji}
            </div>
            <div className="text-xs font-bold text-white truncate max-w-[90px]">{top3[2].name}</div>
            <div className="text-[10px] text-cyan-300 font-mono font-bold">{top3[2].rating} ELO</div>
            <span className="text-xs mt-0.5">{getCountry(top3[2].country).flag}</span>
          </div>
        </div>
      )}

      {/* Remaining Leaderboard List */}
      <div className="space-y-2">
        {remaining.map((entry) => {
          const rankConf = getRankBadge(entry.rating);
          const avatarConf = getAvatar(entry.avatar);
          const countryConf = getCountry(entry.country);

          return (
            <div
              key={entry.id}
              className="p-3 rounded-2xl bg-[#0b1024] border border-slate-800 flex items-center justify-between hover:border-cyan-500/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-sm text-slate-400 w-5 text-center">
                  #{entry.rank}
                </span>

                <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${avatarConf.gradient} flex items-center justify-center text-lg`}>
                  {avatarConf.emoji}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-white">{entry.name}</span>
                    <span className="text-xs">{countryConf.flag}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {entry.wins}W - {entry.losses}L • <span className="text-cyan-400">{entry.title}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs sm:text-sm font-black font-mono text-cyan-400">
                  {entry.rating} ELO
                </div>
                <div className={`text-[9px] font-bold px-1 rounded border inline-block ${rankConf.color}`}>
                  {rankConf.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
