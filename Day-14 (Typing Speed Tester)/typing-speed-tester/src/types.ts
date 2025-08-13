
export interface TypingStats {
  wpm: number;
  accuracy: number;
  totalChars: number;
  correctChars: number;
  incorrectChars: number;
  timeElapsed: number;
}

export interface TestResult {
  id: string;
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  totalChars: number;
  difficulty: string;
  category: string;
  date: string;
}

export interface GameSettings {
  timeLimit: number; // in seconds
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'general' | 'tech' | 'literature' | 'news' | 'quotes';
}

export interface CharacterState {
  char: string;
  status: 'pending' | 'correct' | 'incorrect' | 'current';
}

export interface PersonalBest {
  wpm: number;
  accuracy: number;
  date: string;
  difficulty: string;
  category: string;
}

export interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export interface GeneratedText {
  text: string;
  category: string;
  difficulty: string;
}
