import React, { useState } from 'react';
import { PlayerProfile } from '../../types/game';
import { getAvatar, getRankBadge } from '../../data/avatars';
import { soundFx } from '../../services/sound';
import { Volume2, VolumeX, Smartphone, Monitor, Shield, Zap } from 'lucide-react';

interface NavbarProps {
  profile: PlayerProfile;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  onOpenProfile: () => void;
  onOpenShop: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  isMobileFrame,
  onToggleMobileFrame,
  onOpenProfile,
  onOpenShop,
}) => {
  const [isMuted, setIsMuted] = useState(soundFx.getMuted());
  const avatar = getAvatar(profile.avatar);
  const rank = getRankBadge(profile.rating);

  const toggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) soundFx.playClick();
  };

  return (
    <header className="w-full bg-[#080c1d]/90 backdrop-blur-md border-b border-cyan-500/20 px-3.5 py-2.5 z-40 sticky top-0">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={onOpenProfile}>
          <div className="relative">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${avatar.gradient} p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center`}>
              <span className="text-xl">{avatar.emoji}</span>
            </div>
            <span className="absolute -bottom-1 -right-1 text-[10px] bg-cyan-950 border border-cyan-400 rounded-full px-1 font-bold text-cyan-300">
              L{profile.level}
            </span>
          </div>

          <div className="hidden xs:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-wide text-white leading-tight">
                {profile.name}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${rank.color}`}>
                {rank.icon} {rank.title}
              </span>
            </div>
            <div className="text-[11px] text-cyan-400 font-mono flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400 inline" />
              <span>{profile.rating} ELO</span>
            </div>
          </div>
        </div>

        {/* Currency & Actions */}
        <div className="flex items-center gap-2">
          {/* Brain Coins */}
          <button
            onClick={onOpenShop}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-950/40 border border-amber-500/30 rounded-lg text-amber-300 hover:bg-amber-900/40 transition-colors"
          >
            <span className="text-sm">🪙</span>
            <span className="text-xs font-mono font-bold">{profile.coins}</span>
          </button>

          {/* Brain Gems */}
          <button
            onClick={onOpenShop}
            className="flex items-center gap-1 px-2.5 py-1 bg-purple-950/40 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-900/40 transition-colors"
          >
            <span className="text-sm">💎</span>
            <span className="text-xs font-mono font-bold">{profile.gems}</span>
          </button>

          {/* Mute/Unmute sound */}
          <button
            onClick={toggleSound}
            aria-label="Toggle Sound Effects"
            className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:border-cyan-400 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Device Frame Viewport Toggle */}
          <button
            onClick={onToggleMobileFrame}
            title={isMobileFrame ? 'Switch to Fullscreen / Tablet View' : 'Switch to Android Mobile Device Shell'}
            className="hidden sm:flex p-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-cyan-400 transition-colors"
          >
            {isMobileFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
