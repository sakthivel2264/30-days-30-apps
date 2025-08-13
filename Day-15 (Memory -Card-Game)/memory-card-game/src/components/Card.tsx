import React from 'react';
import type { Card as CardType } from '../types';

interface CardProps {
  card: CardType;
  onClick: () => void;
  isDisabled: boolean;
}

const Card: React.FC<CardProps> = ({ card, onClick, isDisabled }) => {
  const handleClick = () => {
    if (!isDisabled && !card.isMatched && !card.isFlipped) {
      onClick();
    }
  };

  return (
    <div 
      className={`relative w-20 h-20 md:w-24 md:h-24 cursor-pointer transition-transform duration-500 ${
        card.isFlipped || card.isMatched ? '[transform:rotateY(180deg)]' : ''
      } ${card.isMatched ? 'animate-bounce-in' : ''}`}
      style={{ transformStyle: 'preserve-3d' }}
      onClick={handleClick}
    >
      {/* Card Back */}
      <div 
        className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
        style={{ backfaceVisibility: 'hidden' }}
      >
        <div className="text-white text-2xl font-bold">?</div>
      </div>
      
      {/* Card Front */}
      <div 
        className={`absolute inset-0 rounded-lg flex flex-col items-center justify-center shadow-lg transition-colors ${
          card.isMatched 
            ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' 
            : 'bg-white text-gray-800 border-2 border-gray-200'
        }`}
        style={{ 
          backfaceVisibility: 'hidden', 
          transform: 'rotateY(180deg)' 
        }}
      >
        <div className="text-2xl md:text-3xl mb-1">{card.emoji}</div>
        <div className="text-xs md:text-sm font-medium text-center px-1 leading-tight">
          {card.content}
        </div>
      </div>
    </div>
  );
};

export default Card;
