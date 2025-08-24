import React, { useState } from 'react';

interface SentimentResponse {
  text: string;
  label: string;
  score: number;
}

const SentimentAnalyzer: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [result, setResult] = useState<SentimentResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const analyzeSentiment = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze sentiment');
      }
      
      const data: SentimentResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError('Error analyzing sentiment. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (label: string): string => {
    return label === 'POSITIVE' 
      ? 'text-green-600 bg-green-50 border-green-200' 
      : 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Sentiment Analysis
      </h1>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
            Enter text to analyze:
          </label>
          <textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message here..."
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
          />
        </div>
        
        <button
          onClick={analyzeSentiment}
          disabled={loading || !text.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing...
            </div>
          ) : (
            'Analyze Sentiment'
          )}
        </button>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}
        
        {result && (
          <div className="mt-6 p-4 border rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Results:</h3>
            <div className="space-y-2">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSentimentColor(result.label)}`}>
                Sentiment: {result.label}
              </div>
              <div className="text-gray-600">
                <span className="font-medium">Confidence:</span> {(result.score * 100).toFixed(2)}%
              </div>
              <div className="mt-2">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${result.label === 'POSITIVE' ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${result.score * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentAnalyzer;
