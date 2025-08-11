// components/SuggestedQuestions.tsx
import React from 'react';

interface SuggestedQuestionsProps {
  questions: string[];
  onQuestionSelect: (question: string) => void;
  disabled?: boolean;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  questions,
  onQuestionSelect,
  disabled = false
}) => {
  const handleQuestionClick = (question: string): void => {
    if (!disabled) {
      onQuestionSelect(question);
    }
  };

  return (
    <div className="my-6 p-4 bg-gray-50 rounded-lg">
      <h4 className="text-base font-semibold text-gray-800 mb-4 m-0">
        Quick Questions:
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => handleQuestionClick(question)}
            disabled={disabled}
            className={`
              px-4 py-3 bg-white border border-gray-300 rounded-md cursor-pointer text-left text-sm transition-all duration-200 text-gray-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${disabled 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60' 
                : 'hover:bg-blue-50 hover:border-blue-400 hover:-translate-y-0.5 active:translate-y-0'
              }
            `}
            title={question}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};
