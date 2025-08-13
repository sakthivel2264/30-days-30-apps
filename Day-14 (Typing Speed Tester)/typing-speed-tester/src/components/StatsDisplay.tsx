import React from 'react';
import type { TypingStats, PersonalBest } from '../types';

interface StatsDisplayProps {
  stats: TypingStats;
  timeRemaining: number;
  isActive: boolean;
  personalBest: PersonalBest | null;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ 
  stats, 
  timeRemaining, 
  isActive,
  personalBest 
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    unit?: string;
    color: string;
    icon: string;
    isHighlight?: boolean;
  }> = ({ title, value, unit, color, icon, isHighlight }) => (
    <div className={`bg-white rounded-lg p-4 shadow-md border-l-4 ${color} ${
      isHighlight ? 'animate-bounce-subtle' : ''
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value}
            {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
          </p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Speed"
        value={stats.wpm}
        unit="WPM"
        color="border-blue-500"
        icon="⚡"
        isHighlight={personalBest && stats.wpm > personalBest.wpm}
      />
      
      <StatCard
        title="Accuracy"
        value={stats.accuracy}
        unit="%"
        color="border-green-500"
        icon="🎯"
        isHighlight={personalBest && stats.accuracy > personalBest.accuracy}
      />
      
      <StatCard
        title="Time"
        value={isActive ? formatTime(timeRemaining) : formatTime(stats.timeElapsed)}
        color="border-purple-500"
        icon="⏱️"
      />
      
      <StatCard
        title="Characters"
        value={`${stats.correctChars}/${stats.totalChars}`}
        color="border-orange-500"
        icon="📝"
      />
    </div>
  );
};

export default StatsDisplay;
