import React from 'react';
import type { Quote } from '../types';

type Props = {
  quote: Quote;
  onCopy: () => void;
  onToggleFavorite: (q: Quote) => void;
  isFavorite: boolean;
};

export const QuoteCard: React.FC<Props> = ({ quote, onCopy, onToggleFavorite, isFavorite }) => {
  return (
    <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <p className="text-lg md:text-xl text-gray-800 dark:text-gray-100 leading-relaxed">
        “{quote.text}”
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          — {quote.author ?? 'Unknown'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-md hover:opacity-90"
            aria-label="Copy quote"
          >
            Copy
          </button>
          <button
            onClick={() => onToggleFavorite(quote)}
            className={`px-3 py-1 text-sm rounded-md ${isFavorite ? 'bg-yellow-400' : 'bg-gray-100 dark:bg-gray-700'}`}
            aria-label="Toggle favorite"
          >
            {isFavorite ? 'Unfavorite' : 'Favorite'}
          </button>
        </div>
      </div>
    </div>
  );
};
