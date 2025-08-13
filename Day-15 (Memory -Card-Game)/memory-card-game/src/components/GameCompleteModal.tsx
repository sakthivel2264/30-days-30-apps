
import React from 'react';
import type { GameStats } from '../types';

interface GameCompleteModalProps {
  gameStats: GameStats;
  onNewGame: () => void;
  onMainMenu: () => void;
  isNewRecord: boolean;
}

const GameCompleteModal: React.FC<GameCompleteModalProps> = ({ 
  gameStats, 
  onNewGame, 
  onMainMenu, 
  isNewRecord 
}) => {
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Congratulations!
        </h2>
        
        {isNewRecord && (
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-lg mb-4 font-semibold">
            🏆 NEW RECORD! 🏆
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{gameStats.moves}</div>
            <div className="text-sm text-gray-600">Moves</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{formatTime(gameStats.timeElapsed)}</div>
            <div className="text-sm text-gray-600">Time</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{gameStats.score}</div>
            <div className="text-sm text-gray-600">Final Score</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{gameStats.bestScore}</div>
            <div className="text-sm text-gray-600">Best Score</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onNewGame}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-colors"
          >
            🔄 Play Again
          </button>
          <button
            onClick={onMainMenu}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 transition-colors"
          >
            🏠 Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCompleteModal;
