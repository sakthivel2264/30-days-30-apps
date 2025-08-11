// components/ConversationHistory.tsx
import React from 'react';
import type { ConversationEntry } from '../types';

interface ConversationHistoryProps {
  conversations: ConversationEntry[];
  onExport: () => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  conversations,
  onExport
}) => {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString();
  };

  if (conversations.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 m-0">
          Conversation ({conversations.length} questions)
        </h3>
        <button 
          onClick={onExport}
          className="px-4 py-2 bg-blue-600 text-white border-none rounded-md cursor-pointer text-sm font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          title="Export conversation as JSON"
        >
          Export
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-6">
        {conversations.map((entry, index) => (
          <div key={entry.id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-3 text-sm text-gray-600">
              <span className="font-bold text-blue-600">
                #{index + 1}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(entry.timestamp)} at {formatTime(entry.timestamp)}
              </span>
            </div>
            
            <div className="mb-3">
              <div className="font-bold text-blue-600 mb-1 text-sm">
                Question:
              </div>
              <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded text-gray-800 leading-relaxed">
                {entry.question}
              </div>
            </div>
            
            <div>
              <div className="font-bold text-green-600 mb-1 text-sm">
                Answer:
              </div>
              <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded text-gray-800 leading-relaxed">
                {entry.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
