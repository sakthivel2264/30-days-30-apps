// src/components/ComplexityResult.tsx
import React from 'react';
import type { ComplexityResponse } from '../types/api';

interface ComplexityResultProps {
  result: ComplexityResponse;
  onReset: () => void;
}

const ComplexityResult: React.FC<ComplexityResultProps> = ({ result, onReset }) => {
  if (!result.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Analysis Failed</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{result.error || 'An unknown error occurred'}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={onReset}
                className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { prediction } = result;
  if (!prediction) return null;

  const getComplexityColor = (complexity: string) => {
    if (complexity.includes('O(1)')) return 'text-green-600 bg-green-100';
    if (complexity.includes('O(log')) return 'text-blue-600 bg-blue-100';
    if (complexity.includes('O(n)') && !complexity.includes('O(n²)')) return 'text-yellow-600 bg-yellow-100';
    if (complexity.includes('O(n²)')) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Complexity Analysis Results</h2>
        <button
          onClick={onReset}
          className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          New Analysis
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Time Complexity</h3>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(prediction.time_complexity)}`}>
            {prediction.time_complexity}
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Space Complexity</h3>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(prediction.space_complexity)}`}>
            {prediction.space_complexity}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-3">Explanation</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {prediction.explanation}
          </p>
        </div>
      </div>

      {prediction.suggestions.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-3">Optimization Suggestions</h3>
          <ul className="space-y-2">
            {prediction.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">{index + 1}</span>
                </div>
                <span className="ml-3 text-gray-700">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-sm text-gray-500">
        <div className="flex items-center">
          <span>Confidence Score: </span>
          <span className={`ml-1 font-medium ${getConfidenceColor(prediction.confidence_score)}`}>
            {(prediction.confidence_score * 100).toFixed(1)}%
          </span>
        </div>
        {result.processing_time && (
          <div>
            Processing Time: {result.processing_time}s
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplexityResult;
