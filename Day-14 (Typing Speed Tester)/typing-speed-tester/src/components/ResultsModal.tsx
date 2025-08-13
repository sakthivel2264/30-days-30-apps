import React from 'react';
import type { TestResult, PersonalBest } from '../types';

interface ResultsModalProps {
  result: TestResult;
  isNewRecord: boolean;
  personalBest: PersonalBest | null;
  overallBest: PersonalBest | null;
  onClose: () => void;
  onNewTest: () => void;
}

const ResultsModal: React.FC<ResultsModalProps> = ({
  result,
  isNewRecord,
  personalBest,
  overallBest,
  onClose,
  onNewTest
}) => {
  const getPerformanceLevel = (wpm: number) => {
    if (wpm >= 70) return { level: 'Expert', color: 'text-purple-600', emoji: '🏆' };
    if (wpm >= 50) return { level: 'Advanced', color: 'text-blue-600', emoji: '⭐' };
    if (wpm >= 30) return { level: 'Intermediate', color: 'text-green-600', emoji: '👍' };
    return { level: 'Beginner', color: 'text-orange-600', emoji: '🌱' };
  };

  const performance = getPerformanceLevel(result.wpm);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 animate-fade-in">
        {isNewRecord && (
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">🎉</div>
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-lg font-bold">
              NEW PERSONAL RECORD!
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{performance.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Test Complete!</h2>
          <p className={`text-lg font-semibold ${performance.color}`}>
            {performance.level} Level
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{result.wpm}</div>
            <div className="text-sm text-gray-600">Words/Min</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{result.accuracy}%</div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="space-y-2 mb-6 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Time Elapsed:</span>
            <span className="font-semibold">{Math.floor(result.timeElapsed / 60)}:{(result.timeElapsed % 60).toString().padStart(2, '0')}</span>
          </div>
          <div className="flex justify-between">
            <span>Characters Typed:</span>
            <span className="font-semibold">{result.totalChars}</span>
          </div>
          <div className="flex justify-between">
            <span>Difficulty:</span>
            <span className="font-semibold capitalize">{result.difficulty}</span>
          </div>
          <div className="flex justify-between">
            <span>Category:</span>
            <span className="font-semibold capitalize">{result.category}</span>
          </div>
        </div>

        {/* Personal Best Comparison */}
        {personalBest && !isNewRecord && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Personal Best for this Category:</h3>
            <div className="flex justify-between text-sm">
              <span>Speed: <strong>{personalBest.wpm} WPM</strong></span>
              <span>Accuracy: <strong>{personalBest.accuracy}%</strong></span>
            </div>
          </div>
        )}

        {/* Overall Best */}
        {overallBest && (
          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">🏆 Your Overall Best:</h3>
            <div className="flex justify-between text-sm">
              <span>Speed: <strong>{overallBest.wpm} WPM</strong></span>
              <span>Category: <strong className="capitalize">{overallBest.category}</strong></span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onNewTest}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-colors"
          >
            🔄 Try Again
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            📊 View Stats
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;
