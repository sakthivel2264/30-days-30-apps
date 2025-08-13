
import React from 'react';
import Card from './Card';
import type { Card as CardType, GameStats } from '../types';

interface GameBoardProps {
  cards: CardType[];
  gameStats: GameStats;
  onCardClick: (cardId: string) => void;
  onReset: () => void;
  flippedCards: string[];
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  cards, 
  gameStats, 
  onCardClick, 
  onReset,
  flippedCards 
}) => {
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const gridCols = cards.length <= 8 ? 'grid-cols-4' : cards.length <= 12 ? 'grid-cols-4 md:grid-cols-6' : 'grid-cols-4 md:grid-cols-8';

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Stats Panel */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{gameStats.moves}</div>
            <div className="text-sm text-gray-600">Moves</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{gameStats.matches}</div>
            <div className="text-sm text-gray-600">Matches</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{formatTime(gameStats.timeElapsed)}</div>
            <div className="text-sm text-gray-600">Time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{gameStats.score}</div>
            <div className="text-sm text-gray-600">Score</div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="text-lg font-semibold text-gray-700">
            Best Score: <span className="text-yellow-600">{gameStats.bestScore}</span>
          </div>
        </div>
      </div>

      {/* Game Grid */}
      <div className={`grid ${gridCols} gap-3 md:gap-4 justify-items-center mb-6`}>
        {cards.map(card => (
          <Card
            key={card.id}
            card={card}
            onClick={() => onCardClick(card.id)}
            isDisabled={flippedCards.length >= 2}
          />
        ))}
      </div>

      {/* Control Button */}
      <div className="text-center">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-colors shadow-lg"
        >
          New Game
        </button>
      </div>
    </div>
  );
};

export default GameBoard;
