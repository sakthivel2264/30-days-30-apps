import React from 'react';
import type { PersonalBest } from '../types';

interface PersonalBestsProps {
  personalBests: PersonalBest[];
  overallBest: PersonalBest | null;
}

const PersonalBests: React.FC<PersonalBestsProps> = ({ personalBests, overallBest }) => {
  if (personalBests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🏆 Personal Bests</h2>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📈</div>
          <p>Complete a typing test to see your personal bests!</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      general: '📝',
      tech: '💻',
      literature: '📚',
      news: '📰',
      quotes: '💭'
    };
    return icons[category] || '📝';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">🏆 Personal Bests</h2>
      
      {overallBest && (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">🏆 Overall Best</h3>
              <p className="text-yellow-100 capitalize">
                {getCategoryIcon(overallBest.category)} {overallBest.category} • {overallBest.difficulty}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{overallBest.wpm} WPM</div>
              <div className="text-yellow-100">{overallBest.accuracy}% accuracy</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {personalBests
          .sort((a, b) => b.wpm - a.wpm)
          .map((best, index) => (
            <div
              key={`${best.difficulty}-${best.category}`}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getCategoryIcon(best.category)}</div>
                <div>
                  <div className="font-semibold text-gray-800 capitalize">
                    {best.category}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {best.difficulty} • {formatDate(best.date)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">{best.wpm} WPM</div>
                <div className="text-sm text-gray-600">{best.accuracy}% accuracy</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default PersonalBests;
