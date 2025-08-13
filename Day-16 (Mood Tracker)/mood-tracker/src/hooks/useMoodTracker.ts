import { useState, useEffect, useCallback } from 'react';
import type { MoodEntry, MoodLevel, MoodPattern, WeeklyStats, MoodInsight } from '../types';
import { OpenRouterService } from '../services/openRouterService';
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { generateDummyMoodEntries } from '@/data/dummyMoodData';

const STORAGE_KEY = 'mood-tracker-entries';

export const useMoodTracker = () => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<MoodInsight[]>([]);
  const [lastInsightUpdate, setLastInsightUpdate] = useState<number>(0);

  // Load entries from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedEntries = JSON.parse(stored);
        setEntries(parsedEntries);
      } catch (error) {
        console.error('Error loading mood entries:', error);
      }
    }
  }, []);

  // Save entries to localStorage
  const saveEntries = useCallback((newEntries: MoodEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
  }, []);

  // Add new mood entry
  const addMoodEntry = useCallback((mood: MoodLevel, note: string, factors: string[]) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const existingIndex = entries.findIndex(entry => entry.date === today);
    
    const newEntry: MoodEntry = {
      id: existingIndex >= 0 ? entries[existingIndex].id : `mood-${Date.now()}`,
      date: today,
      mood,
      note: note.trim(),
      factors,
      timestamp: Date.now()
    };

    let newEntries: MoodEntry[];
    if (existingIndex >= 0) {
      // Update existing entry
      newEntries = entries.map((entry, index) => 
        index === existingIndex ? newEntry : entry
      );
    } else {
      // Add new entry
      newEntries = [...entries, newEntry].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    saveEntries(newEntries);
    return newEntry;
  }, [entries, saveEntries]);

  // Delete mood entry
  const deleteMoodEntry = useCallback((id: string) => {
    const newEntries = entries.filter(entry => entry.id !== id);
    saveEntries(newEntries);
  }, [entries, saveEntries]);

  // Get mood pattern analysis
  const getMoodPattern = useCallback((): MoodPattern => {
    if (entries.length === 0) {
      return {
        trend: 'stable',
        averageMood: 3,
        mostCommonMood: 'okay',
        bestDay: '',
        worstDay: '',
        streaks: { current: 0, longest: 0, type: 'neutral' }
      };
    }

    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const moodToNumber = (mood: MoodLevel): number => {
      const values = { terrible: 1, bad: 2, okay: 3, good: 4, excellent: 5 };
      return values[mood];
    };

    const recentEntries = sortedEntries.slice(-14); // Last 2 weeks
    const averageMood = recentEntries.reduce((sum, entry) => 
      sum + moodToNumber(entry.mood), 0) / recentEntries.length;

    // Determine trend
    const firstHalf = recentEntries.slice(0, Math.floor(recentEntries.length / 2));
    const secondHalf = recentEntries.slice(Math.floor(recentEntries.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, e) => sum + moodToNumber(e.mood), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, e) => sum + moodToNumber(e.mood), 0) / secondHalf.length;
    
    const trendThreshold = 0.3;
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (secondHalfAvg - firstHalfAvg > trendThreshold) trend = 'improving';
    else if (firstHalfAvg - secondHalfAvg > trendThreshold) trend = 'declining';

    // Most common mood
    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<MoodLevel, number>);

    const mostCommonMood = Object.entries(moodCounts)
      .reduce((a, b) => moodCounts[a[0] as MoodLevel] > moodCounts[b[0] as MoodLevel] ? a : b)[0] as MoodLevel;

    // Best and worst days
    const bestEntry = entries.reduce((best, entry) => 
      moodToNumber(entry.mood) > moodToNumber(best.mood) ? entry : best
    );
    const worstEntry = entries.reduce((worst, entry) => 
      moodToNumber(entry.mood) < moodToNumber(worst.mood) ? entry : worst
    );

    // Calculate streaks
    const streaks = calculateStreaks(sortedEntries);

    return {
      trend,
      averageMood,
      mostCommonMood,
      bestDay: format(new Date(bestEntry.date), 'MMM dd'),
      worstDay: format(new Date(worstEntry.date), 'MMM dd'),
      streaks
    };
  }, [entries]);

  // Calculate current tracking streak
  const getCurrentStreak = useCallback((): number => {
    if (entries.length === 0) return 0;

    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      const expectedDate = format(subDays(currentDate, streak), 'yyyy-MM-dd');
      
      if (entry.date === expectedDate) {
        streak++;
      } else if (streak === 0 && entry.date === format(currentDate, 'yyyy-MM-dd')) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [entries]);

  // Get weekly stats
  const getWeeklyStats = useCallback((): WeeklyStats[] => {
    const weeks: WeeklyStats[] = [];
    
    for (let i = 0; i < 8; i++) {
      const weekStart = startOfWeek(subDays(new Date(), i * 7));
      const weekEnd = endOfWeek(weekStart);
      
      const weekEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
      });

      if (weekEntries.length > 0) {
        const moodToNumber = (mood: MoodLevel): number => {
          const values = { terrible: 1, bad: 2, okay: 3, good: 4, excellent: 5 };
          return values[mood];
        };

        const averageMood = weekEntries.reduce((sum, entry) => 
          sum + moodToNumber(entry.mood), 0) / weekEntries.length;

        const moodDistribution = weekEntries.reduce((acc, entry) => {
          acc[entry.mood] = (acc[entry.mood] || 0) + 1;
          return acc;
        }, {} as Record<MoodLevel, number>);

        weeks.push({
          week: format(weekStart, 'MMM dd'),
          averageMood,
          totalEntries: weekEntries.length,
          moodDistribution
        });
      }
    }

    return weeks.reverse();
  }, [entries]);

  // Generate AI insights
  const generateInsights = useCallback(async () => {
    if (entries.length < 3) return; // Need at least 3 entries for meaningful insights
    
    // Don't generate insights more than once per day
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    if (lastInsightUpdate > oneDayAgo) return;

    setIsLoading(true);
    
    try {
      const weeklyStats = getWeeklyStats();
      const currentStreak = getCurrentStreak();
      const newInsights = await OpenRouterService.generateMoodInsights(
        entries,
        weeklyStats,
        currentStreak
      );
      
      setInsights(newInsights);
      setLastInsightUpdate(Date.now());
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setIsLoading(false);
    }
  }, [entries, getWeeklyStats, getCurrentStreak, lastInsightUpdate]);

  // Auto-generate insights when entries change (with debouncing)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (entries.length >= 3) {
        generateInsights();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [entries.length, generateInsights]);

//   const loadDummyData = useCallback(() => {
//   const dummyEntries = generateDummyMoodEntries();
//   saveEntries(dummyEntries);
//   return dummyEntries;
// }, [saveEntries]);

  return {
    entries,
    addMoodEntry,
    deleteMoodEntry,
    getMoodPattern,
    getCurrentStreak,
    getWeeklyStats,
    generateInsights,
    insights,
    isLoadingInsights: isLoading,
    // loadDummyData
  };
};

// Helper function to calculate mood streaks
function calculateStreaks(sortedEntries: MoodEntry[]) {
  if (sortedEntries.length === 0) {
    return { current: 0, longest: 0, type: 'neutral' as const };
  }

  const moodToNumber = (mood: MoodLevel): number => {
    const values = { terrible: 1, bad: 2, okay: 3, good: 4, excellent: 5 };
    return values[mood];
  };

  let currentStreak = 1;
  let longestStreak = 1;
  let currentType: 'positive' | 'negative' | 'neutral' = 'neutral';
  let longestType: 'positive' | 'negative' | 'neutral' = 'neutral';

  const getType = (mood: number): 'positive' | 'negative' | 'neutral' => {
    if (mood >= 4) return 'positive';
    if (mood <= 2) return 'negative';
    return 'neutral';
  };

  let lastType = getType(moodToNumber(sortedEntries[0].mood));
  currentType = lastType;

  for (let i = 1; i < sortedEntries.length; i++) {
    const currentMoodType = getType(moodToNumber(sortedEntries[i].mood));
    
    if (currentMoodType === lastType) {
      currentStreak++;
    } else {
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        longestType = lastType;
      }
      currentStreak = 1;
      lastType = currentMoodType;
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
    longestType = currentType;
  }

  return {
    current: currentStreak,
    longest: longestStreak,
    type: longestType
  };
}
