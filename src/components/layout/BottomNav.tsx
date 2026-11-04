import React from 'react';
import { Swords, Dumbbell, Calendar, Trophy, BarChart2, User, Home } from 'lucide-react';
import { soundFx } from '../../services/sound';
import { haptic } from '../../services/haptics';

export type NavTab = 'home' | 'battle' | 'practice' | 'daily' | 'tournaments' | 'leaderboard' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'battle', label: '1v1 Battle', icon: Swords, badge: 'LIVE' },
    { id: 'practice', label: 'Practice', icon: Dumbbell },
    { id: 'daily', label: 'Daily', icon: Calendar, dot: true },
    { id: 'tournaments', label: 'Cup', icon: Trophy },
    { id: 'leaderboard', label: 'Rankings', icon: BarChart2 },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const;

  const handleSelect = (tab: NavTab) => {
    haptic.light();
    soundFx.playClick();
    onTabChange(tab);
  };

  return (
    <nav className="w-full bg-[#090d21]/95 backdrop-blur-lg border-t border-cyan-500/20 py-1.5 px-2 z-40 sticky bottom-0">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id as NavTab)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive
                  ? 'text-cyan-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_#00e5ff]' : ''}`} />
                {'badge' in tab && tab.badge && (
                  <span className="absolute -top-1.5 -right-3 text-[8px] bg-rose-600 text-white font-extrabold px-1 rounded-full animate-pulse">
                    {tab.badge}
                  </span>
                )}
                {'dot' in tab && tab.dot && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-amber-400 rounded-full border border-black animate-ping" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {tab.label}
              </span>
              {isActive && (
                <div className="w-3.5 h-0.5 bg-cyan-400 rounded-full mt-0.5 shadow-[0_0_6px_#00e5ff]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
