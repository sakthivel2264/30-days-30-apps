import React from 'react';
import type { MoodLevel } from '../types';

interface MoodButtonProps {
  mood: MoodLevel;
  isSelected: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const MoodButton: React.FC<MoodButtonProps> = ({ 
  mood, 
  isSelected, 
  onClick, 
  size = 'md' 
}) => {
  const moodConfig = {
    excellent: { emoji: '😄', label: 'Excellent', color: 'mood-excellent' },
    good: { emoji: '😊', label: 'Good', color: 'mood-good' },
    okay: { emoji: '😐', label: 'Okay', color: 'mood-okay' },
    bad: { emoji: '😞', label: 'Bad', color: 'mood-bad' },
    terrible: { emoji: '😢', label: 'Terrible', color: 'mood-terrible' }
  };

  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl'
  };

  const config = moodConfig[mood];
  
  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]} 
        rounded-full border-2 transition-all duration-200 
        flex flex-col items-center justify-center font-semibold
        hover:scale-105 hover:shadow-md
        ${isSelected 
          ? `mood-button-active border-${config.color} bg-${config.color} bg-opacity-20` 
          : 'border-gray-300 bg-white hover:border-gray-400'
        }
      `}
      style={{
        backgroundColor: isSelected ? `var(--color-${config.color})20` : undefined,
        borderColor: isSelected ? `var(--color-${config.color})` : undefined
      }}
    >
      <span className="block">{config.emoji}</span>
      <span className="text-xs mt-1">{config.label}</span>
    </button>
  );
};

export default MoodButton;
