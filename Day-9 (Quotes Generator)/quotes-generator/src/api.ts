import type { Quote } from './types';

const CACHE_KEY = 'quotes_cache_v1';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

type CacheShape = {
  fetchedAt: number;
  quotes: Quote[];
};

async function fetchFromTypeFit(): Promise<Quote[]> {
  const res = await fetch("https://api.api-ninjas.com/v1/quotes",
    {
      headers: {
        'X-Api-Key': `${import.meta.env.VITE_API_NINJAS_KEY}`, 
      },
    }
  );
  if (!res.ok) throw new Error('TypeFit fetch failed');
  const data = (await res.json()) as Array<{ quote: string; author: string | null }>;
  return data.map((q) => ({ text: q.quote, author: q.author }));
}

async function fetchFromQuotable(): Promise<Quote[]> {
  // small fallback sample: fetch 20 quotes via multiple requests
  const res = await fetch('https://programming-quotesapi.vercel.app/api/random');
  if (!res.ok) throw new Error('Quotable fetch failed');
  const json = await res.json();
  type QuotableResult = { quote: string; author: string | null };
  return (json.results || []).map((q: QuotableResult) => ({ text: q.quote, author: q.author || null }));
}

export async function getCachedQuotes(): Promise<Quote[]> {
  const raw = localStorage.getItem(CACHE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as CacheShape;
      if (Date.now() - parsed.fetchedAt < CACHE_TTL_MS && parsed.quotes?.length) {
        return parsed.quotes;
      }
    } catch {
      // ignore parse errors
    }
  }

  // fetch fresh
  let quotes: Quote[] = [];
  try {
    quotes = await fetchFromTypeFit();
    console.log(quotes)
  } catch {
    try {
      quotes = await fetchFromQuotable();
        console.log(quotes)
    } catch (err) {
      console.error('Both quote providers failed', err);
      quotes = [];
    }
  }

  if (quotes.length) {
    const payload: CacheShape = { fetchedAt: Date.now(), quotes };
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('Failed to save quotes to localStorage', err);
    }
  }

  return quotes;
}
