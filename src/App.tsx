import React, { useState, useEffect } from 'react';
import { PlayerProfile, GameCategory, GameMode, MatchState, QuestionData } from './types/game';
import { StorageService } from './services/storage';
import { multiplayer } from './services/multiplayer';
import { soundFx } from './services/sound';
import { haptic } from './services/haptics';
import { Navbar } from './components/layout/Navbar';
import { BottomNav, NavTab } from './components/layout/BottomNav';
import { HomeView } from './components/home/HomeView';
import { PracticeView } from './components/practice/PracticeView';
import { DailyChallengeView } from './components/daily/DailyChallengeView';
import { TournamentView } from './components/tournaments/TournamentView';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { ProfileView } from './components/profile/ProfileView';
import { ShopView } from './components/shop/ShopView';
import { MatchmakingModal } from './components/matchmaking/MatchmakingModal';
import { VersusScreen } from './components/matchmaking/VersusScreen';
import { MatchPlayScreen } from './components/matchmaking/MatchPlayScreen';
import { VictoryScreen } from './components/matchmaking/VictoryScreen';
import { Wifi, Battery, Signal } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile>(() => StorageService.getProfile());
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);

  // Matchmaking & Game Flow State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'searching' | 'create_room' | 'join_room';
    category: GameCategory;
    roomCode?: string;
  }>({
    isOpen: false,
    type: 'searching',
    category: 'all-round',
  });

  const [matchState, setMatchState] = useState<MatchState>({
    roomCode: '',
    mode: 'quick',
    category: 'all-round',
    phase: 'idle',
    players: [],
    currentQuestion: null,
    currentQuestionIndex: 0,
    totalQuestions: 5,
    roundEndTime: 0,
    winnerId: null,
  });

  // Connect & register on startup
  useEffect(() => {
    multiplayer.registerPlayer(profile);

    // 1. Match Found
    const unsubMatchFound = multiplayer.on('match_found', (data) => {
      setModalState((prev) => ({ ...prev, isOpen: false }));
      setMatchState({
        roomCode: data.roomCode,
        mode: 'quick',
        category: data.category,
        phase: 'versus',
        players: data.players.map((p: any) => ({
          ...p,
          score: 0,
          combo: 0,
        })),
        currentQuestion: data.firstQuestion,
        currentQuestionIndex: 0,
        totalQuestions: data.totalQuestions || 5,
        roundEndTime: 0,
        winnerId: null,
      });
    });

    // 2. Round Started
    const unsubRoundStarted = multiplayer.on('round_started', (data) => {
      setMatchState((prev) => ({
        ...prev,
        phase: 'playing',
        currentQuestionIndex: data.questionIndex,
        currentQuestion: data.question,
      }));
    });

    // 3. Score Update
    const unsubScoreUpdate = multiplayer.on('score_update', (data) => {
      setMatchState((prev) => {
        const nextPlayers = prev.players.map((p) => {
          if (p.id === data.playerId) {
            return {
              ...p,
              score: data.totalScore,
              combo: data.combo,
            };
          }
          return p;
        });

        const isMe = data.playerId === profile.id;
        if (isMe) {
          if (data.isCorrect) {
            soundFx.playCorrect(data.combo);
            haptic.success();
          } else {
            soundFx.playWrong();
            haptic.error();
          }
        }

        return {
          ...prev,
          players: nextPlayers,
          lastRoundAnswer: isMe
            ? {
                isCorrect: data.isCorrect,
                correctAnswer: data.correctAnswer,
                explanation: data.explanation,
                roundScore: data.roundScore,
              }
            : prev.lastRoundAnswer,
        };
      });
    });

    // 4. Match Finished
    const unsubFinished = multiplayer.on('match_finished', (data) => {
      const myStats = data.scores.find((s: any) => s.playerId === profile.id) || {
        score: 0,
        ratingDelta: 0,
        xpGained: 60,
        coinsGained: 30,
      };
      const oppStats = data.scores.find((s: any) => s.playerId !== profile.id) || {
        score: 0,
      };

      const isWin = data.winnerId === profile.id;
      const isDraw = data.winnerId === null;

      // Update Profile Stats
      setProfile((prev) => {
        const nextProfile = {
          ...prev,
          rating: Math.max(800, prev.rating + myStats.ratingDelta),
          matchesPlayed: prev.matchesPlayed + 1,
          wins: isWin ? prev.wins + 1 : prev.wins,
          losses: !isWin && !isDraw ? prev.losses + 1 : prev.losses,
          winStreak: isWin ? prev.winStreak + 1 : 0,
          bestWinStreak: isWin ? Math.max(prev.bestWinStreak, prev.winStreak + 1) : prev.bestWinStreak,
          xp: prev.xp + myStats.xpGained,
          coins: prev.coins + myStats.coinsGained,
        };
        // Check level up
        if (nextProfile.xp >= nextProfile.level * 150) {
          nextProfile.xp -= nextProfile.level * 150;
          nextProfile.level += 1;
        }
        StorageService.saveProfile(nextProfile);
        return nextProfile;
      });

      // Save to Match History
      StorageService.addMatchToHistory({
        id: `m_${Date.now()}`,
        timestamp: Date.now(),
        mode: matchState.mode,
        category: matchState.category,
        opponentName: matchState.players.find((p) => p.id !== profile.id)?.name || 'Online Rival',
        opponentAvatar: matchState.players.find((p) => p.id !== profile.id)?.avatar || 'neon_cyborg',
        opponentCountry: matchState.players.find((p) => p.id !== profile.id)?.country || 'US',
        myScore: myStats.score,
        opponentScore: oppStats.score,
        result: isWin ? 'win' : isDraw ? 'draw' : 'loss',
        ratingDelta: myStats.ratingDelta,
      });

      setMatchState((prev) => ({
        ...prev,
        phase: 'finished',
        winnerId: data.winnerId,
        endGameStats: {
          myScore: myStats.score,
          oppScore: oppStats.score,
          ratingDelta: myStats.ratingDelta,
          xpGained: myStats.xpGained,
          coinsGained: myStats.coinsGained,
        },
      }));
    });

    // 5. Room Created
    const unsubRoomCreated = multiplayer.on('room_created', (data) => {
      setModalState((prev) => ({
        ...prev,
        roomCode: data.roomCode,
      }));
    });

    // 6. Rematch events
    const unsubRematchReq = multiplayer.on('rematch_requested', (data) => {
      if (data.playerId !== profile.id) {
        setMatchState((prev) => ({ ...prev, rematchRequestedByOpponent: true }));
      }
    });

    const unsubRematchAccepted = multiplayer.on('rematch_accepted', (data) => {
      setMatchState((prev) => ({
        ...prev,
        phase: 'versus',
        winnerId: null,
        rematchRequestedByMe: false,
        rematchRequestedByOpponent: false,
        players: prev.players.map((p) => ({ ...p, score: 0, combo: 0 })),
        currentQuestion: data.firstQuestion,
        currentQuestionIndex: 0,
        totalQuestions: data.totalQuestions || 5,
      }));
    });

    return () => {
      unsubMatchFound();
      unsubRoundStarted();
      unsubScoreUpdate();
      unsubFinished();
      unsubRoomCreated();
      unsubRematchReq();
      unsubRematchAccepted();
    };
  }, [profile.id]);

  // Start matchmaking handler
  const handleStartMatchmaking = (mode: GameMode, category: GameCategory = 'all-round') => {
    setModalState({
      isOpen: true,
      type: 'searching',
      category,
    });
    multiplayer.joinMatchmaking(profile, category);

    // Automated Sparring fallback if matchmaking queue has no other human after 3.5s
    const botTimer = setTimeout(() => {
      // If still searching, trigger an authentic server/bot clash match
      if (modalState.isOpen || true) {
        const bots = [
          { id: 'bot_1', name: 'Tanvir_Ace', avatar: 'samurai', country: 'BD', rating: profile.rating + 15 },
          { id: 'bot_2', name: 'Nova_Synapse', avatar: 'neon_cyborg', country: 'US', rating: profile.rating - 20 },
          { id: 'bot_3', name: 'Aarav_Reflex', avatar: 'astro_warrior', country: 'IN', rating: profile.rating + 10 },
        ];
        const chosenBot = bots[Math.floor(Math.random() * bots.length)];

        // Only start if still in searching modal
        setModalState((cur) => {
          if (cur.isOpen && cur.type === 'searching') {
            multiplayer.cancelMatchmaking();
            const roomCode = 'BTL' + Math.floor(Math.random() * 899 + 100);

            // Construct 5 questions locally or trigger
            const cat = cur.category || 'all-round';
            setTimeout(() => {
              setMatchState({
                roomCode,
                mode: 'quick',
                category: cat,
                phase: 'versus',
                players: [
                  { ...profile, score: 0, combo: 0 },
                  { ...chosenBot, score: 0, combo: 0 },
                ],
                currentQuestion: null,
                currentQuestionIndex: 0,
                totalQuestions: 5,
                roundEndTime: 0,
                winnerId: null,
              });
            }, 300);

            return { ...cur, isOpen: false };
          }
          return cur;
        });
      }
    }, 3800);

    return () => clearTimeout(botTimer);
  };

  // Bot Round Controller for practice/offline bot matches
  useEffect(() => {
    if (matchState.phase === 'versus' && matchState.players.some((p) => p.id.startsWith('bot_'))) {
      const timer = setTimeout(() => {
        // Generate first question
        const cat = matchState.category === 'all-round' ? 'math' : matchState.category;
        import('./data/challenges').then(({ generateMathQuestion, generateNumberQuestion, generateLogicQuestion, generateReactionQuestion }) => {
          let q: QuestionData;
          if (cat === 'math') q = generateMathQuestion('medium', 1);
          else if (cat === 'number') q = generateNumberQuestion('medium', 1);
          else if (cat === 'logic') q = generateLogicQuestion(1);
          else q = generateReactionQuestion(1);

          setMatchState((prev) => ({
            ...prev,
            phase: 'playing',
            currentQuestion: q,
            currentQuestionIndex: 0,
          }));
        });
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [matchState.phase]);

  // Bot Answer simulation in offline bot match
  useEffect(() => {
    if (matchState.phase === 'playing' && matchState.players.some((p) => p.id.startsWith('bot_'))) {
      const bot = matchState.players.find((p) => p.id.startsWith('bot_'));
      if (bot) {
        const botDelay = 2200 + Math.random() * 2500;
        const botTimer = setTimeout(() => {
          const isCorrect = Math.random() > 0.3; // 70% accuracy
          const pts = isCorrect ? Math.floor(120 + Math.random() * 60) : 0;
          setMatchState((prev) => ({
            ...prev,
            players: prev.players.map((p) => (p.id === bot.id ? { ...p, score: p.score + pts, combo: isCorrect ? p.combo + 1 : 0 } : p)),
          }));
        }, botDelay);

        return () => clearTimeout(botTimer);
      }
    }
  }, [matchState.currentQuestionIndex, matchState.phase]);

  const handleForfeit = () => {
    haptic.medium();
    soundFx.playWrong();
    setMatchState((prev) => ({
      ...prev,
      phase: 'finished',
      winnerId: prev.players.find((p) => p.id !== profile.id)?.id || null,
      endGameStats: {
        myScore: prev.players.find((p) => p.id === profile.id)?.score || 0,
        oppScore: prev.players.find((p) => p.id !== profile.id)?.score || 500,
        ratingDelta: -20,
        xpGained: 30,
        coinsGained: 10,
      },
    }));
  };

  const handleReturnHome = () => {
    haptic.light();
    soundFx.playClick();
    setMatchState((prev) => ({ ...prev, phase: 'idle' }));
    setActiveTab('home');
  };

  // Main UI Shell
  const appContent = (
    <div className="min-h-screen flex flex-col justify-between bg-[#070914] text-slate-100 font-sans">
      {/* Active Match Views */}
      {matchState.phase === 'versus' && (
        <VersusScreen
          players={matchState.players}
          category={matchState.category}
          onCountdownComplete={() => {
            // Handled via WebSocket round_started or bot timer
          }}
        />
      )}

      {matchState.phase === 'playing' && matchState.currentQuestion && (
        <MatchPlayScreen
          roomCode={matchState.roomCode}
          myProfile={profile}
          players={matchState.players}
          question={matchState.currentQuestion}
          questionIndex={matchState.currentQuestionIndex}
          totalQuestions={matchState.totalQuestions}
          lastRoundAnswer={matchState.lastRoundAnswer}
          onForfeit={handleForfeit}
        />
      )}

      {matchState.phase === 'finished' && (
        <VictoryScreen
          roomCode={matchState.roomCode}
          myProfile={profile}
          winnerId={matchState.winnerId}
          stats={matchState.endGameStats}
          rematchRequestedByOpponent={matchState.rematchRequestedByOpponent}
          rematchRequestedByMe={matchState.rematchRequestedByMe}
          onReturnHome={handleReturnHome}
        />
      )}

      {/* Standard Tab Navigation Views */}
      {matchState.phase === 'idle' && (
        <>
          <Navbar
            profile={profile}
            isMobileFrame={isMobileFrame}
            onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
            onOpenProfile={() => setActiveTab('profile')}
            onOpenShop={() => setIsShopOpen(true)}
          />

          <main className="flex-1 pb-20 overflow-y-auto">
            {activeTab === 'home' && (
              <HomeView
                profile={profile}
                onStartMatchmaking={handleStartMatchmaking}
                onOpenCreateRoom={() =>
                  setModalState({ isOpen: true, type: 'create_room', category: 'all-round' })
                }
                onOpenJoinRoom={() =>
                  setModalState({ isOpen: true, type: 'join_room', category: 'all-round' })
                }
                onSelectTab={(tab) => setActiveTab(tab)}
                onOpenShop={() => setIsShopOpen(true)}
              />
            )}

            {activeTab === 'battle' && (
              <HomeView
                profile={profile}
                onStartMatchmaking={handleStartMatchmaking}
                onOpenCreateRoom={() =>
                  setModalState({ isOpen: true, type: 'create_room', category: 'all-round' })
                }
                onOpenJoinRoom={() =>
                  setModalState({ isOpen: true, type: 'join_room', category: 'all-round' })
                }
                onSelectTab={(tab) => setActiveTab(tab)}
                onOpenShop={() => setIsShopOpen(true)}
              />
            )}

            {activeTab === 'practice' && <PracticeView />}

            {activeTab === 'daily' && (
              <DailyChallengeView
                profile={profile}
                onPlayStage={(cat) => handleStartMatchmaking('daily', cat)}
              />
            )}

            {activeTab === 'tournaments' && (
              <TournamentView
                profile={profile}
                onEnterMatch={() => handleStartMatchmaking('tournament', 'all-round')}
              />
            )}

            {activeTab === 'leaderboard' && <LeaderboardView profile={profile} />}

            {activeTab === 'profile' && (
              <ProfileView
                profile={profile}
                onUpdateProfile={(updated) => setProfile(updated)}
              />
            )}
          </main>

          <BottomNav currentTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />
        </>
      )}

      {/* Matchmaking / Room Modal */}
      <MatchmakingModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        category={modalState.category}
        roomCode={modalState.roomCode}
        profile={profile}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onStartMatch={(cat) => handleStartMatchmaking('quick', cat)}
      />

      {/* Cosmetic Shop Modal */}
      <ShopView
        isOpen={isShopOpen}
        profile={profile}
        onClose={() => setIsShopOpen(false)}
        onUpdateProfile={(updated) => setProfile(updated)}
      />
    </div>
  );

  // If Android Mobile Device Simulation Frame is enabled
  if (isMobileFrame) {
    return (
      <div className="min-h-screen bg-[#03050a] flex items-center justify-center p-2 sm:p-6 select-none">
        {/* Android Phone Shell Frame */}
        <div className="w-full max-w-[420px] h-[92vh] max-h-[880px] bg-black rounded-[44px] p-2.5 shadow-[0_0_60px_rgba(6,182,212,0.25)] border-[5px] border-[#1f293d] flex flex-col relative overflow-hidden">
          {/* Android Status Bar */}
          <div className="h-6 w-full bg-[#080c1d] flex items-center justify-between px-6 text-[11px] font-bold text-slate-300 z-50 shrink-0">
            <span>21:40</span>
            {/* Punch-hole camera notch */}
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800" />
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Signal className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] text-cyan-400 font-bold">5G</span>
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          {/* Android Content Viewport */}
          <div className="flex-1 overflow-y-auto rounded-b-[36px] relative flex flex-col">
            {appContent}
          </div>

          {/* Android Navigation Gesture Pill */}
          <div className="w-full bg-[#080c1d] py-1.5 flex justify-center shrink-0">
            <div className="w-32 h-1 bg-slate-600 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Fullscreen / Native View
  return appContent;
}
