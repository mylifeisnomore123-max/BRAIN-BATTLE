import { PlayerProfile, MatchHistoryItem, Achievement } from '../types/game';

const PROFILE_KEY = 'brain_battle_profile_v1';
const HISTORY_KEY = 'brain_battle_history_v1';
const ACHIEVEMENTS_KEY = 'brain_battle_achievements_v1';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win',
    title: 'First Blood',
    description: 'Win your first 1v1 Brain Battle match',
    icon: '⚔️',
    currentProgress: 1,
    targetProgress: 1,
    isClaimed: false,
    rewardCoins: 100,
    rewardGems: 10,
  },
  {
    id: 'speed_demon',
    title: 'Sub-Second Synapse',
    description: 'Answer any question correctly in under 1 second',
    icon: '⚡',
    currentProgress: 1,
    targetProgress: 1,
    isClaimed: false,
    rewardCoins: 150,
    rewardGems: 15,
  },
  {
    id: 'streak_master',
    title: 'Combo Monarch',
    description: 'Achieve a 5-question combo streak',
    icon: '🔥',
    currentProgress: 3,
    targetProgress: 5,
    isClaimed: false,
    rewardCoins: 200,
    rewardGems: 20,
  },
  {
    id: 'math_prodigy',
    title: 'Mental Math Demon',
    description: 'Win 3 Math Challenge battles',
    icon: '📐',
    currentProgress: 2,
    targetProgress: 3,
    isClaimed: false,
    rewardCoins: 150,
    rewardGems: 15,
  },
  {
    id: 'memory_master',
    title: 'Photographic Memory',
    description: 'Complete 3 Memory Tests with 100% accuracy',
    icon: '🧩',
    currentProgress: 1,
    targetProgress: 3,
    isClaimed: false,
    rewardCoins: 200,
    rewardGems: 20,
  },
  {
    id: 'reflex_king',
    title: 'Hypersonic Reflexes',
    description: 'Achieve top score in 3 Reaction Tests',
    icon: '🎯',
    currentProgress: 2,
    targetProgress: 3,
    isClaimed: false,
    rewardCoins: 180,
    rewardGems: 15,
  },
  {
    id: 'ranked_warrior',
    title: 'Ranked Ascendant',
    description: 'Reach 1300+ ELO rating in competitive mode',
    icon: '🏆',
    currentProgress: 1240,
    targetProgress: 1300,
    isClaimed: false,
    rewardCoins: 300,
    rewardGems: 30,
  },
];

export const INITIAL_PROFILE: PlayerProfile = {
  id: 'player_' + Math.random().toString(36).substring(2, 9),
  name: 'MindStorm_BD',
  avatar: 'cyber_ninja',
  country: 'BD', // Bangladesh 🇧🇩
  title: 'Synapse Striker',
  rating: 1240,
  level: 4,
  xp: 380,
  coins: 450,
  gems: 35,
  matchesPlayed: 14,
  wins: 10,
  losses: 4,
  winStreak: 3,
  bestWinStreak: 5,
  isVIP: false,
  selectedTheme: 'navy-electric',
  selectedFrame: 'neon_pulse',
};

export const INITIAL_HISTORY: MatchHistoryItem[] = [
  {
    id: 'hist_1',
    timestamp: Date.now() - 1000 * 60 * 35,
    mode: 'quick',
    category: 'all-round',
    opponentName: 'QuantumRival',
    opponentAvatar: 'neon_cyborg',
    opponentCountry: 'US',
    myScore: 840,
    opponentScore: 690,
    result: 'win',
    ratingDelta: 24,
  },
  {
    id: 'hist_2',
    timestamp: Date.now() - 1000 * 60 * 120,
    mode: 'ranked',
    category: 'math',
    opponentName: 'Aarav_MathX',
    opponentAvatar: 'astro_warrior',
    opponentCountry: 'IN',
    myScore: 720,
    opponentScore: 780,
    result: 'loss',
    ratingDelta: -18,
  },
  {
    id: 'hist_3',
    timestamp: Date.now() - 1000 * 60 * 300,
    mode: 'friends',
    category: 'reaction',
    opponentName: 'Tanvir_Pro',
    opponentAvatar: 'samurai',
    opponentCountry: 'BD',
    myScore: 910,
    opponentScore: 820,
    result: 'win',
    ratingDelta: 22,
  },
];

export class StorageService {
  public static getProfile(): PlayerProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      // fallback
    }
    this.saveProfile(INITIAL_PROFILE);
    return INITIAL_PROFILE;
  }

  public static saveProfile(profile: PlayerProfile) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  }

  public static getHistory(): MatchHistoryItem[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      // fallback
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(INITIAL_HISTORY));
    return INITIAL_HISTORY;
  }

  public static addMatchToHistory(item: MatchHistoryItem) {
    try {
      const list = this.getHistory();
      list.unshift(item);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 30)));
    } catch (e) {
      console.error(e);
    }
  }

  public static getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(ACHIEVEMENTS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      // fallback
    }
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(INITIAL_ACHIEVEMENTS));
    return INITIAL_ACHIEVEMENTS;
  }

  public static saveAchievements(achievements: Achievement[]) {
    try {
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    } catch (e) {
      console.error(e);
    }
  }
}
