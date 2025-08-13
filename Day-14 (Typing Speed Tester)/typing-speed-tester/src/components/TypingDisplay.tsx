import React, { useRef, useEffect } from 'react';
import type { CharacterState } from '../types';

interface TypingDisplayProps {
  characterStates: CharacterState[];
  currentPosition: number;
}

const TypingDisplay: React.FC<TypingDisplayProps> = ({ characterStates, currentPosition }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);

  // Auto-scroll to current position
  useEffect(() => {
    if (currentCharRef.current && containerRef.current) {
      const container = containerRef.current;
      const currentChar = currentCharRef.current;
      const containerRect = container.getBoundingClientRect();
      const charRect = currentChar.getBoundingClientRect();

      // Scroll if current character is out of view
      if (charRect.bottom > containerRect.bottom || charRect.top < containerRect.top) {
        currentChar.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentPosition]);

  const getCharacterClassName = (state: CharacterState, index: number) => {
    const baseClass = 'text-2xl font-mono leading-relaxed transition-all duration-150';
    
    switch (state.status) {
      case 'correct':
        return `${baseClass} char-correct`;
      case 'incorrect':
        return `${baseClass} char-incorrect`;
      case 'current':
        return `${baseClass} char-current`;
      default:
        return `${baseClass} text-gray-600`;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="typing-text bg-white p-8 rounded-lg border-2 border-gray-200 shadow-sm max-h-80 overflow-y-auto focus-within:border-blue-400 transition-colors"
      style={{ lineHeight: '2.5' }}
    >
      <div className="select-none">
        {characterStates.map((charState, index) => (
          <span
            key={index}
            ref={index === currentPosition ? currentCharRef : null}
            className={getCharacterClassName(charState, index)}
          >
            {charState.char === ' ' ? '\u00A0' : charState.char}
            {index === currentPosition && (
              <span className="typing-cursor inline-block w-0.5 h-8 bg-blue-500 ml-px"></span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TypingDisplay;
