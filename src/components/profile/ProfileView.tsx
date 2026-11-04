import React, { useState } from 'react';
import { PlayerProfile, Achievement, MatchHistoryItem } from '../../types/game';
import { AVATARS, COUNTRIES, getAvatar, getCountry, getRankBadge } from '../../data/avatars';
import { StorageService } from '../../services/storage';
import { soundFx } from '../../services/sound';
import { haptic } from '../../services/haptics';
import { User, Trophy, Flame, Shield, CheckCircle2, History, Edit3, Save, X, Award } from 'lucide-react';

interface ProfileViewProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'history' | 'achievements'>('stats');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editAvatar, setEditAvatar] = useState(profile.avatar);
  const [editCountry, setEditCountry] = useState(profile.country);
  const [achievements, setAchievements] = useState<Achievement[]>(StorageService.getAchievements());
  const history: MatchHistoryItem[] = StorageService.getHistory();

  const avatar = getAvatar(profile.avatar);
  const country = getCountry(profile.country);
  const rank = getRankBadge(profile.rating);

  const xpNeeded = profile.level * 150;
  const xpPercentage = Math.min(100, Math.round((profile.xp / xpNeeded) * 100));
  const winRate = profile.matchesPlayed > 0 ? Math.round((profile.wins / profile.matchesPlayed) * 100) : 0;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    haptic.medium();
    soundFx.playCorrect(1);
    const updated = {
      ...profile,
      name: editName.trim() || profile.name,
      avatar: editAvatar,
      country: editCountry,
    };
    StorageService.saveProfile(updated);
    onUpdateProfile(updated);
    setIsEditing(false);
  };

  const handleClaimAchievement = (achId: string) => {
    const target = achievements.find((a) => a.id === achId);
    if (!target || target.isClaimed || target.currentProgress < target.targetProgress) return;

    haptic.success();
    soundFx.playVictory();

    const nextAch = achievements.map((a) => (a.id === achId ? { ...a, isClaimed: true } : a));
    setAchievements(nextAch);
    StorageService.saveAchievements(nextAch);

    const updatedProfile = {
      ...profile,
      coins: profile.coins + target.rewardCoins,
      gems: profile.gems + target.rewardGems,
    };
    StorageService.saveProfile(updatedProfile);
    onUpdateProfile(updatedProfile);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 space-y-5">
      {/* Profile Header Card */}
      <div className="rounded-3xl bg-gradient-to-br from-[#10183b] via-[#0b1029] to-[#060814] border border-cyan-500/30 p-5 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 text-cyan-400 hover:text-white transition-colors"
          title="Edit Profile"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${avatar.gradient} p-0.5 shadow-lg flex items-center justify-center text-3xl shrink-0`}>
            {avatar.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white truncate">{profile.name}</h2>
              <span className="text-lg">{country.flag}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${rank.color}`}>
                {rank.icon} {rank.title}
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {profile.rating} ELO
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium italic">
              "{profile.title}"
            </div>
          </div>
        </div>

        {/* XP Level Progress Bar */}
        <div className="mt-4 pt-3 border-t border-cyan-500/20">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-300">
              Level {profile.level} Challenger
            </span>
            <span className="text-cyan-400 font-mono font-bold">
              {profile.xp} / {xpNeeded} XP
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Profile Edit Modal / Drawer */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="p-5 rounded-3xl bg-[#0c122b] border border-cyan-500/40 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-white uppercase tracking-wider">
              Edit Player Identity
            </span>
            <button type="button" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Gamer Nickname:</label>
            <input
              type="text"
              maxLength={18}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">Select Avatar:</label>
            <div className="grid grid-cols-4 gap-2">
              {AVATARS.map((av) => (
                <button
                  type="button"
                  key={av.id}
                  onClick={() => setEditAvatar(av.id)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    editAvatar === av.id
                      ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_12px_#00e5ff]'
                      : 'border-slate-800 bg-slate-900/60'
                  }`}
                >
                  <span className="text-2xl">{av.emoji}</span>
                  <span className="text-[9px] text-slate-300 mt-1 truncate max-w-full font-bold">{av.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Select Country / Region:</label>
            <select
              value={editCountry}
              onChange={(e) => setEditCountry(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-cyan-400"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </form>
      )}

      {/* Tab Navigation */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#090e24] rounded-2xl border border-cyan-500/20">
        {[
          { id: 'stats', label: 'Career Stats' },
          { id: 'achievements', label: 'Achievements' },
          { id: 'history', label: 'Match History' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              haptic.light();
              soundFx.playClick();
              setActiveTab(tab.id as any);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-black shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Stats */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-[#0d142d] border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Matches</div>
            <div className="text-xl font-black font-mono text-white mt-1">{profile.matchesPlayed}</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#0d142d] border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Win Rate</div>
            <div className="text-xl font-black font-mono text-emerald-400 mt-1">{winRate}%</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#0d142d] border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Wins / Losses</div>
            <div className="text-base font-black font-mono text-cyan-300 mt-1">{profile.wins}W - {profile.losses}L</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#0d142d] border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Max Streak</div>
            <div className="text-xl font-black font-mono text-amber-400 mt-1">{profile.bestWinStreak}W 🔥</div>
          </div>
        </div>
      )}

      {/* Tab Content: Achievements */}
      {activeTab === 'achievements' && (
        <div className="space-y-2.5">
          {achievements.map((ach) => {
            const canClaim = !ach.isClaimed && ach.currentProgress >= ach.targetProgress;
            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  ach.isClaimed
                    ? 'bg-slate-900/40 border-slate-800 opacity-60'
                    : canClaim
                    ? 'bg-gradient-to-r from-amber-950/40 to-[#121c38] border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                    : 'bg-[#0d142d] border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{ach.icon}</span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">{ach.title}</h4>
                    <p className="text-[11px] text-slate-400">{ach.description}</p>
                    <div className="text-[10px] text-amber-300 font-mono mt-0.5">
                      +{ach.rewardCoins} 🪙 +{ach.rewardGems} 💎
                    </div>
                  </div>
                </div>

                <div>
                  {ach.isClaimed ? (
                    <span className="text-[10px] px-2 py-1 rounded-lg bg-slate-800 text-slate-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Claimed
                    </span>
                  ) : canClaim ? (
                    <button
                      onClick={() => handleClaimAchievement(ach.id)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs uppercase tracking-wider animate-bounce"
                    >
                      Claim!
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-slate-400 font-bold">
                      {ach.currentProgress}/{ach.targetProgress}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Content: Match History */}
      {activeTab === 'history' && (
        <div className="space-y-2">
          {history.map((h) => {
            const isWin = h.result === 'win';
            return (
              <div
                key={h.id}
                className="p-3 rounded-2xl bg-[#0d142d] border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-10 rounded-full ${isWin ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      <span>vs {h.opponentName}</span>
                      <span className="text-xs">{getCountry(h.opponentCountry).flag}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {h.mode} Mode • {h.category}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-xs font-black font-mono ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {h.myScore} - {h.opponentScore} ({h.result.toUpperCase()})
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono">
                    {h.ratingDelta >= 0 ? `+${h.ratingDelta}` : h.ratingDelta} ELO
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
