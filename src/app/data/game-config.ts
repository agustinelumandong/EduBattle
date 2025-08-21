export interface GameConfig {
  economy: {
    startGold: number;
    goldPerSecond: number;
    killGold: number;
    correctBonus: number;
    wrongPenalty: number;
  };
  units: UnitConfig[];
  quiz: {
    timerSeconds: number;
    globalQuizIntervalSeconds: number;
    subjects: string[];
  };
  spells: SpellConfig[];
  battle: {
    matchDurationMinutes: number;
    baseMaxHealth: number;
    laneWidth: number;
    unitSpeed: number;
  };
}

export interface UnitConfig {
  id: string;
  subject: 'math' | 'science' | 'history' | 'language';
  name: string;
  hp: number;
  dps: number;
  cost: number;
  range?: number;
  speed: number;
  sprite: string;
  wrongMod: {
    hp: number;
    dps: number;
  };
  specialAbility?: string;
}

export interface SpellConfig {
  id: string;
  name: string;
  cost: number;
  cooldownSeconds: number;
  description: string;
  effect: string;
}

export interface QuizQuestion {
  id: string;
  subject: 'math' | 'science' | 'history' | 'language';
  difficulty: 'easy' | 'normal' | 'hard';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  timeLimit: number;
}

export const GAME_CONFIG: GameConfig = {
  economy: {
    startGold: 99999,
    goldPerSecond: 99999,
    killGold: 20,
    correctBonus: 50,
    wrongPenalty: 10,
  },
  units: [
    {
      id: 'knight',
      subject: 'math',
      name: 'Math Knight',
      hp: 120,
      dps: 12,
      cost: 200,
      speed: 60,
      sprite: 'knight',
      wrongMod: { hp: 0.67, dps: 0.67 },
      specialAbility: 'Shield Block - Reduces incoming damage by 20%',
    },
    {
      id: 'mage',
      subject: 'science',
      name: 'Science Mage',
      hp: 80,
      dps: 18,
      cost: 220,
      range: 3,
      speed: 45,
      sprite: 'mage',
      wrongMod: { hp: 0.67, dps: 0.67 },
      specialAbility: 'Chain Lightning - Hits multiple enemies',
    },
    {
      id: 'archer',
      subject: 'history',
      name: 'History Archer',
      hp: 70,
      dps: 14,
      cost: 180,
      range: 4,
      speed: 55,
      sprite: 'archer',
      wrongMod: { hp: 0.67, dps: 0.67 },
      specialAbility: 'Piercing Shot - Attacks penetrate armor',
    },
  ],
  quiz: {
    timerSeconds: 10,
    globalQuizIntervalSeconds: 10, // Quiz every 30 seconds
    subjects: ['math', 'science', 'history', 'language'],
  },
  spells: [
    {
      id: 'freeze',
      name: 'Freeze Lane',
      cost: 150,
      cooldownSeconds: 30,
      description: 'Freezes enemy units for 3 seconds',
      effect: 'freeze_enemies',
    },
    {
      id: 'heal',
      name: 'Heal Base',
      cost: 120,
      cooldownSeconds: 25,
      description: 'Restores 10% of base health',
      effect: 'heal_base',
    },
    {
      id: 'double_gold',
      name: 'Double Gold',
      cost: 200,
      cooldownSeconds: 60,
      description: 'Double gold income for 10 seconds',
      effect: 'double_gold',
    },
  ],
  battle: {
    matchDurationMinutes: 4,
    baseMaxHealth: 100,
    laneWidth: 800,
    unitSpeed: 50,
  },
};

export const QUIZ_BANK: QuizQuestion[] = [
  // Math Questions
  {
    id: 'math_001',
    subject: 'math',
    difficulty: 'easy',
    question: 'What is 12 × 8?',
    options: ['84', '96', '102', '88'],
    correctAnswer: '96',
    timeLimit: 10,
  },
  {
    id: 'math_002',
    subject: 'math',
    difficulty: 'easy',
    question: 'What is 45 ÷ 5?',
    options: ['7', '8', '9', '10'],
    correctAnswer: '9',
    timeLimit: 10,
  },
  {
    id: 'math_003',
    subject: 'math',
    difficulty: 'normal',
    question: 'What is 7² + 3²?',
    options: ['52', '58', '49', '64'],
    correctAnswer: '58',
    explanation: '7² = 49, 3² = 9, so 49 + 9 = 58',
    timeLimit: 10,
  },
  {
    id: 'math_004',
    subject: 'math',
    difficulty: 'normal',
    question: 'If x + 15 = 23, what is x?',
    correctAnswer: 8,
    timeLimit: 10,
  },
  {
    id: 'math_005',
    subject: 'math',
    difficulty: 'hard',
    question: 'What is the area of a circle with radius 5? (Use π ≈ 3.14)',
    options: ['78.5', '31.4', '15.7', '62.8'],
    correctAnswer: '78.5',
    explanation: 'Area = πr² = 3.14 × 5² = 3.14 × 25 = 78.5',
    timeLimit: 10,
  },

  // Science Questions
  {
    id: 'sci_001',
    subject: 'science',
    difficulty: 'easy',
    question: 'What do we call the change from solid to liquid?',
    options: ['Freezing', 'Melting', 'Boiling', 'Condensing'],
    correctAnswer: 'Melting',
    timeLimit: 10,
  },
  {
    id: 'sci_002',
    subject: 'science',
    difficulty: 'easy',
    question: 'What do we call the change from gas to liquid?',
    options: ['Evaporation', 'Melting', 'Condensation', 'Sublimation'],
    correctAnswer: 'Condensation',
    timeLimit: 10,
  },
  {
    id: 'sci_003',
    subject: 'science',
    difficulty: 'normal',
    question: 'What is the chemical symbol for water?',
    options: ['H2O', 'CO2', 'NaCl', 'O2'],
    correctAnswer: 'H2O',
    timeLimit: 10,
  },
  {
    id: 'sci_004',
    subject: 'science',
    difficulty: 'normal',
    question: 'How many bones are in an adult human body?',
    options: ['186', '206', '226', '246'],
    correctAnswer: '206',
    timeLimit: 10,
  },
  {
    id: 'sci_005',
    subject: 'science',
    difficulty: 'hard',
    question: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi Apparatus'],
    correctAnswer: 'Mitochondria',
    explanation: 'Mitochondria generate ATP, providing energy for cellular processes',
    timeLimit: 10,
  },

  // History Questions
  {
    id: 'hist_001',
    subject: 'history',
    difficulty: 'easy',
    question: 'Who is the national hero of the Philippines?',
    options: ['Andres Bonifacio', 'Jose Rizal', 'Lapu-Lapu', 'Emilio Aguinaldo'],
    correctAnswer: 'Jose Rizal',
    timeLimit: 10,
  },
  {
    id: 'hist_002',
    subject: 'history',
    difficulty: 'easy',
    question: 'In what year did the EDSA People Power Revolution happen?',
    options: ['1984', '1985', '1986', '1987'],
    correctAnswer: '1986',
    timeLimit: 10,
  },
  {
    id: 'hist_003',
    subject: 'history',
    difficulty: 'normal',
    question: 'Who was the first President of the Philippines?',
    options: ['Manuel Quezon', 'Emilio Aguinaldo', 'Jose Rizal', 'Ramon Magsaysay'],
    correctAnswer: 'Emilio Aguinaldo',
    timeLimit: 10,
  },
  {
    id: 'hist_004',
    subject: 'history',
    difficulty: 'normal',
    question: 'When did World War II end?',
    options: ['1944', '1945', '1946', '1947'],
    correctAnswer: '1945',
    timeLimit: 10,
  },
  {
    id: 'hist_005',
    subject: 'history',
    difficulty: 'hard',
    question: 'What ancient wonder was located in Alexandria?',
    options: ['Hanging Gardens', 'Colossus of Rhodes', 'Lighthouse of Alexandria', 'Temple of Artemis'],
    correctAnswer: 'Lighthouse of Alexandria',
    explanation: 'The Lighthouse of Alexandria was one of the Seven Wonders of the Ancient World',
    timeLimit: 10,
  },

  // Language Questions
  {
    id: 'lang_001',
    subject: 'language',
    difficulty: 'easy',
    question: 'What is the plural of "child"?',
    options: ['Childs', 'Children', 'Childes', 'Childer'],
    correctAnswer: 'Children',
    timeLimit: 10,
  },
  {
    id: 'lang_002',
    subject: 'language',
    difficulty: 'easy',
    question: 'What is "salamat" in English?',
    options: ['Hello', 'Goodbye', 'Thank you', 'Please'],
    correctAnswer: 'Thank you',
    timeLimit: 10,
  },
  {
    id: 'lang_003',
    subject: 'language',
    difficulty: 'normal',
    question: 'Which is the correct spelling?',
    options: ['Definitely', 'Definately', 'Definatly', 'Defintely'],
    correctAnswer: 'Definitely',
    timeLimit: 10,
  },
  {
    id: 'lang_004',
    subject: 'language',
    difficulty: 'normal',
    question: 'What does "ubiquitous" mean?',
    options: ['Very rare', 'Everywhere present', 'Ancient', 'Mysterious'],
    correctAnswer: 'Everywhere present',
    timeLimit: 10,
  },
  {
    id: 'lang_005',
    subject: 'language',
    difficulty: 'hard',
    question: 'What is a group of lions called?',
    options: ['Pack', 'Herd', 'Pride', 'Flock'],
    correctAnswer: 'Pride',
    timeLimit: 10,
  },
];

export const SUBJECT_COLORS = {
  math: '#3B82F6', // Blue
  science: '#10B981', // Green
  history: '#F59E0B', // Amber
  language: '#8B5CF6', // Purple
} as const;

export const SUBJECT_ICONS = {
  math: '🔢',
  science: '🧪',
  history: '📜',
  language: '🔤',
} as const;