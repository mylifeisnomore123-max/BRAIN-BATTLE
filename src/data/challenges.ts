import { QuestionData, GameCategory } from '../types/game';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'master';

// Generator for Math Challenge
export function generateMathQuestion(difficulty: DifficultyLevel = 'medium', index: number = 1): QuestionData {
  const id = `math_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  let prompt = '';
  let ans = 0;
  let explanation = '';

  if (difficulty === 'easy') {
    const a = Math.floor(Math.random() * 20) + 5;
    const b = Math.floor(Math.random() * 20) + 3;
    const op = Math.random() > 0.5 ? '+' : '-';
    if (op === '+') {
      ans = a + b;
      prompt = `${a} + ${b} = ?`;
    } else {
      const high = Math.max(a, b);
      const low = Math.min(a, b);
      ans = high - low;
      prompt = `${high} - ${low} = ?`;
    }
    explanation = `${prompt.replace(' = ?', '')} = ${ans}`;
  } else if (difficulty === 'medium') {
    const type = Math.floor(Math.random() * 3);
    if (type === 0) {
      const a = Math.floor(Math.random() * 12) + 4;
      const b = Math.floor(Math.random() * 12) + 3;
      ans = a * b;
      prompt = `${a} × ${b} = ?`;
      explanation = `${a} × ${b} = ${ans}`;
    } else if (type === 1) {
      const a = Math.floor(Math.random() * 30) + 10;
      const b = Math.floor(Math.random() * 25) + 5;
      const c = Math.floor(Math.random() * 15) + 2;
      ans = a + b - c;
      prompt = `${a} + ${b} - ${c} = ?`;
      explanation = `${a} + ${b} = ${a + b}, then - ${c} = ${ans}`;
    } else {
      const b = Math.floor(Math.random() * 9) + 2;
      ans = Math.floor(Math.random() * 12) + 2;
      const a = ans * b;
      prompt = `${a} ÷ ${b} = ?`;
      explanation = `${a} ÷ ${b} = ${ans}`;
    }
  } else if (difficulty === 'hard') {
    // Quick algebra
    const x = Math.floor(Math.random() * 9) + 2;
    const coef = Math.floor(Math.random() * 5) + 2;
    const add = Math.floor(Math.random() * 15) + 5;
    const total = coef * x + add;
    ans = x;
    prompt = `Solve for x: ${coef}x + ${add} = ${total}`;
    explanation = `${coef}x = ${total - add} ➔ x = ${ans}`;
  } else {
    // Master mental math
    const a = Math.floor(Math.random() * 15) + 8;
    const b = Math.floor(Math.random() * 8) + 4;
    const c = Math.floor(Math.random() * 30) + 20;
    ans = a * b - c;
    prompt = `(${a} × ${b}) - ${c} = ?`;
    explanation = `${a * b} - ${c} = ${ans}`;
  }

  const rawOptions = [
    ans.toString(),
    (ans + (Math.random() > 0.5 ? 2 : -2)).toString(),
    (ans + (Math.random() > 0.5 ? 10 : -5)).toString(),
    Math.max(1, ans + (Math.random() > 0.5 ? 4 : -3)).toString(),
  ];
  const uniqueOpts = Array.from(new Set(rawOptions));
  while (uniqueOpts.length < 4) {
    uniqueOpts.push((ans + uniqueOpts.length * 3).toString());
  }

  return {
    id,
    category: 'math',
    title: `Math Challenge #${index}`,
    prompt,
    options: uniqueOpts.sort(() => Math.random() - 0.5),
    correctAnswer: ans.toString(),
    explanation,
    timeLimitSeconds: difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12,
  };
}

// Generator for Number Challenge
export function generateNumberQuestion(difficulty: DifficultyLevel = 'medium', index: number = 1): QuestionData {
  const id = `num_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  let seq: number[] = [];
  let nextVal = 0;
  let explanation = '';

  if (difficulty === 'easy') {
    const step = Math.floor(Math.random() * 5) + 2;
    const start = Math.floor(Math.random() * 10) + 1;
    seq = [start, start + step, start + step * 2, start + step * 3];
    nextVal = start + step * 4;
    explanation = `Arithmetic step of +${step}`;
  } else if (difficulty === 'medium') {
    const variant = Math.floor(Math.random() * 3);
    if (variant === 0) {
      // Doubling
      const start = Math.floor(Math.random() * 4) + 2;
      seq = [start, start * 2, start * 4, start * 8];
      nextVal = start * 16;
      explanation = `Multiply each term by 2`;
    } else if (variant === 1) {
      // Squares
      const start = Math.floor(Math.random() * 4) + 1;
      seq = [start * start, (start + 1) * (start + 1), (start + 2) * (start + 2), (start + 3) * (start + 3)];
      nextVal = (start + 4) * (start + 4);
      explanation = `Consecutive squares: ${(start + 4)}² = ${nextVal}`;
    } else {
      // Alternating steps (+3, -1)
      const start = 4;
      seq = [4, 7, 6, 9, 8, 11];
      nextVal = 10;
      explanation = `Alternating pattern: +3 then -1`;
    }
  } else if (difficulty === 'hard') {
    // Triangular or Fibonacci
    seq = [1, 1, 2, 3, 5, 8, 13];
    nextVal = 21;
    explanation = `Fibonacci sequence: 8 + 13 = 21`;
  } else {
    // Master: Differences increase by powers of 2
    seq = [2, 3, 5, 9, 17];
    nextVal = 33;
    explanation = `Difference doubles each step (+1, +2, +4, +8, +16) ➔ 17 + 16 = 33`;
  }

  const opts = [
    nextVal.toString(),
    (nextVal + 2).toString(),
    (nextVal - 3).toString(),
    (nextVal + 4).toString(),
  ].sort(() => Math.random() - 0.5);

  return {
    id,
    category: 'number',
    title: `Number Challenge #${index}`,
    prompt: `Find the next number in sequence:\n${seq.join(', ')},  [ ? ]`,
    options: opts,
    correctAnswer: nextVal.toString(),
    explanation,
    timeLimitSeconds: 12,
  };
}

// Logic Puzzles Collection
export const LOGIC_PUZZLES_BANK = [
  {
    q: 'If 3 cats catch 3 mice in 3 minutes, how many cats are needed to catch 100 mice in 100 minutes?',
    ans: '3 cats',
    opts: ['3 cats', '100 cats', '33 cats', '10 cats'],
    exp: 'One cat catches 1 mouse in 3 minutes. In 100 minutes, 1 cat can catch ~33.3 mice. So 3 cats will catch 100 mice in 100 minutes.',
  },
  {
    q: 'A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?',
    ans: '$0.05',
    opts: ['$0.05', '$0.10', '$0.15', '$0.01'],
    exp: 'Bat + Ball = 1.10. Bat = Ball + 1.00 => 2 × Ball + 1.00 = 1.10 => Ball = $0.05.',
  },
  {
    q: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?',
    ans: 'An Echo',
    opts: ['An Echo', 'A Ghost', 'A Cloud', 'A Shadow'],
    exp: 'An echo responds across canyons and empty space.',
  },
  {
    q: 'Which shape completes the rule: Triangle (3 sides) ➔ Square (4 sides) ➔ Pentagon (5 sides) ➔ ?',
    ans: 'Hexagon',
    opts: ['Hexagon', 'Heptagon', 'Octagon', 'Decagon'],
    exp: 'Each shape adds one side. After Pentagon (5) is Hexagon (6).',
  },
  {
    q: 'All roses are flowers. Some flowers fade quickly. Therefore:',
    ans: 'Some roses might fade quickly',
    opts: [
      'Some roses might fade quickly',
      'All roses fade quickly',
      'No roses fade quickly',
      'Roses are not flowers',
    ],
    exp: 'We cannot be certain all fade, but logically some roses might fade quickly.',
  },
  {
    q: 'You have a 3-liter jug and a 5-liter jug. How can you measure exactly 4 liters?',
    ans: 'Fill 5L, pour into 3L, empty 3L, pour remaining 2L, fill 5L, top up 3L',
    opts: [
      'Fill 5L, pour into 3L, empty 3L, pour remaining 2L, fill 5L, top up 3L',
      'Fill both jugs halfway',
      'Pour 3L into 5L twice',
      'Not possible without marked scale',
    ],
    exp: '5L - 3L leaves 2L in 5L jug. Transfer 2L to 3L jug. Fill 5L jug, fill the remaining 1L of 3L jug. Exactly 4L remains in the 5L jug!',
  },
];

export function generateLogicQuestion(index: number = 1): QuestionData {
  const puzzle = LOGIC_PUZZLES_BANK[(index - 1) % LOGIC_PUZZLES_BANK.length];
  return {
    id: `logic_${Date.now()}_${index}`,
    category: 'logic',
    title: `Logic Puzzle #${index}`,
    prompt: puzzle.q,
    options: [...puzzle.opts].sort(() => Math.random() - 0.5),
    correctAnswer: puzzle.ans,
    explanation: puzzle.exp,
    timeLimitSeconds: 15,
  };
}

// Reaction Prompts
export function generateReactionQuestion(index: number = 1): QuestionData {
  const prompts = [
    {
      p: 'STROOP COLOR TEST:\nThe word spells "CYAN", but the font is colored in ORANGE.\nSelect the COLOR OF THE TEXT!',
      ans: 'ORANGE',
      opts: ['ORANGE', 'CYAN', 'VIOLET', 'LIME'],
      exp: 'Focus on the actual ink color, not the semantic word meaning.',
      visualData: { word: 'CYAN', colorHex: '#f97316' },
    },
    {
      p: 'STROOP COLOR TEST:\nThe word spells "PURPLE", but the font is colored in ELECTRIC BLUE.\nSelect the COLOR OF THE TEXT!',
      ans: 'BLUE',
      opts: ['BLUE', 'PURPLE', 'YELLOW', 'RED'],
      exp: 'The font text color was Electric Blue.',
      visualData: { word: 'PURPLE', colorHex: '#00e5ff' },
    },
    {
      p: 'RAPID SYMBOL RECOGNITION:\nSelect the lightning bolt symbol immediately!',
      ans: '⚡ (Lightning)',
      opts: ['⚡ (Lightning)', '🔥 (Fire)', '❄️ (Ice)', '💎 (Diamond)'],
      exp: '⚡ is the lightning bolt.',
    },
    {
      p: 'ODD ONE OUT:\nWhich symbol is facing in the opposite direction?',
      ans: '⬅️ Left',
      opts: ['⬅️ Left', '➡️ Right A', '➡️ Right B', '➡️ Right C'],
      exp: 'All arrows were pointing right except the left arrow.',
    },
  ];

  const picked = prompts[(index - 1) % prompts.length];
  return {
    id: `react_${Date.now()}_${index}`,
    category: 'reaction',
    title: `Reaction Test #${index}`,
    prompt: picked.p,
    visualData: picked.visualData,
    options: picked.opts.sort(() => Math.random() - 0.5),
    correctAnswer: picked.ans,
    explanation: picked.exp,
    timeLimitSeconds: 7,
  };
}
