import React, { useState, useEffect } from 'react';
import { History, Trash2, ExternalLink, Clock } from 'lucide-react';
import type { ScrapeHistory as ScrapeHistoryType } from '../types';
import { getScrapeHistory, clearScrapeHistory } from '../utils/storage';

interface ScrapeHistoryProps {
  onSelectUrl: (url: string) => void;
}

const ScrapeHistory: React.FC<ScrapeHistoryProps> = ({ onSelectUrl }) => {
  const [history, setHistory] = useState<ScrapeHistoryType[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setHistory(getScrapeHistory());
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      clearScrapeHistory();
      setHistory([]);
    }
  };

  const displayedHistory = showAll ? history : history.slice(0, 5);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <History size={20} className="mr-2" />
          Recent Scrapes
        </h3>
        <button
          onClick={handleClearHistory}
          className="text-sm text-red-600 hover:text-red-700 flex items-center"
        >
          <Trash2 size={14} className="mr-1" />
          Clear All
        </button>
      </div>

      <div className="space-y-2">
        {displayedHistory.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
            onClick={() => onSelectUrl(item.url)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.title}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {item.url}
              </p>
              <div className="flex items-center mt-1">
                <Clock size={12} className="mr-1 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  item.success 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {item.success ? 'Success' : 'Failed'}
                </span>
              </div>
            </div>
            <ExternalLink size={14} className="text-gray-400 ml-2" />
          </div>
        ))}
      </div>

      {history.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm text-blue-600 hover:text-blue-700"
        >
          {showAll ? 'Show Less' : `Show All (${history.length})`}
        </button>
      )}
    </div>
  );
};

export default ScrapeHistory;
