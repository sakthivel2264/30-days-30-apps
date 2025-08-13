
export interface MoodEntry {
  id: string;
  date: string;
  mood: MoodLevel;
  note: string;
  factors: string[];
  timestamp: number;
}

export type MoodLevel = 'excellent' | 'good' | 'okay' | 'bad' | 'terrible';

export interface MoodPattern {
  trend: 'improving' | 'declining' | 'stable';
  averageMood: number;
  mostCommonMood: MoodLevel;
  bestDay: string;
  worstDay: string;
  streaks: {
    current: number;
    longest: number;
    type: 'positive' | 'negative' | 'neutral';
  };
}

export interface MoodInsight {
  id: string;
  type: 'pattern' | 'trigger' | 'suggestion' | 'achievement';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  suggestions?: string[];
}

export interface WeeklyStats {
  week: string;
  averageMood: number;
  totalEntries: number;
  moodDistribution: Record<MoodLevel, number>;
}

export interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export interface AIInsightRequest {
  recentEntries: MoodEntry[];
  weeklyStats: WeeklyStats[];
  currentStreak: number;
  userId?: string;
}
