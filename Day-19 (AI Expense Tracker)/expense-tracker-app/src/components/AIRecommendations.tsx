// src/components/AIRecommendations.tsx
import React from 'react';
import type { AIRecommendation } from '../types';
import { Brain, AlertTriangle, TrendingDown, Target, Lightbulb } from 'lucide-react';

interface AIRecommendationsProps {
  recommendations: AIRecommendation[];
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ recommendations }) => {
  const getIcon = (type: AIRecommendation['type']) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'saving': return TrendingDown;
      case 'budget': return Target;
      default: return Lightbulb;
    }
  };

  const getColor = (priority: AIRecommendation['priority']) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getTextColor = (priority: AIRecommendation['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-800';
      case 'medium': return 'text-yellow-800';
      default: return 'text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">AI-Powered Insights</h3>
          </div>
          
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((recommendation, index) => {
                const Icon = getIcon(recommendation.type);
                return (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${getColor(recommendation.priority)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Icon className={`h-5 w-5 ${getTextColor(recommendation.priority)}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-semibold uppercase tracking-wide ${getTextColor(recommendation.priority)}`}>
                            {recommendation.type}
                          </span>
                          <span className={`text-xs font-medium ${getTextColor(recommendation.priority)}`}>
                            {recommendation.priority} priority
                          </span>
                        </div>
                        <p className={`text-sm ${getTextColor(recommendation.priority)}`}>
                          {recommendation.message}
                        </p>
                        {recommendation.actionable && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-gray-800">
                              Actionable
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-sm font-medium text-gray-900">No insights available yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Add some expenses to get personalized AI recommendations for better financial management.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h4 className="text-lg leading-6 font-medium text-gray-900 mb-4">Financial Tips</h4>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Track Daily</p>
                <p className="text-sm text-gray-600">Log expenses immediately to avoid forgetting small purchases.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Target className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Set Category Budgets</p>
                <p className="text-sm text-gray-600">Allocate specific amounts for each spending category.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <TrendingDown className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Review Monthly</p>
                <p className="text-sm text-gray-600">Analyze your spending patterns at the end of each month.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;
