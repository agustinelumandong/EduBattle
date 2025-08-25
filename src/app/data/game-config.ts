export interface GameConfig {
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
  subject: "math" | "science" | "history" | "language";
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
  subject: "math" | "science" | "history" | "language";
  difficulty: "easy" | "normal" | "hard";
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  timeLimit: number;
}

export const GAME_CONFIG: GameConfig = {
  units: [
    {
      id: "knight",
      subject: "math",
      name: "Math Knight",
      hp: 120,
      dps: 12,
      cost: 200,
      speed: 70,
      sprite: "knight",
      wrongMod: { hp: 0.67, dps: 0.67 },
      specialAbility: "Shield Block - Reduces incoming damage by 20%",
    },
    {
      id: "mage",
      subject: "science",
      name: "Science Mage",
      hp: 80,
      dps: 18,
      cost: 220,
      range: 3,
      speed: 55,
      sprite: "mage",
      wrongMod: { hp: 0.67, dps: 0.67 },
      specialAbility: "Chain Lightning - Hits multiple enemies",
    },
    {
      id: "archer",
      subject: "history",
      name: "History Archer",
      hp: 70,
      dps: 14,
      cost: 180,
      range: 4,
      speed: 65,
      sprite: "archer",
      wrongMod: { hp: 0.67, dps: 0.67 },
      specialAbility: "Piercing Shot - Attacks penetrate armor",
    },
  ],
  quiz: {
    timerSeconds: 10,
    globalQuizIntervalSeconds: 15, // Quiz every 15 seconds
    subjects: ["math", "science", "history", "language"],
  },
  spells: [
    {
      id: "freeze",
      name: "Freeze Lane",
      cost: 150,
      cooldownSeconds: 30,
      description: "Freezes enemy units for 3 seconds",
      effect: "freeze_enemies",
    },
    {
      id: "meteor",
      name: "Meteor Strike",
      cost: 500,
      cooldownSeconds: 45,
      description: "Rains meteors on all enemy units dealing massive damage",
      effect: "meteor_strike",
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
    id: "math_001",
    subject: "math",
    difficulty: "easy",
    question: "What is 12 × 8?",
    options: ["84", "96", "102", "88"],
    correctAnswer: "96",
    timeLimit: 10,
  },
  {
    id: "math_002",
    subject: "math",
    difficulty: "easy",
    question: "What is 45 ÷ 5?",
    options: ["7", "8", "9", "10"],
    correctAnswer: "9",
    timeLimit: 10,
  },
  {
    id: "math_003",
    subject: "math",
    difficulty: "normal",
    question: "What is 7² + 3²?",
    options: ["52", "58", "49", "64"],
    correctAnswer: "58",
    explanation: "7² = 49, 3² = 9, so 49 + 9 = 58",
    timeLimit: 10,
  },
  {
    id: "math_004",
    subject: "math",
    difficulty: "normal",
    question: "If x + 15 = 23, what is x?",
    correctAnswer: 8,
    timeLimit: 10,
  },
  {
    id: "math_005",
    subject: "math",
    difficulty: "hard",
    question: "What is the area of a circle with radius 5? (Use π ≈ 3.14)",
    options: ["78.5", "31.4", "15.7", "62.8"],
    correctAnswer: "78.5",
    explanation: "Area = πr² = 3.14 × 5² = 3.14 × 25 = 78.5",
    timeLimit: 10,
  },
  {
    id: "math_006",
    subject: "math",
    difficulty: "easy",
    question: "What is 6 × 7?",
    options: ["40", "42", "44", "48"],
    correctAnswer: "42",
    timeLimit: 10,
  },
  {
    id: "math_007",
    subject: "math",
    difficulty: "easy",
    question: "What is 64 ÷ 8?",
    options: ["6", "7", "8", "9"],
    correctAnswer: "8",
    timeLimit: 10,
  },
  {
    id: "math_008",
    subject: "math",
    difficulty: "easy",
    question: "What is 15 + 27?",
    options: ["41", "42", "43", "44"],
    correctAnswer: "42",
    timeLimit: 10,
  },
  {
    id: "math_009",
    subject: "math",
    difficulty: "easy",
    question: "What is 100 - 35?",
    options: ["65", "70", "75", "80"],
    correctAnswer: "65",
    timeLimit: 10,
  },
  {
    id: "math_010",
    subject: "math",
    difficulty: "easy",
    question: "What is 9 × 6?",
    options: ["52", "54", "56", "58"],
    correctAnswer: "54",
    timeLimit: 10,
  },
  {
    id: "math_011",
    subject: "math",
    difficulty: "normal",
    question: "What is 25% of 80?",
    options: ["15", "20", "25", "30"],
    correctAnswer: "20",
    explanation: "25% = 1/4, so 80 ÷ 4 = 20",
    timeLimit: 10,
  },
  {
    id: "math_012",
    subject: "math",
    difficulty: "normal",
    question: "If y - 12 = 18, what is y?",
    correctAnswer: 30,
    timeLimit: 10,
  },
  {
    id: "math_013",
    subject: "math",
    difficulty: "normal",
    question: "What is 8² - 5²?",
    options: ["39", "42", "45", "48"],
    correctAnswer: "39",
    explanation: "8² = 64, 5² = 25, so 64 - 25 = 39",
    timeLimit: 10,
  },
  {
    id: "math_014",
    subject: "math",
    difficulty: "normal",
    question: "What is the perimeter of a rectangle with length 8 and width 5?",
    options: ["26", "28", "30", "32"],
    correctAnswer: "26",
    explanation: "Perimeter = 2(length + width) = 2(8 + 5) = 2(13) = 26",
    timeLimit: 10,
  },
  {
    id: "math_015",
    subject: "math",
    difficulty: "normal",
    question: "What is 3/4 as a decimal?",
    options: ["0.25", "0.5", "0.75", "0.8"],
    correctAnswer: "0.75",
    timeLimit: 10,
  },
  {
    id: "math_016",
    subject: "math",
    difficulty: "normal",
    question: "What is 12% of 150?",
    options: ["16", "18", "20", "22"],
    correctAnswer: "18",
    explanation: "12% = 0.12, so 150 × 0.12 = 18",
    timeLimit: 10,
  },
  {
    id: "math_017",
    subject: "math",
    difficulty: "hard",
    question: "What is the volume of a cube with side length 4?",
    options: ["48", "56", "64", "72"],
    correctAnswer: "64",
    explanation: "Volume = side³ = 4³ = 64",
    timeLimit: 10,
  },
  {
    id: "math_018",
    subject: "math",
    difficulty: "hard",
    question: "If 2x + 5 = 17, what is x?",
    correctAnswer: 6,
    explanation: "2x = 17 - 5 = 12, so x = 12 ÷ 2 = 6",
    timeLimit: 10,
  },
  {
    id: "math_019",
    subject: "math",
    difficulty: "hard",
    question: "What is the square root of 144?",
    options: ["10", "11", "12", "13"],
    correctAnswer: "12",
    explanation: "12 × 12 = 144",
    timeLimit: 10,
  },
  {
    id: "math_020",
    subject: "math",
    difficulty: "hard",
    question:
      "What is the circumference of a circle with radius 7? (Use π ≈ 3.14)",
    options: ["43.96", "44.04", "43.88", "44.12"],
    correctAnswer: "43.96",
    explanation: "Circumference = 2πr = 2 × 3.14 × 7 = 43.96",
    timeLimit: 10,
  },

  // Science Questions
  {
    id: "sci_001",
    subject: "science",
    difficulty: "easy",
    question: "What do we call the change from solid to liquid?",
    options: ["Freezing", "Melting", "Boiling", "Condensing"],
    correctAnswer: "Melting",
    timeLimit: 10,
  },
  {
    id: "sci_002",
    subject: "science",
    difficulty: "easy",
    question: "What do we call the change from gas to liquid?",
    options: ["Evaporation", "Melting", "Condensation", "Sublimation"],
    correctAnswer: "Condensation",
    timeLimit: 10,
  },
  {
    id: "sci_003",
    subject: "science",
    difficulty: "normal",
    question: "What is the chemical symbol for water?",
    options: ["H2O", "CO2", "NaCl", "O2"],
    correctAnswer: "H2O",
    timeLimit: 10,
  },
  {
    id: "sci_004",
    subject: "science",
    difficulty: "normal",
    question: "How many bones are in an adult human body?",
    options: ["186", "206", "226", "246"],
    correctAnswer: "206",
    timeLimit: 10,
  },
  {
    id: "sci_005",
    subject: "science",
    difficulty: "hard",
    question: "What is the powerhouse of the cell?",
    options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Apparatus"],
    correctAnswer: "Mitochondria",
    explanation:
      "Mitochondria generate ATP, providing energy for cellular processes",
    timeLimit: 10,
  },
  {
    id: "sci_006",
    subject: "science",
    difficulty: "easy",
    question: "What do plants need to make their own food?",
    options: ["Sunlight", "Water", "Carbon dioxide", "All of the above"],
    correctAnswer: "All of the above",
    timeLimit: 10,
  },
  {
    id: "sci_007",
    subject: "science",
    difficulty: "easy",
    question: "What is the center of our solar system?",
    options: ["Earth", "Moon", "Sun", "Jupiter"],
    correctAnswer: "Sun",
    timeLimit: 10,
  },
  {
    id: "sci_008",
    subject: "science",
    difficulty: "easy",
    question: "What gas do we breathe in?",
    options: ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"],
    correctAnswer: "Oxygen",
    timeLimit: 10,
  },
  {
    id: "sci_009",
    subject: "science",
    difficulty: "easy",
    question: "How many legs does an insect have?",
    options: ["4", "6", "8", "10"],
    correctAnswer: "6",
    timeLimit: 10,
  },
  {
    id: "sci_010",
    subject: "science",
    difficulty: "easy",
    question: "What is the hardest natural substance?",
    options: ["Gold", "Iron", "Diamond", "Silver"],
    correctAnswer: "Diamond",
    timeLimit: 10,
  },
  {
    id: "sci_011",
    subject: "science",
    difficulty: "normal",
    question: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctAnswer: "Au",
    explanation: "Au comes from the Latin word 'aurum' meaning gold",
    timeLimit: 10,
  },
  {
    id: "sci_012",
    subject: "science",
    difficulty: "normal",
    question: "What type of animal is a dolphin?",
    options: ["Fish", "Mammal", "Reptile", "Amphibian"],
    correctAnswer: "Mammal",
    timeLimit: 10,
  },
  {
    id: "sci_013",
    subject: "science",
    difficulty: "normal",
    question: "What is the largest planet in our solar system?",
    options: ["Saturn", "Neptune", "Jupiter", "Uranus"],
    correctAnswer: "Jupiter",
    timeLimit: 10,
  },
  {
    id: "sci_014",
    subject: "science",
    difficulty: "normal",
    question: "What is the process by which plants make food called?",
    options: ["Respiration", "Photosynthesis", "Digestion", "Circulation"],
    correctAnswer: "Photosynthesis",
    explanation:
      "Plants use sunlight, water, and CO2 to make glucose and oxygen",
    timeLimit: 10,
  },
  {
    id: "sci_015",
    subject: "science",
    difficulty: "normal",
    question: "What is the fastest land animal?",
    options: ["Lion", "Cheetah", "Leopard", "Tiger"],
    correctAnswer: "Cheetah",
    timeLimit: 10,
  },
  {
    id: "sci_016",
    subject: "science",
    difficulty: "normal",
    question: "How many chambers does a human heart have?",
    options: ["2", "3", "4", "5"],
    correctAnswer: "4",
    explanation: "The heart has 2 atria and 2 ventricles",
    timeLimit: 10,
  },
  {
    id: "sci_017",
    subject: "science",
    difficulty: "hard",
    question: "What is the pH of pure water?",
    options: ["6", "7", "8", "9"],
    correctAnswer: "7",
    explanation: "Pure water is neutral with a pH of 7",
    timeLimit: 10,
  },
  {
    id: "sci_018",
    subject: "science",
    difficulty: "hard",
    question:
      "What type of electromagnetic radiation has the shortest wavelength?",
    options: ["Radio waves", "Microwaves", "X-rays", "Gamma rays"],
    correctAnswer: "Gamma rays",
    explanation: "Gamma rays have the highest energy and shortest wavelength",
    timeLimit: 10,
  },
  {
    id: "sci_019",
    subject: "science",
    difficulty: "hard",
    question: "What is the study of earthquakes called?",
    options: ["Geology", "Seismology", "Meteorology", "Volcanology"],
    correctAnswer: "Seismology",
    timeLimit: 10,
  },
  {
    id: "sci_020",
    subject: "science",
    difficulty: "hard",
    question: "What is the most abundant gas in Earth's atmosphere?",
    options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Argon"],
    correctAnswer: "Nitrogen",
    explanation: "Nitrogen makes up about 78% of Earth's atmosphere",
    timeLimit: 10,
  },

  // History Questions
  {
    id: "hist_001",
    subject: "history",
    difficulty: "easy",
    question: "Who is the national hero of the Philippines?",
    options: [
      "Andres Bonifacio",
      "Jose Rizal",
      "Lapu-Lapu",
      "Emilio Aguinaldo",
    ],
    correctAnswer: "Jose Rizal",
    timeLimit: 10,
  },
  {
    id: "hist_002",
    subject: "history",
    difficulty: "easy",
    question: "In what year did the EDSA People Power Revolution happen?",
    options: ["1984", "1985", "1986", "1987"],
    correctAnswer: "1986",
    timeLimit: 10,
  },
  {
    id: "hist_003",
    subject: "history",
    difficulty: "normal",
    question: "Who was the first President of the Philippines?",
    options: [
      "Manuel Quezon",
      "Emilio Aguinaldo",
      "Jose Rizal",
      "Ramon Magsaysay",
    ],
    correctAnswer: "Emilio Aguinaldo",
    timeLimit: 10,
  },
  {
    id: "hist_004",
    subject: "history",
    difficulty: "normal",
    question: "When did the Philippine Revolution against Spain begin?",
    options: ["1896", "1898", "1901", "1872"],
    correctAnswer: "1896",
    timeLimit: 10,
  },
  {
    id: "hist_005",
    subject: "history",
    difficulty: "hard",
    question: "Who was the first female president of the Philippines?",
    options: [
      "Gloria Macapagal Arroyo",
      "Corazon Aquino",
      "Imelda Marcos",
      "Leni Robredo",
    ],
    correctAnswer: "Corazon Aquino",
    timeLimit: 10,
  },
  {
    id: "hist_006",
    subject: "history",
    difficulty: "easy",
    question: "What is the capital city of the Philippines?",
    options: ["Cebu", "Davao", "Manila", "Quezon City"],
    correctAnswer: "Manila",
    timeLimit: 10,
  },
  {
    id: "hist_007",
    subject: "history",
    difficulty: "easy",
    question: "Which country colonized the Philippines for over 300 years?",
    options: ["Spain", "America", "Japan", "Portugal"],
    correctAnswer: "Spain",
    timeLimit: 10,
  },
  {
    id: "hist_008",
    subject: "history",
    difficulty: "easy",
    question: "When is Philippine Independence Day celebrated?",
    options: ["June 12", "July 4", "August 26", "December 30"],
    correctAnswer: "June 12",
    timeLimit: 10,
  },
  {
    id: "hist_009",
    subject: "history",
    difficulty: "easy",
    question: "Who wrote 'Noli Me Tangere'?",
    options: [
      "Andres Bonifacio",
      "Jose Rizal",
      "Apolinario Mabini",
      "Marcelo del Pilar",
    ],
    correctAnswer: "Jose Rizal",
    timeLimit: 10,
  },
  {
    id: "hist_010",
    subject: "history",
    difficulty: "easy",
    question: "Who is known as the 'Father of the Philippine Revolution'?",
    options: [
      "Jose Rizal",
      "Andres Bonifacio",
      "Emilio Aguinaldo",
      "Apolinario Mabini",
    ],
    correctAnswer: "Andres Bonifacio",
    timeLimit: 10,
  },
  {
    id: "hist_011",
    subject: "history",
    difficulty: "normal",
    question: "Who was the founder of the Katipunan?",
    options: [
      "Jose Rizal",
      "Andres Bonifacio",
      "Emilio Jacinto",
      "Apolinario Mabini",
    ],
    correctAnswer: "Andres Bonifacio",
    explanation: "Andres Bonifacio founded the Katipunan in 1892",
    timeLimit: 10,
  },
  {
    id: "hist_012",
    subject: "history",
    difficulty: "normal",
    question:
      "In what year did the Philippines gain independence from America?",
    options: ["1946", "1945", "1947", "1948"],
    correctAnswer: "1946",
    timeLimit: 10,
  },
  {
    id: "hist_013",
    subject: "history",
    difficulty: "normal",
    question: "Who was the first Filipino to circumnavigate the globe?",
    options: [
      "Ferdinand Magellan",
      "Enrique of Malacca",
      "Miguel Lopez de Legazpi",
      "Rajah Humabon",
    ],
    correctAnswer: "Enrique of Malacca",
    explanation:
      "Enrique of Malacca, Magellan's slave, was the first Filipino to circumnavigate the globe.",
    timeLimit: 10,
  },
  {
    id: "hist_014",
    subject: "history",
    difficulty: "normal",
    question:
      "What was the name of the secret society that fought for Philippine independence from Spain?",
    options: [
      "La Liga Filipina",
      "Katipunan",
      "Propaganda Movement",
      "Hukbalahap",
    ],
    correctAnswer: "Katipunan",
    timeLimit: 10,
  },
  {
    id: "hist_015",
    subject: "history",
    difficulty: "normal",
    question:
      "Who was the first Filipino president of the Commonwealth of the Philippines?",
    options: ["Manuel Roxas", "Sergio Osmeña", "Manuel Quezon", "Jose Laurel"],
    correctAnswer: "Manuel Quezon",
    timeLimit: 10,
  },
  {
    id: "hist_016",
    subject: "history",
    difficulty: "normal",
    question:
      "Who led the longest revolt in Philippine history, known as the Dagohoy Rebellion?",
    options: [
      "Diego Silang",
      "Francisco Dagohoy",
      "Gabriela Silang",
      "Apolinario dela Cruz",
    ],
    correctAnswer: "Francisco Dagohoy",
    explanation:
      "Francisco Dagohoy led the Dagohoy Rebellion in Bohol, which lasted for 85 years.",
    timeLimit: 10,
  },
  {
    id: "hist_017",
    subject: "history",
    difficulty: "hard",
    question: "What year was the Katipunan discovered by Spanish authorities?",
    options: ["1895", "1896", "1897", "1898"],
    correctAnswer: "1896",
    explanation:
      "The Katipunan was discovered in August 1896, leading to the Philippine Revolution",
    timeLimit: 10,
  },
  {
    id: "hist_018",
    subject: "history",
    difficulty: "hard",
    question: "Who was the Brain of the Katipunan?",
    options: [
      "Andres Bonifacio",
      "Jose Rizal",
      "Emilio Jacinto",
      "Marcelo del Pilar",
    ],
    correctAnswer: "Emilio Jacinto",
    explanation: "Emilio Jacinto was known as the Brain of the Katipunan",
    timeLimit: 10,
  },
  {
    id: "hist_019",
    subject: "history",
    difficulty: "hard",
    question:
      "Who was the first president of the Third Republic of the Philippines?",
    options: [
      "Manuel Roxas",
      "Elpidio Quirino",
      "Ramon Magsaysay",
      "Carlos P. Garcia",
    ],
    correctAnswer: "Manuel Roxas",
    explanation:
      "Manuel Roxas became the first president of the independent Third Republic in 1946.",
    timeLimit: 10,
  },
  {
    id: "hist_020",
    subject: "history",
    difficulty: "hard",
    question:
      "Who was the leader of the Philippine revolutionaries during the Philippine-American War?",
    options: [
      "Andres Bonifacio",
      "Emilio Aguinaldo",
      "Antonio Luna",
      "Gregorio del Pilar",
    ],
    correctAnswer: "Emilio Aguinaldo",
    explanation:
      "Emilio Aguinaldo led the Filipino forces during the Philippine-American War.",
    timeLimit: 10,
  },

  // Language Questions
  {
    id: "lang_001",
    subject: "language",
    difficulty: "easy",
    question: 'What is the plural of "child"?',
    options: ["Childs", "Children", "Childes", "Childer"],
    correctAnswer: "Children",
    timeLimit: 10,
  },
  {
    id: "lang_002",
    subject: "language",
    difficulty: "easy",
    question: 'What is "salamat" in English?',
    options: ["Hello", "Goodbye", "Thank you", "Please"],
    correctAnswer: "Thank you",
    timeLimit: 10,
  },
  {
    id: "lang_003",
    subject: "language",
    difficulty: "normal",
    question: "Which is the correct spelling?",
    options: ["Definitely", "Definately", "Definatly", "Defintely"],
    correctAnswer: "Definitely",
    timeLimit: 10,
  },
  {
    id: "lang_004",
    subject: "language",
    difficulty: "normal",
    question: 'What does "ubiquitous" mean?',
    options: ["Very rare", "Everywhere present", "Ancient", "Mysterious"],
    correctAnswer: "Everywhere present",
    timeLimit: 10,
  },
  {
    id: "lang_005",
    subject: "language",
    difficulty: "hard",
    question: "What is a group of lions called?",
    options: ["Pack", "Herd", "Pride", "Flock"],
    correctAnswer: "Pride",
    timeLimit: 10,
  },
];

export const SUBJECT_COLORS = {
  math: "#3B82F6", // Blue
  science: "#10B981", // Green
  history: "#F59E0B", // Amber
  language: "#8B5CF6", // Purple
} as const;

export const SUBJECT_ICONS = {
  math: "🔢",
  science: "🧪",
  history: "📜",
  language: "🔤",
} as const;
