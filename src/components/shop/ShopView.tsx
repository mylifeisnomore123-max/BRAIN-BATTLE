import React, { useState } from 'react';
import { PlayerProfile } from '../../types/game';
import { StorageService } from '../../services/storage';
import { soundFx } from '../../services/sound';
import { haptic } from '../../services/haptics';
import { X, PlaySquare, Crown, Palette, Sparkles, Check } from 'lucide-react';

interface ShopViewProps {
  isOpen: boolean;
  profile: PlayerProfile;
  onClose: () => void;
  onUpdateProfile: (updated: PlayerProfile) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  isOpen,
  profile,
  onClose,
  onUpdateProfile,
}) => {
  const [adWatching, setAdWatching] = useState(false);
  const [adProgress, setAdProgress] = useState(0);

  if (!isOpen) return null;

  const handleWatchRewardedAd = () => {
    if (adWatching) return;
    setAdWatching(true);
    setAdProgress(0);
    haptic.light();
    soundFx.playClick();

    const interval = setInterval(() => {
      setAdProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setAdWatching(false);
          haptic.success();
          soundFx.playVictory();
          // Reward 150 coins + 10 gems
          const updated = {
            ...profile,
            coins: profile.coins + 150,
            gems: profile.gems + 10,
          };
          StorageService.saveProfile(updated);
          onUpdateProfile(updated);
          return 100;
        }
        return prev + 25;
      });
    }, 600);
  };

  const handleActivateVIP = () => {
    haptic.success();
    soundFx.playVictory();
    const updated = {
      ...profile,
      isVIP: true,
      coins: profile.coins + 500,
      gems: profile.gems + 50,
    };
    StorageService.saveProfile(updated);
    onUpdateProfile(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#101736] to-[#0a0e22] border border-cyan-500/40 p-6 text-slate-100 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/60 border border-amber-500/30 rounded-full text-xs font-bold text-amber-300 uppercase tracking-widest mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Pure Cosmetics & Perks</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            Brain Battle Vault
          </h2>
          <p className="text-xs text-slate-300">
            Strictly fair play. No pay-to-win items. Customize your aesthetic!
          </p>
        </div>

        {/* Balance Display */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between">
            <span className="text-xs text-amber-300 font-bold">Coins:</span>
            <span className="text-sm font-mono font-black text-white">🪙 {profile.coins}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
            <span className="text-xs text-purple-300 font-bold">Gems:</span>
            <span className="text-sm font-mono font-black text-white">💎 {profile.gems}</span>
          </div>
        </div>

        {/* 1. Rewarded Video Ad Card */}
        <div className="p-4 rounded-2xl bg-[#0c142e] border border-cyan-500/30 mb-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlaySquare className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-xs font-extrabold text-white uppercase">Watch Rewarded Ad</div>
                <div className="text-[10px] text-slate-400">+150 Coins & +10 Gems free</div>
              </div>
            </div>

            <button
              onClick={handleWatchRewardedAd}
              disabled={adWatching}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-black font-black text-xs uppercase hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
            >
              {adWatching ? `${adProgress}%` : 'Watch'}
            </button>
          </div>

          {adWatching && (
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${adProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* 2. VIP Brain Battle Pass */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-[#121c3b] border border-purple-400/50 mb-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-400" />
              <div>
                <div className="text-xs font-extrabold text-white uppercase flex items-center gap-1.5">
                  <span>Brain Battle VIP Pass</span>
                  {profile.isVIP && (
                    <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-black">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-300">2x XP Booster, VIP Crown badge, 500 Coins bonus</div>
              </div>
            </div>
          </div>

          {!profile.isVIP ? (
            <button
              onClick={handleActivateVIP}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              Activate VIP Pass (Free Trial)
            </button>
          ) : (
            <div className="text-center text-[11px] text-amber-300 font-bold flex items-center justify-center gap-1">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>You enjoy full VIP Member privileges</span>
            </div>
          )}
        </div>

        {/* 3. Cosmetic Themes Selection */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-cyan-400" />
            <span>Cybernetic Neon Themes</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: 'navy-electric', name: 'Electric Cyan (Equipped)', hex: '#00e5ff' },
              { id: 'ultraviolet', name: 'Ultra Violet', hex: '#a855f7' },
              { id: 'matrix-emerald', name: 'Matrix Emerald', hex: '#10b981' },
              { id: 'solar-gold', name: 'Solar Gold', hex: '#f59e0b' },
            ].map((theme, i) => (
              <div
                key={theme.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer ${
                  i === 0
                    ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.hex }} />
                  <span className="font-semibold text-[11px] truncate">{theme.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
