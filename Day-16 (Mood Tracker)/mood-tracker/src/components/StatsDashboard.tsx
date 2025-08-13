import React from 'react';
import type { MoodPattern } from '../types';

interface StatsDashboardProps {
  pattern: MoodPattern;
  currentStreak: number;
  totalEntries: number;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({
  pattern,
  currentStreak,
  totalEntries
}) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 bg-green-50';
      case 'declining': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getMoodEmoji = (mood: string) => {
    const emojis: Record<string, string> = {
      excellent: '😄',
      good: '😊',
      okay: '😐',
      bad: '😞',
      terrible: '😢'
    };
    return emojis[mood] || '😐';
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: string;
    subtitle?: string;
    colorClass?: string;
  }> = ({ title, value, icon, subtitle, colorClass = 'text-blue-600' }) => (
    <div className="mood-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className={`text-2xl font-bold ${colorClass}`}>
        {value}
      </div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        📊 Your Mood Statistics
      </h3>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Current Streak"
          value={`${currentStreak} days`}
          icon="🔥"
          subtitle="Keep it up!"
          colorClass="text-orange-600"
        />
        
        <StatCard
          title="Total Entries"
          value={totalEntries}
          icon="📝"
          subtitle="Logged moods"
          colorClass="text-blue-600"
        />
        
        <StatCard
          title="Average Mood"
          value={pattern.averageMood.toFixed(1)}
          icon={getMoodEmoji(pattern.mostCommonMood)}
          subtitle="Out of 5.0"
          colorClass="text-green-600"
        />
        
        <StatCard
          title="Mood Trend"
          value={pattern.trend}
          icon={getTrendIcon(pattern.trend)}
          subtitle="Recent direction"
          colorClass={getTrendColor(pattern.trend).split(' ')[0]}
        />
      </div>

      {/* Detailed Stats */}
      <div className="mood-card p-6">
        <h4 className="font-semibold text-gray-800 mb-4">
          📈 Pattern Analysis
        </h4>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">
                Most Common Mood
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-xl">{getMoodEmoji(pattern.mostCommonMood)}</span>
                <span className="capitalize font-semibold text-gray-800">
                  {pattern.mostCommonMood}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">
                Best Day Recently
              </span>
              <span className="font-semibold text-green-600">
                {pattern.bestDay || 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Challenging Day
              </span>
              <span className="font-semibold text-red-600">
                {pattern.worstDay || 'N/A'}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">
                Current Streak Type
              </span>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                pattern.streaks.type === 'positive' 
                  ? 'bg-green-100 text-green-800'
                  : pattern.streaks.type === 'negative'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {pattern.streaks.type}
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">
                Longest Streak
              </span>
              <span className="font-semibold text-purple-600">
                {pattern.streaks.longest} days
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Trend Direction
              </span>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTrendColor(pattern.trend)}`}>
                {getTrendIcon(pattern.trend)} {pattern.trend}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
