import React from 'react';
import SentimentAnalyzer from './components/SentimentAnalyzer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 py-8">
      <div className="container mx-auto px-4">
        <SentimentAnalyzer />
      </div>
    </div>
  );
};

export default App;
