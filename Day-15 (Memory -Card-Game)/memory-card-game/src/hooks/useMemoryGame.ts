
import { useState, useEffect, useCallback } from 'react';
import type { Card, GameStats, GameSettings } from '../types';
import { OpenRouterService } from '../services/openRouterService';

const DIFFICULTY_SETTINGS = {
  easy: { cardCount: 8, timeBonus: 1000 },
  medium: { cardCount: 12, timeBonus: 1500 },
  hard: { cardCount: 16, timeBonus: 2000 }
};

export const useMemoryGame = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    moves: 0,
    matches: 0,
    timeElapsed: 0,
    score: 0,
    bestScore: parseInt(localStorage.getItem('memoryGameBestScore') || '0')
  });
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    difficulty: 'easy',
    theme: 'animals',
    cardCount: 8
  });
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'completed' | 'loading'>('menu');
  const [startTime, setStartTime] = useState<number>(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setGameStats(prev => ({
          ...prev,
          timeElapsed: Date.now() - startTime
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, startTime]);

  // Generate cards using AI
  const generateCards = useCallback(async (theme: string, difficulty: string) => {
    setGameState('loading');
    try {
      const cardCount = DIFFICULTY_SETTINGS[difficulty as keyof typeof DIFFICULTY_SETTINGS].cardCount;
      const generatedTheme = await OpenRouterService.generateThemeCards(theme, cardCount);
      
      const gameCards: Card[] = [];
      generatedTheme.cards.forEach((cardData, index) => {
        const pairId = `pair-${index}`;
        // Create two matching cards for each pair
        gameCards.push(
          {
            id: `${pairId}-1`,
            content: cardData.content,
            emoji: cardData.emoji,
            pairId,
            isFlipped: false,
            isMatched: false,
            category: theme
          },
          {
            id: `${pairId}-2`,
            content: cardData.content,
            emoji: cardData.emoji,
            pairId,
            isFlipped: false,
            isMatched: false,
            category: theme
          }
        );
      });

      // Shuffle cards
      const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
      setCards(shuffledCards);
      return shuffledCards;
    } catch (error) {
      console.error('Failed to generate cards:', error);
      throw error;
    }
  }, []);

  // Start new game
  const startGame = useCallback(async (theme: string, difficulty: string) => {
    try {
      setGameSettings({
        theme: theme as any,
        difficulty: difficulty as any,
        cardCount: DIFFICULTY_SETTINGS[difficulty as keyof typeof DIFFICULTY_SETTINGS].cardCount
      });
      
      await generateCards(theme, difficulty);
      
      setGameStats({
        moves: 0,
        matches: 0,
        timeElapsed: 0,
        score: 0,
        bestScore: parseInt(localStorage.getItem('memoryGameBestScore') || '0')
      });
      
      setFlippedCards([]);
      setStartTime(Date.now());
      setGameState('playing');
    } catch (error) {
      console.error('Failed to start game:', error);
      setGameState('menu');
    }
  }, [generateCards]);

  // Handle card flip
  const flipCard = useCallback((cardId: string) => {
    if (gameState !== 'playing' || flippedCards.length >= 2) return;

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstCardId);
      const secondCard = cards.find(c => c.id === secondCardId);

      setGameStats(prev => ({ ...prev, moves: prev.moves + 1 }));

      setTimeout(() => {
        if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
          // Match found
          setCards(prev => prev.map(c => 
            c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c
          ));
          
          setGameStats(prev => {
            const newMatches = prev.matches + 1;
            const timeBonus = DIFFICULTY_SETTINGS[gameSettings.difficulty].timeBonus;
            const scoreIncrease = Math.max(100 - Math.floor(prev.timeElapsed / 1000), 10) + timeBonus;
            
            return {
              ...prev,
              matches: newMatches,
              score: prev.score + scoreIncrease
            };
          });

          // Check if game is completed
          if (gameStats.matches + 1 === gameSettings.cardCount) {
            setGameState('completed');
            const finalScore = gameStats.score + Math.max(100 - Math.floor(gameStats.timeElapsed / 1000), 10);
            if (finalScore > gameStats.bestScore) {
              localStorage.setItem('memoryGameBestScore', finalScore.toString());
              setGameStats(prev => ({ ...prev, bestScore: finalScore }));
            }
          }
        } else {
          // No match - flip cards back
          setCards(prev => prev.map(c => 
            newFlippedCards.includes(c.id) ? { ...c, isFlipped: false } : c
          ));
        }
        setFlippedCards([]);
      }, 1000);
    }
  }, [cards, flippedCards, gameState, gameStats, gameSettings]);

  const resetGame = useCallback(() => {
    setGameState('menu');
    setCards([]);
    setFlippedCards([]);
    setGameStats(prev => ({
      moves: 0,
      matches: 0,
      timeElapsed: 0,
      score: 0,
      bestScore: prev.bestScore
    }));
  }, []);

  return {
    cards,
    gameStats,
    gameSettings,
    gameState,
    flippedCards,
    startGame,
    flipCard,
    resetGame
  };
};
