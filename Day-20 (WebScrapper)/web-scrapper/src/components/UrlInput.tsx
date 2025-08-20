/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Globe, Search, Settings } from 'lucide-react';
import type { ScrapeOptions } from '../types';

interface UrlInputProps {
  onScrape: (url: string, options: ScrapeOptions) => void;
  loading: boolean;
}

const UrlInput: React.FC<UrlInputProps> = ({ onScrape, loading }) => {
  const [url, setUrl] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<ScrapeOptions>({
    formats: ['markdown'],
    includeTags: ['title', 'meta', 'h1', 'h2', 'h3', 'p', 'a'],
    excludeTags: ['script', 'style', 'nav', 'footer'],
    onlyMainContent: true,
    waitFor: 3000,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !loading) {
      onScrape(url.trim(), options);
    }
  };

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Globe className="text-blue-600 mr-2" size={24} />
        <h2 className="text-xl font-semibold text-gray-900">Web Scraper</h2>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="ml-auto p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          title="Scraping Options"
        >
          <Settings size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website URL
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                url && !isValidUrl(url) ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
          </div>
          {url && !isValidUrl(url) && (
            <p className="mt-1 text-sm text-red-600">Please enter a valid URL</p>
          )}
        </div>

        {showOptions && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-gray-900">Scraping Options</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Formats
              </label>
              <div className="flex flex-wrap gap-2">
                {['markdown', 'html', 'screenshot'].map((format) => (
                  <label key={format} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.formats.includes(format as any)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setOptions(prev => ({
                            ...prev,
                            formats: [...prev.formats, format as any]
                          }));
                        } else {
                          setOptions(prev => ({
                            ...prev,
                            formats: prev.formats.filter(f => f !== format)
                          }));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 capitalize">{format}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.onlyMainContent}
                  onChange={(e) => setOptions(prev => ({
                    ...prev,
                    onlyMainContent: e.target.checked
                  }))}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Extract only main content
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wait Time (ms)
              </label>
              <input
                type="number"
                value={options.waitFor}
                onChange={(e) => setOptions(prev => ({
                  ...prev,
                  waitFor: parseInt(e.target.value) || 3000
                }))}
                min="1000"
                max="10000"
                step="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !url.trim() || !isValidUrl(url)}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Scraping...
            </div>
          ) : (
            <div className="flex items-center">
              <Search size={18} className="mr-2" />
              Scrape Website
            </div>
          )}
        </button>
      </form>
    </div>
  );
};

export default UrlInput;
