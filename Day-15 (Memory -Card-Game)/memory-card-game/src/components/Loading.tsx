import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <div className="animate-spin text-6xl mb-4">🧠</div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Generating Your Game...
        </h2>
        <p className="text-gray-600 mb-4">
          AI is creating unique cards for your memory challenge!
        </p>
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
