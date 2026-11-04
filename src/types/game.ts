// Game Types and Interfaces for Brain Battle

export type GameCategory = 'math' | 'memory' | 'reaction' | 'logic' | 'number' | 'all-round';

export type GameMode = 'quick' | 'friends' | 'ranked' | 'daily' | 'tournament' | 'practice';

export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  country: string; // 'BD' | 'US' | 'GB' | 'IN' | 'GLOBAL' etc.
  title: string;
  rating: number; // ELO (e.g. 1200)
  level: number;
  xp: number;
  coins: number;
  gems: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winStreak: number;
  bestWinStreak: number;
  isVIP: boolean;
  selectedTheme: string;
  selectedFrame: string;
}

export interface MatchHistoryItem {
  id: string;
  timestamp: number;
  mode: GameMode;
  category: GameCategory;
  opponentName: string;
  opponentAvatar: string;
  opponentCountry: string;
  myScore: number;
  opponentScore: number;
  result: 'win' | 'loss' | 'draw';
  ratingDelta: number;
}

export interface QuestionData {
  id: string;
  category: GameCategory;
  title: string;
  prompt: string;
  visualData?: any;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  timeLimitSeconds: number;
}

export interface ActiveMatchPlayer {
  id: string;
  name: string;
  avatar: string;
  country: string;
  rating: number;
  score: number;
  combo: number;
  isReady?: boolean;
}

export interface MatchState {
  roomCode: string;
  mode: GameMode;
  category: GameCategory;
  phase: 'idle' | 'searching' | 'lobby' | 'versus' | 'playing' | 'round_review' | 'finished';
  players: ActiveMatchPlayer[];
  currentQuestion: QuestionData | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  roundEndTime: number;
  lastRoundAnswer?: {
    isCorrect: boolean;
    correctAnswer: string;
    explanation?: string;
    roundScore: number;
  };
  winnerId: string | null;
  endGameStats?: {
    myScore: number;
    oppScore: number;
    ratingDelta: number;
    xpGained: number;
    coinsGained: number;
  };
  rematchRequestedByOpponent?: boolean;
  rematchRequestedByMe?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  currentProgress: number;
  targetProgress: number;
  isClaimed: boolean;
  rewardCoins: number;
  rewardGems: number;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  country: string;
  rating: number;
  wins: number;
  losses: number;
  title: string;
  avatar: string;
}
