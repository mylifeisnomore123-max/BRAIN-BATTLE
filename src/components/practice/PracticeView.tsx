import React, { useState } from 'react';
import { GameCategory, QuestionData } from '../../types/game';
import {
  generateMathQuestion,
  generateNumberQuestion,
  generateLogicQuestion,
  generateReactionQuestion,
  DifficultyLevel,
} from '../../data/challenges';
import { MathChallenge } from '../game/MathChallenge';
import { MemoryTest } from '../game/MemoryTest';
import { ReactionTest } from '../game/ReactionTest';
import { LogicPuzzle } from '../game/LogicPuzzle';
import { NumberChallenge } from '../game/NumberChallenge';
import { soundFx } from '../../services/sound';
import { haptic } from '../../services/haptics';
import { Dumbbell, ArrowLeft, RotateCcw, Zap, Flame, Award } from 'lucide-react';

export const PracticeView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [drillScore, setDrillScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [currentQ, setCurrentQ] = useState<QuestionData | null>(null);
  const [selectedAns, setSelectedAns] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  const spawnQuestion = (cat: GameCategory, diff: DifficultyLevel, qNum: number) => {
    setSelectedAns(null);
    setIsAnswered(false);
    if (cat === 'math') {
      setCurrentQ(generateMathQuestion(diff, qNum));
    } else if (cat === 'number') {
      setCurrentQ(generateNumberQuestion(diff, qNum));
    } else if (cat === 'logic') {
      setCurrentQ(generateLogicQuestion(qNum));
    } else if (cat === 'reaction') {
      setCurrentQ(generateReactionQuestion(qNum));
    } else {
      // Memory
      const colors = ['BLUE', 'RED', 'GREEN', 'YELLOW', 'PURPLE'];
      const len = diff === 'easy' ? 3 : diff === 'medium' ? 4 : diff === 'hard' ? 5 : 6;
      const seq: string[] = [];
      for (let k = 0; k < len; k++) seq.push(colors[Math.floor(Math.random() * colors.length)]);
      const correct = seq.join(' - ');
      const fake = [...seq].reverse().join(' - ');
      const fake2 = seq.map((c, i) => (i === 1 ? 'RED' : c)).join(' - ');
      setCurrentQ({
        id: `mem_p_${Date.now()}`,
        category: 'memory',
        title: `Memory Practice #${qNum}`,
        prompt: `Reproduce the sequence of colors:`,
        visualData: { sequence: seq },
        options: [correct, fake, fake2, 'RED - BLUE - GREEN'].sort(() => Math.random() - 0.5),
        correctAnswer: correct,
        timeLimitSeconds: 15,
      });
    }
  };

  const handleStartDrill = (cat: GameCategory) => {
    haptic.medium();
    soundFx.playClick();
    setSelectedCategory(cat);
    setDrillScore(0);
    setStreak(0);
    setQuestionCount(1);
    spawnQuestion(cat, difficulty, 1);
  };

  const handlePracticeAnswer = (ans: string) => {
    if (!currentQ || isAnswered) return;
    setIsAnswered(true);
    setSelectedAns(ans);

    const isCorrect = ans === currentQ.correctAnswer;
    if (isCorrect) {
      soundFx.playCorrect(streak + 1);
      haptic.success();
      setStreak((prev) => prev + 1);
      setDrillScore((prev) => prev + 100 + (streak + 1) * 20);
    } else {
      soundFx.playWrong();
      haptic.error();
      setStreak(0);
    }

    setTimeout(() => {
      const nextQ = questionCount + 1;
      setQuestionCount(nextQ);
      if (selectedCategory) {
        spawnQuestion(selectedCategory, difficulty, nextQ);
      }
    }, 1800);
  };

  const disciplines = [
    { id: 'math', title: 'Math Challenge', icon: '📐', desc: 'Arithmetic, multiplication, quick equations' },
    { id: 'memory', title: 'Memory Test', icon: '🧩', desc: 'Multi-step cyber sequence and color recall' },
    { id: 'reaction', title: 'Reaction Test', icon: '⚡', desc: 'Millisecond color shift & Stroop test' },
    { id: 'logic', title: 'Logic Puzzle', icon: '💡', desc: 'Deduction, syllogisms, and brain teasers' },
    { id: 'number', title: 'Number Challenge', icon: '🔢', desc: 'Arithmetic & Fibonacci pattern discovery' },
  ];

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 space-y-5">
      {/* If currently in drill session */}
      {selectedCategory && currentQ ? (
        <div className="space-y-4">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Leave Drill</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="text-amber-400 font-bold text-xs flex items-center gap-1 font-mono">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>Streak: {streak}</span>
              </div>
              <div className="px-2.5 py-1 bg-cyan-950/80 border border-cyan-400 rounded-lg text-cyan-300 text-xs font-bold font-mono">
                Score: {drillScore}
              </div>
            </div>
          </div>

          {/* Drill Question Mount */}
          <div className="py-2">
            {selectedCategory === 'math' && (
              <MathChallenge
                question={currentQ}
                onAnswer={handlePracticeAnswer}
                disabled={isAnswered}
                selectedAnswer={selectedAns}
              />
            )}
            {selectedCategory === 'memory' && (
              <MemoryTest
                question={currentQ}
                onAnswer={handlePracticeAnswer}
                disabled={isAnswered}
                selectedAnswer={selectedAns}
              />
            )}
            {selectedCategory === 'reaction' && (
              <ReactionTest
                question={currentQ}
                onAnswer={handlePracticeAnswer}
                disabled={isAnswered}
                selectedAnswer={selectedAns}
              />
            )}
            {selectedCategory === 'logic' && (
              <LogicPuzzle
                question={currentQ}
                onAnswer={handlePracticeAnswer}
                disabled={isAnswered}
                selectedAnswer={selectedAns}
              />
            )}
            {selectedCategory === 'number' && (
              <NumberChallenge
                question={currentQ}
                onAnswer={handlePracticeAnswer}
                disabled={isAnswered}
                selectedAnswer={selectedAns}
              />
            )}
          </div>
        </div>
      ) : (
        /* Discipline Selection Screen */
        <div className="space-y-5">
          <div className="rounded-3xl bg-gradient-to-br from-[#0e1633] via-[#090e24] to-[#060814] border border-blue-500/30 p-5 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-black tracking-widest text-blue-400 uppercase">
                COGNITIVE GYMNASIUM
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">
              Solo Training & Practice
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-sm">
              Practice any of the 5 competitive disciplines in an unranked environment to build muscle memory and speed.
            </p>

            {/* Difficulty Selector */}
            <div className="mt-4 pt-3 border-t border-blue-500/20">
              <div className="text-xs font-bold text-slate-300 mb-2">Select Difficulty:</div>
              <div className="grid grid-cols-4 gap-1.5">
                {(['easy', 'medium', 'hard', 'master'] as DifficultyLevel[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      haptic.light();
                      setDifficulty(d);
                    }}
                    className={`py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                      difficulty === d
                        ? 'bg-blue-500 text-black shadow-[0_0_15px_#3b82f6]'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5 Disciplines Cards */}
          <div className="space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-300 px-1">
              Select Mini-Game to Drill
            </div>

            {disciplines.map((d) => (
              <div
                key={d.id}
                onClick={() => handleStartDrill(d.id as GameCategory)}
                className="p-4 rounded-2xl bg-[#0d132a] border border-cyan-500/20 hover:border-cyan-400 hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">{d.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{d.title}</h3>
                    <p className="text-xs text-slate-400">{d.desc}</p>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold">
                  Train →
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
