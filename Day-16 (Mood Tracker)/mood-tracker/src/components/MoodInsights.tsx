import React from 'react';
import type { MoodInsight } from '../types';

interface MoodInsightsProps {
  insights: MoodInsight[];
  isLoading: boolean;
  onRefresh: () => void;
}

const MoodInsights: React.FC<MoodInsightsProps> = ({ insights, isLoading, onRefresh }) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return '📊';
      case 'trigger': return '🎯';
      case 'suggestion': return '💡';
      case 'achievement': return '🏆';
      default: return '✨';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'pattern': return 'from-blue-400 to-blue-600';
      case 'trigger': return 'from-orange-400 to-orange-600';
      case 'suggestion': return 'from-green-400 to-green-600';
      case 'achievement': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="insight-card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
          <span className="text-indigo-700 font-medium">
            AI is analyzing your mood patterns...
          </span>
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="insight-card text-center">
        <div className="py-8">
          <div className="text-4xl mb-4">🧠</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            AI insights coming soon!
          </h3>
          <p className="text-gray-600 mb-4">
            Keep logging your moods to unlock personalized insights and recommendations.
          </p>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Check for Insights
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🧠 AI-Powered Insights
        </h3>
        <button
          onClick={onRefresh}
          className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {insights.map((insight) => (
        <div
          key={insight.id}
          className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow animate-fade-in"
        >
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${getInsightColor(insight.type)}`}>
              <span className="text-white text-lg">
                {getInsightIcon(insight.type)}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">
                  {insight.title}
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                    {insight.type}
                  </span>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                    {Math.round(insight.confidence * 100)}%
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 text-sm mb-3">
                {insight.description}
              </p>
              
              {insight.suggestions && insight.suggestions.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    💫 Suggested Actions:
                  </p>
                  <ul className="space-y-1">
                    {insight.suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-700 flex items-start"
                      >
                        <span className="text-green-500 mr-2 mt-0.5">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MoodInsights;
