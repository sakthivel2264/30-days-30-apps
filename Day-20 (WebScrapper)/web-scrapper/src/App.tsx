import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import UrlInput from './components/UrlInput';
import ScrapeResults from './components/ScrapeResults';
import ScrapeHistory from './components/ScrapeHistory';
import type { ScrapeData, ScrapeOptions } from './types';
import { scrapeUrl } from './utils/firecrawl';
import { addToScrapeHistory } from './utils/storage';

function App() {
  const [scrapeData, setScrapeData] = useState<ScrapeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleScrape = async (url: string, options: ScrapeOptions) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setScrapeData(null);

    try {
      const data = await scrapeUrl(url, options);
      setScrapeData(data);
      setSuccess('Website scraped successfully!');
      
      // Add to history
      addToScrapeHistory({
        url,
        title: data.title || 'Untitled',
        timestamp: data.timestamp,
        success: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      // Add failed attempt to history
      addToScrapeHistory({
        url,
        title: 'Failed Scrape',
        timestamp: new Date().toISOString(),
        success: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFromHistory = (url: string) => {
    // Auto-fill the URL in the input (you'd need to pass this to UrlInput component)
    // For now, we'll just trigger a new scrape
    handleScrape(url, {
      formats: ['markdown'],
      onlyMainContent: true,
      waitFor: 3000,
    });
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  Web Scraper
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="text-green-600 mr-2" size={20} />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="text-red-600 mr-2" size={20} />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input and History */}
          <div className="lg:col-span-1">
            <UrlInput onScrape={handleScrape} loading={loading} />
            <ScrapeHistory onSelectUrl={handleSelectFromHistory} />
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            {loading && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Scraping website...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
              </div>
            )}

            <ScrapeResults data={scrapeData} />

            {!scrapeData && !loading && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3m9 9v-9a9 9 0 00-9-9" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to scrape
                </h3>
                <p className="text-gray-600">
                  Enter a website URL to start scraping content, links, and taking screenshots.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
