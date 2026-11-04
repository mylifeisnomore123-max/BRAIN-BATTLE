import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Type Definitions
export interface PlayerData {
  id: string;
  name: string;
  avatar: string;
  country: string;
  rating: number;
  level: number;
}

export interface MatchQuestion {
  id: string;
  category: 'math' | 'memory' | 'reaction' | 'logic' | 'number';
  title: string;
  prompt: string;
  visualData?: any;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  timeLimitSeconds: number;
}

export interface RoomState {
  code: string;
  mode: 'quick' | 'private' | 'ranked';
  gameCategory: 'math' | 'memory' | 'reaction' | 'logic' | 'number' | 'all-round';
  status: 'waiting' | 'ready' | 'starting' | 'in_progress' | 'finished';
  players: {
    [id: string]: {
      player: PlayerData;
      ws: WebSocket;
      isReady: boolean;
      score: number;
      combo: number;
      answers: { [qIndex: number]: { answer: string; isCorrect: boolean; timeTakenMs: number } };
      rematchRequested?: boolean;
    };
  };
  questions: MatchQuestion[];
  currentQuestionIndex: number;
  roundStartTime: number;
  createdAt: number;
}

// In-Memory Games State
const activeRooms = new Map<string, RoomState>();
const playerToRoom = new Map<string, string>();
const matchmakingQueue: { player: PlayerData; ws: WebSocket; category: string }[] = [];

// Helper question generator for server-authoritative validation
function generateMatchQuestions(category: string, count: number = 5): MatchQuestion[] {
  const questions: MatchQuestion[] = [];
  const categories: Array<'math' | 'memory' | 'reaction' | 'logic' | 'number'> =
    category === 'all-round'
      ? ['math', 'memory', 'reaction', 'logic', 'number']
      : [category as any];

  for (let i = 0; i < count; i++) {
    const cat = categories[i % categories.length];
    questions.push(generateSingleQuestion(cat, i + 1));
  }
  return questions;
}

function generateSingleQuestion(cat: 'math' | 'memory' | 'reaction' | 'logic' | 'number', qNum: number): MatchQuestion {
  const id = `q_${cat}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (cat === 'math') {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = Math.floor(Math.random() * 30) + 10;
    let b = Math.floor(Math.random() * 20) + 5;
    let ans = 0;

    if (op === '+') ans = a + b;
    else if (op === '-') {
      if (a < b) [a, b] = [b, a];
      ans = a - b;
    } else {
      a = Math.floor(Math.random() * 12) + 3;
      b = Math.floor(Math.random() * 12) + 3;
      ans = a * b;
    }

    const wrong1 = ans + (Math.random() > 0.5 ? 2 : -2);
    const wrong2 = ans + (Math.random() > 0.5 ? 10 : -5);
    const wrong3 = Math.max(1, ans + (Math.random() > 0.5 ? 4 : -3));
    const rawOptions = Array.from(new Set([ans.toString(), wrong1.toString(), wrong2.toString(), wrong3.toString()]));
    while (rawOptions.length < 4) {
      rawOptions.push((ans + rawOptions.length * 3).toString());
    }
    const shuffled = rawOptions.sort(() => Math.random() - 0.5);

    return {
      id,
      category: 'math',
      title: `Math Challenge #${qNum}`,
      prompt: `What is the value of: ${a} ${op} ${b} ?`,
      options: shuffled,
      correctAnswer: ans.toString(),
      explanation: `${a} ${op} ${b} = ${ans}`,
      timeLimitSeconds: 10,
    };
  }

  if (cat === 'number') {
    const types = ['arithmetic', 'geometric', 'fibonacci', 'squares'];
    const type = types[Math.floor(Math.random() * types.length)];
    let seq: number[] = [];
    let nextVal = 0;

    if (type === 'arithmetic') {
      const start = Math.floor(Math.random() * 10) + 2;
      const step = Math.floor(Math.random() * 7) + 3;
      seq = [start, start + step, start + step * 2, start + step * 3];
      nextVal = start + step * 4;
    } else if (type === 'geometric') {
      const start = Math.floor(Math.random() * 3) + 2;
      const factor = 2;
      seq = [start, start * factor, start * factor * 2, start * factor * 3];
      nextVal = start * factor * 4;
    } else if (type === 'fibonacci') {
      seq = [2, 3, 5, 8, 13];
      nextVal = 21;
    } else {
      const start = Math.floor(Math.random() * 4) + 1;
      seq = [start * start, (start + 1) * (start + 1), (start + 2) * (start + 2), (start + 3) * (start + 3)];
      nextVal = (start + 4) * (start + 4);
    }

    const opts = [
      nextVal.toString(),
      (nextVal + 2).toString(),
      (nextVal - 3).toString(),
      (nextVal + 5).toString(),
    ].sort(() => Math.random() - 0.5);

    return {
      id,
      category: 'number',
      title: `Number Challenge #${qNum}`,
      prompt: `Identify the missing number in the sequence: ${seq.join(', ')}, [ ? ]`,
      options: opts,
      correctAnswer: nextVal.toString(),
      explanation: `Pattern progresses to ${nextVal}`,
      timeLimitSeconds: 12,
    };
  }

  if (cat === 'memory') {
    const colors = ['BLUE', 'RED', 'GREEN', 'YELLOW', 'PURPLE'];
    const seqLen = Math.min(3 + qNum, 6);
    const chosenColors: string[] = [];
    for (let k = 0; k < seqLen; k++) {
      chosenColors.push(colors[Math.floor(Math.random() * colors.length)]);
    }

    const correctSeq = chosenColors.join(' - ');
    const fake1 = [...chosenColors].reverse().join(' - ');
    const fake2 = chosenColors.map((c, i) => (i === 1 ? colors[(colors.indexOf(c) + 1) % colors.length] : c)).join(' - ');
    const fake3 = chosenColors.map((c, i) => (i === 0 ? colors[(colors.indexOf(c) + 2) % colors.length] : c)).join(' - ');

    const opts = Array.from(new Set([correctSeq, fake1, fake2, fake3]));
    while (opts.length < 4) opts.push(`Pattern ${opts.length}`);

    return {
      id,
      category: 'memory',
      title: `Memory Test #${qNum}`,
      prompt: `Memorize the sequence of glowing signals:`,
      visualData: { sequence: chosenColors, displayDurationMs: 2500 },
      options: opts.sort(() => Math.random() - 0.5),
      correctAnswer: correctSeq,
      explanation: `The exact sequence was: ${correctSeq}`,
      timeLimitSeconds: 15,
    };
  }

  if (cat === 'reaction') {
    const targets = [
      { prompt: 'Tap the ELECTRIC CYAN button as soon as it appears!', correct: 'CYAN', options: ['CYAN', 'ORANGE', 'VIOLET', 'MAGENTA'] },
      { prompt: 'Color Match: Word says "YELLOW", ink is RED. What color is the INK?', correct: 'RED', options: ['YELLOW', 'RED', 'BLUE', 'GREEN'] },
      { prompt: 'Rapid Reflex: Select the FASTEST animal!', correct: 'Cheetah', options: ['Cheetah', 'Falcon', 'Gazelle', 'Lion'] },
      { prompt: 'Signal Check: When light turns GREEN, select GREEN immediately!', correct: 'GREEN', options: ['GREEN', 'RED', 'AMBER', 'BLUE'] },
    ];
    const picked = targets[Math.floor(Math.random() * targets.length)];

    return {
      id,
      category: 'reaction',
      title: `Reaction Test #${qNum}`,
      prompt: picked.prompt,
      options: picked.options.sort(() => Math.random() - 0.5),
      correctAnswer: picked.correct,
      explanation: `Correct trigger was ${picked.correct}`,
      timeLimitSeconds: 8,
    };
  }

  // Logic Puzzle
  const logicPuzzles = [
    {
      q: 'A father is 4 times older than his son. In 20 years, he will be twice as old. How old is the son now?',
      ans: '10',
      opts: ['10', '12', '8', '15'],
      exp: 'Let son = s, father = 4s. In 20 years: 4s + 20 = 2(s + 20) => 2s = 20 => s = 10',
    },
    {
      q: 'If 5 machines take 5 minutes to make 5 widgets, how long do 100 machines take to make 100 widgets?',
      ans: '5 minutes',
      opts: ['5 minutes', '100 minutes', '20 minutes', '1 minute'],
      exp: 'Each machine takes 5 minutes to make 1 widget. So 100 machines make 100 widgets in 5 minutes.',
    },
    {
      q: 'Which word does NOT belong with the others?',
      ans: 'Carrot',
      opts: ['Carrot', 'Apple', 'Banana', 'Mango'],
      exp: 'Carrot is a root vegetable; the others are fruits.',
    },
    {
      q: 'Look at this riddle: Forward I am heavy, but backward I am not. What am I?',
      ans: 'Ton',
      opts: ['Ton', 'Lead', 'Anchor', 'Rock'],
      exp: '"Ton" spelled backward is "Not".',
    },
    {
      q: 'If all Zips are Zaps, and all Zaps are Zops, are all Zips definitely Zops?',
      ans: 'Yes, definitely',
      opts: ['Yes, definitely', 'No, never', 'Only sometimes', 'Cannot be determined'],
      exp: 'Transitive logic: Zips subset of Zaps, Zaps subset of Zops => Zips subset of Zops.',
    },
  ];
  const puzzle = logicPuzzles[(qNum - 1) % logicPuzzles.length];

  return {
    id,
    category: 'logic',
    title: `Logic Puzzle #${qNum}`,
    prompt: puzzle.q,
    options: puzzle.opts.sort(() => Math.random() - 0.5),
    correctAnswer: puzzle.ans,
    explanation: puzzle.exp,
    timeLimitSeconds: 15,
  };
}

// Generate 6-char alphanumeric room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Broadcast helper
function broadcastRoom(room: RoomState, message: any) {
  const payload = JSON.stringify(message);
  Object.values(room.players).forEach(({ ws }) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

// WebSocket Connection Handler
wss.on('connection', (ws: WebSocket) => {
  let currentPlayerId: string | null = null;

  ws.on('message', (rawMessage: string) => {
    try {
      const data = JSON.parse(rawMessage);
      const { type } = data;

      // 1. Player Registers / Identifies
      if (type === 'register_player') {
        currentPlayerId = data.player.id;
        ws.send(JSON.stringify({ type: 'registered', playerId: currentPlayerId }));
        return;
      }

      // 2. Queue for 1v1 Quick Match / Random Opponent
      if (type === 'join_matchmaking') {
        const { player, category } = data;
        currentPlayerId = player.id;

        // Remove from existing queue if already there
        const existingIdx = matchmakingQueue.findIndex((entry) => entry.player.id === player.id);
        if (existingIdx !== -1) matchmakingQueue.splice(existingIdx, 1);

        // Check if there is an opponent waiting
        const opponentIndex = matchmakingQueue.findIndex(
          (entry) => entry.player.id !== player.id && entry.ws.readyState === WebSocket.OPEN
        );

        if (opponentIndex !== -1) {
          const opponentEntry = matchmakingQueue.splice(opponentIndex, 1)[0];
          const roomCode = generateRoomCode();
          const chosenCategory = category || opponentEntry.category || 'all-round';
          const questions = generateMatchQuestions(chosenCategory, 5);

          const newRoom: RoomState = {
            code: roomCode,
            mode: 'quick',
            gameCategory: chosenCategory as any,
            status: 'starting',
            players: {
              [opponentEntry.player.id]: {
                player: opponentEntry.player,
                ws: opponentEntry.ws,
                isReady: true,
                score: 0,
                combo: 0,
                answers: {},
              },
              [player.id]: {
                player,
                ws,
                isReady: true,
                score: 0,
                combo: 0,
                answers: {},
              },
            },
            questions,
            currentQuestionIndex: 0,
            roundStartTime: Date.now() + 4000,
            createdAt: Date.now(),
          };

          activeRooms.set(roomCode, newRoom);
          playerToRoom.set(opponentEntry.player.id, roomCode);
          playerToRoom.set(player.id, roomCode);

          // Broadcast match_found with 3-second countdown
          broadcastRoom(newRoom, {
            type: 'match_found',
            roomCode,
            category: chosenCategory,
            players: [opponentEntry.player, player],
            countdownSeconds: 3,
            firstQuestion: questions[0],
            totalQuestions: questions.length,
          });

          // Schedule first question after countdown
          setTimeout(() => {
            if (activeRooms.has(roomCode)) {
              newRoom.status = 'in_progress';
              newRoom.roundStartTime = Date.now();
              broadcastRoom(newRoom, {
                type: 'round_started',
                questionIndex: 0,
                question: questions[0],
                serverTimestamp: Date.now(),
              });
            }
          }, 3500);
        } else {
          // Add to matchmaking queue
          matchmakingQueue.push({ player, ws, category: category || 'all-round' });
          ws.send(JSON.stringify({ type: 'matchmaking_waiting', queueSize: matchmakingQueue.length }));
        }
        return;
      }

      // Cancel Matchmaking
      if (type === 'cancel_matchmaking') {
        const idx = matchmakingQueue.findIndex((entry) => entry.ws === ws);
        if (idx !== -1) matchmakingQueue.splice(idx, 1);
        ws.send(JSON.stringify({ type: 'matchmaking_cancelled' }));
        return;
      }

      // 3. Create Private Room (Play With Friends)
      if (type === 'create_room') {
        const { player, category } = data;
        currentPlayerId = player.id;
        const roomCode = generateRoomCode();
        const chosenCategory = category || 'all-round';
        const questions = generateMatchQuestions(chosenCategory, 5);

        const newRoom: RoomState = {
          code: roomCode,
          mode: 'private',
          gameCategory: chosenCategory as any,
          status: 'waiting',
          players: {
            [player.id]: {
              player,
              ws,
              isReady: true,
              score: 0,
              combo: 0,
              answers: {},
            },
          },
          questions,
          currentQuestionIndex: 0,
          roundStartTime: 0,
          createdAt: Date.now(),
        };

        activeRooms.set(roomCode, newRoom);
        playerToRoom.set(player.id, roomCode);

        ws.send(
          JSON.stringify({
            type: 'room_created',
            roomCode,
            room: {
              code: roomCode,
              category: chosenCategory,
              players: [player],
              status: 'waiting',
            },
          })
        );
        return;
      }

      // 4. Join Private Room with Code
      if (type === 'join_room') {
        const { player, roomCode } = data;
        currentPlayerId = player.id;
        const cleanCode = (roomCode || '').toUpperCase().trim();
        const room = activeRooms.get(cleanCode);

        if (!room) {
          ws.send(JSON.stringify({ type: 'room_error', message: 'Room not found. Check code.' }));
          return;
        }

        const currentPlayers = Object.keys(room.players);
        if (currentPlayers.length >= 2 && !room.players[player.id]) {
          ws.send(JSON.stringify({ type: 'room_error', message: 'Room is already full.' }));
          return;
        }

        room.players[player.id] = {
          player,
          ws,
          isReady: true,
          score: 0,
          combo: 0,
          answers: {},
        };
        playerToRoom.set(player.id, cleanCode);

        const playerList = Object.values(room.players).map((p) => p.player);
        broadcastRoom(room, {
          type: 'room_updated',
          roomCode: cleanCode,
          players: playerList,
          canStart: playerList.length === 2,
        });

        // If 2 players present, initiate match countdown automatically
        if (playerList.length === 2) {
          room.status = 'starting';
          broadcastRoom(room, {
            type: 'match_found',
            roomCode: cleanCode,
            category: room.gameCategory,
            players: playerList,
            countdownSeconds: 3,
            firstQuestion: room.questions[0],
            totalQuestions: room.questions.length,
          });

          setTimeout(() => {
            if (activeRooms.has(cleanCode)) {
              room.status = 'in_progress';
              room.roundStartTime = Date.now();
              broadcastRoom(room, {
                type: 'round_started',
                questionIndex: 0,
                question: room.questions[0],
                serverTimestamp: Date.now(),
              });
            }
          }, 3500);
        }
        return;
      }

      // 5. Submit Answer (Server Authoritative)
      if (type === 'submit_answer') {
        const { roomCode, playerId, questionIndex, answer, timeTakenMs } = data;
        const room = activeRooms.get(roomCode);
        if (!room || !room.players[playerId]) return;

        const currentQ = room.questions[questionIndex];
        if (!currentQ) return;

        // Anti-cheat validation: Answer time must be realistic (> 100ms)
        const isSuspicious = timeTakenMs < 80;
        const isCorrect = !isSuspicious && answer === currentQ.correctAnswer;

        // Calculate score: Base 100 pts + speed bonus up to 100 pts + combo multiplier
        const playerData = room.players[playerId];
        let roundScore = 0;
        if (isCorrect) {
          playerData.combo += 1;
          const maxTimeMs = currentQ.timeLimitSeconds * 1000;
          const remainingRatio = Math.max(0, (maxTimeMs - timeTakenMs) / maxTimeMs);
          const speedBonus = Math.round(remainingRatio * 100);
          const comboMultiplier = 1 + Math.min(playerData.combo - 1, 5) * 0.2; // up to 2.0x combo
          roundScore = Math.round((100 + speedBonus) * comboMultiplier);
          playerData.score += roundScore;
        } else {
          playerData.combo = 0;
        }

        playerData.answers[questionIndex] = { answer, isCorrect, timeTakenMs };

        // Broadcast score update instantly to both players
        broadcastRoom(room, {
          type: 'score_update',
          playerId,
          questionIndex,
          isCorrect,
          roundScore,
          totalScore: playerData.score,
          combo: playerData.combo,
          correctAnswer: currentQ.correctAnswer,
          explanation: currentQ.explanation,
        });

        // Check if both players answered current question or time expired
        const allAnswered = Object.values(room.players).every((p) => p.answers[questionIndex] !== undefined);

        if (allAnswered) {
          const nextIndex = questionIndex + 1;
          if (nextIndex < room.questions.length) {
            // Next Question
            room.currentQuestionIndex = nextIndex;
            setTimeout(() => {
              if (activeRooms.has(roomCode)) {
                room.roundStartTime = Date.now();
                broadcastRoom(room, {
                  type: 'round_started',
                  questionIndex: nextIndex,
                  question: room.questions[nextIndex],
                  serverTimestamp: Date.now(),
                });
              }
            }, 1800); // 1.8s review pause
          } else {
            // Match Finished!
            room.status = 'finished';
            const playerEntries = Object.values(room.players);
            const p1 = playerEntries[0];
            const p2 = playerEntries[1];

            let winnerId: string | null = null;
            if (p1 && p2) {
              if (p1.score > p2.score) winnerId = p1.player.id;
              else if (p2.score > p1.score) winnerId = p2.player.id;
            } else if (p1) {
              winnerId = p1.player.id;
            }

            // ELO rating calculation
            const p1Rating = p1?.player.rating || 1200;
            const p2Rating = p2?.player.rating || 1200;
            const kFactor = 32;
            const expectedP1 = 1 / (1 + Math.pow(10, (p2Rating - p1Rating) / 400));
            const actualP1 = winnerId === p1?.player.id ? 1 : winnerId === null ? 0.5 : 0;
            const p1RatingDelta = Math.round(kFactor * (actualP1 - expectedP1));
            const p2RatingDelta = -p1RatingDelta;

            broadcastRoom(room, {
              type: 'match_finished',
              roomCode,
              winnerId,
              scores: playerEntries.map((p) => ({
                playerId: p.player.id,
                score: p.score,
                ratingDelta: p.player.id === p1?.player.id ? p1RatingDelta : p2RatingDelta,
                xpGained: winnerId === p.player.id ? 150 : 60,
                coinsGained: winnerId === p.player.id ? 80 : 30,
              })),
            });
          }
        }
        return;
      }

      // 6. Emoji Reaction in Game
      if (type === 'send_emoji') {
        const { roomCode, playerId, emoji } = data;
        const room = activeRooms.get(roomCode);
        if (room) {
          broadcastRoom(room, {
            type: 'emoji_received',
            playerId,
            emoji,
          });
        }
        return;
      }

      // 7. Rematch Request
      if (type === 'request_rematch') {
        const { roomCode, playerId } = data;
        const room = activeRooms.get(roomCode);
        if (!room || !room.players[playerId]) return;

        room.players[playerId].rematchRequested = true;
        const otherPlayer = Object.values(room.players).find((p) => p.player.id !== playerId);

        if (otherPlayer?.rematchRequested) {
          // Both accepted rematch! Restart with new questions
          room.questions = generateMatchQuestions(room.gameCategory, 5);
          room.currentQuestionIndex = 0;
          room.status = 'starting';

          Object.values(room.players).forEach((p) => {
            p.score = 0;
            p.combo = 0;
            p.answers = {};
            p.rematchRequested = false;
          });

          broadcastRoom(room, {
            type: 'rematch_accepted',
            roomCode,
            countdownSeconds: 3,
            firstQuestion: room.questions[0],
            totalQuestions: room.questions.length,
          });

          setTimeout(() => {
            if (activeRooms.has(roomCode)) {
              room.status = 'in_progress';
              room.roundStartTime = Date.now();
              broadcastRoom(room, {
                type: 'round_started',
                questionIndex: 0,
                question: room.questions[0],
                serverTimestamp: Date.now(),
              });
            }
          }, 3500);
        } else {
          broadcastRoom(room, {
            type: 'rematch_requested',
            playerId,
          });
        }
        return;
      }
    } catch (err) {
      console.error('WebSocket message parsing error:', err);
    }
  });

  ws.on('close', () => {
    // Clean up from matchmaking queue
    const queueIdx = matchmakingQueue.findIndex((entry) => entry.ws === ws);
    if (queueIdx !== -1) {
      matchmakingQueue.splice(queueIdx, 1);
    }

    // Clean up room connection
    if (currentPlayerId) {
      const roomCode = playerToRoom.get(currentPlayerId);
      if (roomCode) {
        const room = activeRooms.get(roomCode);
        if (room) {
          broadcastRoom(room, {
            type: 'player_disconnected',
            playerId: currentPlayerId,
            message: 'Opponent disconnected.',
          });
          // After 20 seconds, delete room if abandoned
          setTimeout(() => {
            activeRooms.delete(roomCode);
          }, 20000);
        }
        playerToRoom.delete(currentPlayerId);
      }
    }
  });
});

// REST API Endpoints for Profiles, Daily Challenges, Tournaments & Leaderboards
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', onlinePlayers: wss.clients.size, activeRooms: activeRooms.size });
});

app.get('/api/leaderboard', (req, res) => {
  const { region, filter } = req.query;
  const mockLeaderboards = [
    { rank: 1, id: 'bd_1', name: 'Tanvir_BD', country: 'BD', rating: 2480, wins: 342, losses: 48, title: 'Grandmaster Mind', avatar: 'cyber_ninja' },
    { rank: 2, id: 'us_1', name: 'QuantumBrain', country: 'US', rating: 2415, wins: 298, losses: 54, title: 'Calculus Demon', avatar: 'neon_cyborg' },
    { rank: 3, id: 'in_1', name: 'Aarav_MathX', country: 'IN', rating: 2390, wins: 280, losses: 61, title: 'Reflex God', avatar: 'astro_warrior' },
    { rank: 4, id: 'bd_2', name: 'Nafisa_Logic', country: 'BD', rating: 2355, wins: 265, losses: 42, title: 'Puzzle Sorcerer', avatar: 'valkyrie' },
    { rank: 5, id: 'uk_1', name: 'Arthur_Mind', country: 'GB', rating: 2310, wins: 245, losses: 70, title: 'Speed Demon', avatar: 'samurai' },
    { rank: 6, id: 'bd_3', name: 'Shakib_Ace', country: 'BD', rating: 2280, wins: 230, losses: 55, title: 'Memory Maestro', avatar: 'hacker_fox' },
    { rank: 7, id: 'ca_1', name: 'Nova_Synapse', country: 'CA', rating: 2240, wins: 215, losses: 68, title: 'Neural King', avatar: 'cyber_ninja' },
    { rank: 8, id: 'jp_1', name: 'Kenji_Zero', country: 'JP', rating: 2210, wins: 198, losses: 45, title: 'Flash Synapse', avatar: 'neon_cyborg' },
    { rank: 9, id: 'bd_4', name: 'Rahim_Speed', country: 'BD', rating: 2195, wins: 190, losses: 52, title: 'Quick Thinker', avatar: 'astro_warrior' },
    { rank: 10, id: 'de_1', name: 'Lukas_Logic', country: 'DE', rating: 2160, wins: 185, losses: 60, title: 'Iron Strategist', avatar: 'samurai' },
  ];

  let filtered = mockLeaderboards;
  if (region && region === 'BD') {
    filtered = mockLeaderboards.filter((p) => p.country === 'BD');
  }

  res.json({
    leaderboard: filtered,
    totalCompetitors: 14820,
    season: 'Season 4: Cognitive Overdrive',
    endsInDays: 9,
  });
});

app.get('/api/daily-challenge', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  res.json({
    date: today,
    dayNumber: 312,
    theme: 'Speed & Logic Fusion',
    totalRewardCoins: 250,
    totalRewardGems: 15,
    streakBonus: 1.5,
    stages: [
      { id: 'stage_1', category: 'math', title: 'Calculus Sprint', targetScore: 350, completed: false },
      { id: 'stage_2', category: 'reaction', title: 'Sub-300ms Reflexes', targetScore: 400, completed: false },
      { id: 'stage_3', category: 'logic', title: 'Grandmaster Deduction', targetScore: 450, completed: false },
    ],
  });
});

app.get('/api/tournaments', (req, res) => {
  res.json({
    activeTournament: {
      id: 'tourney_mega_1',
      title: 'Global Brain Crown — Cup #42',
      prizePool: '10,000 Coins + 250 Gems + Grandmaster Badge',
      entryFee: 100,
      status: 'registering',
      registeredPlayers: 54,
      maxPlayers: 64,
      startsInMinutes: 24,
      rounds: ['Quarter-Finals', 'Semi-Finals', 'Championship Final'],
    },
  });
});

// Vite Middleware integration in Development / Static Serving in Production
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🧠 Brain Battle Server listening on port ${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start Brain Battle server:', err);
});
