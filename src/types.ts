export type NavTab = 
  | 'home' 
  | 'pomodoro' 
  | 'ai-study' 
  | 'essay-lab' 
  | 'achievements' 
  | 'support';

export interface UserStats {
  streakDays: number;
  xp: number;
  maxXp: number;
  level: number;
  totalFocusMinutes: number;
  completedPomodoros: number;
  essaysGraded: number;
  aiQuestionsAsked: number;
}

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: 'estudo' | 'redacao' | 'leitura' | 'outros';
  estimatedPomodoros: number;
  completedPomodoros: number;
}

export interface GardenPlant {
  id: string;
  name: string;
  type: 'daisy' | 'sunflower' | 'clover' | 'lavender' | 'moss';
  growthStage: 1 | 2 | 3 | 4; // 1: semente, 2: broto, 3: flor, 4: flor completa
  plantedAt: string;
  wateredTimes: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number; // 0 a 100
  unlockedAt?: string;
}

export interface QuizQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface EssayCorrectionResult {
  overallScore: number;
  gradeLabel: string;
  generalFeedback: string;
  competencies: {
    name: string;
    score: number;
    feedback: string;
  }[];
  strengths: string[];
  improvements: string[];
  revisions: {
    originalSnippet: string;
    suggestedCorrection: string;
    reason: string;
  }[];
}
