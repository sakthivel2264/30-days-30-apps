import React, { useState } from 'react';

interface GameMenuProps {
  onStartGame: (theme: string, difficulty: string) => void;
  bestScore: number;
}

const GameMenu: React.FC<GameMenuProps> = ({ onStartGame, bestScore }) => {
  const [selectedTheme, setSelectedTheme] = useState('animals');
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');

  const themes = [
    { id: 'animals', name: 'Animals', emoji: '🐾', description: 'Cute animals from around the world' },
    { id: 'food', name: 'Food', emoji: '🍕', description: 'Delicious dishes and treats' },
    { id: 'tech', name: 'Technology', emoji: '💻', description: 'Modern gadgets and devices' },
    { id: 'space', name: 'Space', emoji: '🚀', description: 'Planets, stars and cosmic objects' },
    { id: 'nature', name: 'Nature', emoji: '🌿', description: 'Beautiful natural elements' }
  ];

  const difficulties = [
    { id: 'easy', name: 'Easy', cards: 8, description: '4x2 grid' },
    { id: 'medium', name: 'Medium', cards: 12, description: '4x3 grid' },
    { id: 'hard', name: 'Hard', cards: 16, description: '4x4 grid' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          🧠 Memory Game
        </h1>
        <p className="text-lg text-gray-600">
          Test your memory by matching pairs of cards powered by AI!
        </p>
        {bestScore > 0 && (
          <div className="mt-4 text-xl font-semibold text-yellow-600">
            🏆 Best Score: {bestScore}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
        {/* Theme Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Choose a Theme</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {themes.map(theme => (
              <div
                key={theme.id}
                className={`cursor-pointer rounded-lg p-4 text-center transition-all ${
                  selectedTheme === theme.id
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedTheme(theme.id)}
              >
                <div className="text-3xl mb-2">{theme.emoji}</div>
                <div className="font-semibold mb-1">{theme.name}</div>
                <div className="text-sm opacity-80">{theme.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Choose Difficulty</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {difficulties.map(difficulty => (
              <div
                key={difficulty.id}
                className={`cursor-pointer rounded-lg p-4 text-center transition-all ${
                  selectedDifficulty === difficulty.id
                    ? 'bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedDifficulty(difficulty.id)}
              >
                <div className="font-semibold text-lg mb-1">{difficulty.name}</div>
                <div className="text-sm opacity-80 mb-2">{difficulty.cards} cards</div>
                <div className="text-sm opacity-80">{difficulty.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={() => onStartGame(selectedTheme, selectedDifficulty)}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-bold text-xl hover:from-orange-600 hover:to-red-600 transition-colors shadow-lg transform hover:scale-105"
          >
            🎮 Start Game
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">How to Play</h3>
        <ul className="text-gray-600 space-y-2">
          <li>• Click on cards to flip them and reveal the content</li>
          <li>• Find matching pairs by remembering where each card is located</li>
          <li>• Complete all pairs with the fewest moves and fastest time for a higher score</li>
          <li>• AI generates unique content for each theme, making every game fresh!</li>
        </ul>
      </div>
    </div>
  );
};

export default GameMenu;
