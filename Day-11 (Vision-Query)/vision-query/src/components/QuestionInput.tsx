
// components/QuestionInput.tsx
import React, { type KeyboardEvent } from 'react';

interface QuestionInputProps {
  question: string;
  onQuestionChange: (question: string) => void;
  onSubmit: () => void;
  loading: boolean;
  disabled: boolean;
}

export const QuestionInput: React.FC<QuestionInputProps> = ({
  question,
  onQuestionChange,
  onSubmit,
  loading,
  disabled
}) => {
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !disabled) {
      onSubmit();
    }
  };

  return (
    <div className="mb-6">
      <div className="flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          placeholder="Ask anything about this image..."
          onKeyPress={handleKeyPress}
          disabled={disabled}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
        />
        <button
          onClick={onSubmit}
          disabled={disabled || !question.trim()}
          className={`px-6 py-3 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            disabled || !question.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
          }`}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Analyzing...</span>
            </div>
          ) : (
            'Ask'
          )}
        </button>
      </div>
    </div>
  );
};
