
export interface Card {
  id: string;
  content: string;
  emoji: string;
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
  category: string;
}

export interface GameStats {
  moves: number;
  matches: number;
  timeElapsed: number;
  score: number;
  bestScore: number;
}

export interface GameSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  theme: 'animals' | 'food' | 'tech' | 'space' | 'nature';
  cardCount: number;
}

export interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export interface GeneratedTheme {
  theme: string;
  cards: {
    content: string;
    emoji: string;
  }[];
}
