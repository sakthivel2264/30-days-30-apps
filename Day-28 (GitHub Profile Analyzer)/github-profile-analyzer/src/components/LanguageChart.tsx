import React from 'react';
import type { LanguageStats } from '../types/github.types';
import { getLanguageColor } from '../utils/helpers';

interface LanguageChartProps {
  languageStats: LanguageStats;
}

const LanguageChart: React.FC<LanguageChartProps> = ({ languageStats }) => {
  const sortedLanguages = Object.entries(languageStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const totalRepos = Object.values(languageStats).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Top Languages</h3>
      
      <div className="space-y-4">
        {sortedLanguages.map(([language, count]) => {
          const percentage = (count / totalRepos) * 100;
          return (
            <div key={language} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getLanguageColor(language) }}
              ></div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{language}</span>
                  <span className="text-sm text-gray-500">
                    {count} repos ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: getLanguageColor(language),
                      width: `${percentage}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageChart;
