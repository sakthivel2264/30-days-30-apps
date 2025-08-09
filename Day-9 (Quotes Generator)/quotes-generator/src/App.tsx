import React, { useEffect, useState } from 'react';
import { getCachedQuotes } from './api';
import type { Quote } from './types';
import { QuoteCard } from '@/components/QuotesCard';

const FAVORITES_KEY = 'quotes_favorites_v1';

function useFavorites() {
  const [favorites, setFavorites] = useState<Quote[]>(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      return raw ? JSON.parse(raw) as Quote[] : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // Ignore errors reading from localStorage
    }
  }, [favorites]);

  const toggleFavorite = (q: Quote) => {
    setFavorites((prev) => {
      const exists = prev.find((p) => p.text === q.text && p.author === q.author);
      if (exists) return prev.filter((p) => !(p.text === q.text && p.author === q.author));
      return [q, ...prev];
    });
  };

  const isFav = (q: Quote) => favorites.some((p) => p.text === q.text && p.author === q.author);

  return { favorites, toggleFavorite, isFav };
}

export default function App() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [current, setCurrent] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { favorites, toggleFavorite, isFav } = useFavorites();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getCachedQuotes()
      .then((q) => {
        if (!mounted) return;
        setQuotes(q);
        if (q.length) setCurrent(q[Math.floor(Math.random() * q.length)]);
        setError(q.length ? null : 'No quotes available');
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setError('Failed to load quotes');
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const handleNewQuote = () => {
    if (!quotes.length) return;
    console.log('Fetching new quote');
    const next = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrent(next);
  };

  const handleCopy = async () => {
    if (!current) return;
    try {
      await navigator.clipboard.writeText(`"${current.text}" — ${current.author ?? 'Unknown'}`);
      // light UI feedback
      alert('Copied to clipboard!');
    } catch {
      alert('Unable to copy. Try manually selecting the text.');
    }
  };

  const handleToggleFavorite = (q: Quote) => toggleFavorite(q);

  const favoritesCount = favorites.length;

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full max-w-4xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quote Generator</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Daily inspiration — powered by public APIs + local cache</p>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-200">
            Favorites: <span className="font-medium">{favoritesCount}</span>
          </div>
        </header>

        <main className="space-y-6">
          {loading && <div className="text-center text-gray-500">Loading quotes...</div>}
          {error && <div className="text-center text-red-500">{error}</div>}

          {current && (
            <QuoteCard
              quote={current}
              onCopy={handleCopy}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={isFav(current)}
            />
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleNewQuote}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              New Quote
            </button>

            <button
              onClick={() => {
                // clear cache to force refetch next load
                localStorage.removeItem('quotes_cache_v1');
                alert('Cache cleared. Reload the page to fetch fresh quotes.');
              }}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md"
            >
              Clear Cache
            </button>

            <button
              onClick={() => {
                if (!favorites.length) {
                  alert('No favorites yet.');
                  return;
                }
                const item = favorites[Math.floor(Math.random() * favorites.length)];
                setCurrent(item);
              }}
              className="px-4 py-2 bg-yellow-400 text-black rounded-md"
            >
              Show Random Favorite
            </button>
          </div>

          <section className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Favorites</h2>
            {favorites.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">No favorites yet — click Favorite on a quote.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {favorites.map((f, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded-md shadow">
                    <p className="text-sm text-gray-900 dark:text-gray-100">“{f.text}”</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-300">— {f.author ?? 'Unknown'}</span>
                      <button
                        onClick={() => setCurrent(f)}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
