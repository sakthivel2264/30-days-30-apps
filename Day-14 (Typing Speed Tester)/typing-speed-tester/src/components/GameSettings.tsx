import React from 'react';
import type { GameSettings } from '../types';

interface GameSettingsProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onGenerateText: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const GameSettingsComponent: React.FC<GameSettingsProps> = ({
  settings,
  onSettingsChange,
  onGenerateText,
  isLoading,
  disabled
}) => {
  const timeLimits = [30, 60, 120, 180];
  const difficulties = [
    { id: 'easy', name: 'Easy', description: 'Simple words and structures' },
    { id: 'medium', name: 'Medium', description: 'Moderate complexity' },
    { id: 'hard', name: 'Hard', description: 'Advanced vocabulary' }
  ];
  const categories = [
    { id: 'general', name: 'General', icon: '📝', description: 'Everyday topics' },
    { id: 'tech', name: 'Technology', icon: '💻', description: 'Tech and programming' },
    { id: 'literature', name: 'Literature', icon: '📚', description: 'Literary content' },
    { id: 'news', name: 'News', icon: '📰', description: 'Current events style' },
    { id: 'quotes', name: 'Quotes', icon: '💭', description: 'Inspirational quotes' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Test Settings</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Time Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Limit
          </label>
          <div className="grid grid-cols-2 gap-2">
            {timeLimits.map(time => (
              <button
                key={time}
                onClick={() => onSettingsChange({ ...settings, timeLimit: time })}
                disabled={disabled}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  settings.timeLimit === time
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {time}s
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty
          </label>
          <div className="space-y-2">
            {difficulties.map(difficulty => (
              <button
                key={difficulty.id}
                onClick={() => onSettingsChange({ 
                  ...settings, 
                  difficulty: difficulty.id as any 
                })}
                disabled={disabled}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  settings.difficulty === difficulty.id
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="font-medium">{difficulty.name}</div>
                <div className="text-xs opacity-80">{difficulty.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <div className="space-y-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => onSettingsChange({ 
                  ...settings, 
                  category: category.id as any 
                })}
                disabled={disabled}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  settings.category === category.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center">
                  <span className="mr-2">{category.icon}</span>
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs opacity-80">{category.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={onGenerateText}
          disabled={isLoading || disabled}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
            isLoading || disabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generating New Text...
            </div>
          ) : (
            '🎯 Generate New Text'
          )}
        </button>
      </div>
    </div>
  );
};

export default GameSettingsComponent;
