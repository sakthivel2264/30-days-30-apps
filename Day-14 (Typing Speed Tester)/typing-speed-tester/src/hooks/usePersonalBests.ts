
import { useState, useEffect } from 'react';
import type { PersonalBest, TestResult } from '../types';

const STORAGE_KEY = 'typing-speed-personal-bests';

export const usePersonalBests = () => {
  const [personalBests, setPersonalBests] = useState<PersonalBest[]>([]);

  // Load personal bests from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPersonalBests(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading personal bests:', error);
      }
    }
  }, []);

  // Save personal bests to localStorage
  const savePersonalBests = (bests: PersonalBest[]) => {
    setPersonalBests(bests);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bests));
  };

  // Check and update personal best
  const updatePersonalBest = (result: TestResult) => {
    const key = `${result.difficulty}-${result.category}`;
    const existingIndex = personalBests.findIndex(
      pb => pb.difficulty === result.difficulty && pb.category === result.category
    );

    let isNewRecord = false;
    let updatedBests = [...personalBests];

    if (existingIndex >= 0) {
      // Update existing record if this one is better
      const existing = personalBests[existingIndex];
      if (result.wpm > existing.wpm || 
          (result.wpm === existing.wpm && result.accuracy > existing.accuracy)) {
        updatedBests[existingIndex] = {
          wpm: result.wpm,
          accuracy: result.accuracy,
          date: result.date,
          difficulty: result.difficulty,
          category: result.category
        };
        isNewRecord = true;
      }
    } else {
      // Add new record
      updatedBests.push({
        wpm: result.wpm,
        accuracy: result.accuracy,
        date: result.date,
        difficulty: result.difficulty,
        category: result.category
      });
      isNewRecord = true;
    }

    if (isNewRecord) {
      savePersonalBests(updatedBests);
    }

    return isNewRecord;
  };

  // Get personal best for specific difficulty and category
  const getPersonalBest = (difficulty: string, category: string): PersonalBest | null => {
    return personalBests.find(
      pb => pb.difficulty === difficulty && pb.category === category
    ) || null;
  };

  // Get overall best WPM
  const getOverallBest = (): PersonalBest | null => {
    if (personalBests.length === 0) return null;
    return personalBests.reduce((best, current) => 
      current.wpm > best.wpm ? current : best
    );
  };

  return {
    personalBests,
    updatePersonalBest,
    getPersonalBest,
    getOverallBest
  };
};
