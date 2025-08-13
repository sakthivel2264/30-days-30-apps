
import { useState, useEffect, useCallback, useRef } from 'react';
import type { TypingStats, CharacterState, TestResult, GameSettings } from '../types';

export const useTypingTest = (text: string, settings: GameSettings) => {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(settings.timeLimit);
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 0,
    totalChars: 0,
    correctChars: 0,
    incorrectChars: 0,
    timeElapsed: 0
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize character states
  const getCharacterStates = useCallback((): CharacterState[] => {
    return text.split('').map((char, index) => {
      if (index < userInput.length) {
        return {
          char,
          status: userInput[index] === char ? 'correct' : 'incorrect'
        };
      } else if (index === currentPosition) {
        return {
          char,
          status: 'current'
        };
      } else {
        return {
          char,
          status: 'pending'
        };
      }
    });
  }, [text, userInput, currentPosition]);

  // Calculate typing statistics
  const calculateStats = useCallback((): TypingStats => {
    if (!startTime) return stats;

    const timeElapsed = (Date.now() - startTime) / 1000;
    const totalChars = userInput.length;
    const correctChars = userInput.split('').filter((char, index) => char === text[index]).length;
    const incorrectChars = totalChars - correctChars;
    
    // Calculate WPM (Words Per Minute)
    const wordsTyped = correctChars / 5; // Standard: 5 characters = 1 word
    const wpm = timeElapsed > 0 ? Math.round((wordsTyped / timeElapsed) * 60) : 0;
    
    // Calculate accuracy
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

    return {
      wpm,
      accuracy,
      totalChars,
      correctChars,
      incorrectChars,
      timeElapsed: Math.round(timeElapsed)
    };
  }, [userInput, text, startTime, stats]);

  // Start the typing test
  const startTest = useCallback(() => {
    setIsActive(true);
    setStartTime(Date.now());
    setTimeRemaining(settings.timeLimit);
    inputRef.current?.focus();

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsCompleted(true);
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [settings.timeLimit]);

  // Reset the test
  const resetTest = useCallback(() => {
    setCurrentPosition(0);
    setUserInput('');
    setIsActive(false);
    setIsCompleted(false);
    setStartTime(null);
    setTimeRemaining(settings.timeLimit);
    setStats({
      wpm: 0,
      accuracy: 0,
      totalChars: 0,
      correctChars: 0,
      incorrectChars: 0,
      timeElapsed: 0
    });

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [settings.timeLimit]);

  // Handle key press
  const handleKeyPress = useCallback((key: string) => {
    if (!isActive || isCompleted) return;

    if (key === 'Backspace') {
      if (userInput.length > 0) {
        setUserInput(prev => prev.slice(0, -1));
        setCurrentPosition(prev => Math.max(0, prev - 1));
      }
    } else if (key.length === 1) { // Regular character
      if (currentPosition < text.length) {
        setUserInput(prev => prev + key);
        setCurrentPosition(prev => prev + 1);

        // Check if test is completed
        if (currentPosition + 1 >= text.length) {
          setIsCompleted(true);
          setIsActive(false);
        }
      }
    }
  }, [isActive, isCompleted, currentPosition, text.length, userInput.length]);

  // Update stats in real-time
  useEffect(() => {
    if (isActive && startTime) {
      const newStats = calculateStats();
      setStats(newStats);
    }
  }, [userInput, isActive, startTime, calculateStats]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Generate test result when completed
  const getTestResult = useCallback((): TestResult => {
    const finalStats = calculateStats();
    return {
      id: Date.now().toString(),
      wpm: finalStats.wpm,
      accuracy: finalStats.accuracy,
      timeElapsed: finalStats.timeElapsed,
      totalChars: finalStats.totalChars,
      difficulty: settings.difficulty,
      category: settings.category,
      date: new Date().toISOString()
    };
  }, [calculateStats, settings]);

  return {
    currentPosition,
    userInput,
    isActive,
    isCompleted,
    timeRemaining,
    stats,
    characterStates: getCharacterStates(),
    startTest,
    resetTest,
    handleKeyPress,
    getTestResult,
    inputRef
  };
};
