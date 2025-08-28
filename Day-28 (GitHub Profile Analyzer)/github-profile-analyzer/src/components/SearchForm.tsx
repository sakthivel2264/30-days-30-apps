import React, { useState } from 'react';

interface SearchFormProps {
  onSearch: (username: string) => void;
  loading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading }) => {
  const [input, setInput] = useState('');

  const extractUsername = (input: string): string => {
    // Remove any leading/trailing whitespace
    const trimmedInput = input.trim();
    
    // Regex pattern to match GitHub URLs and extract username
    const githubUrlPattern = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})/i;
    
    const match = trimmedInput.match(githubUrlPattern);
    
    if (match && match[1]) {
      // Return the extracted username from URL
      return match[1];
    }
    
    // If it's not a URL, assume it's a direct username and clean it
    return trimmedInput.replace(/^@/, ''); // Remove @ if present
  };

  const validateInput = (input: string): boolean => {
    const username = extractUsername(input);
    
    // GitHub username validation rules:
    // - 1-39 characters
    // - alphanumeric and hyphens only
    // - cannot start or end with hyphen
    // - cannot have consecutive hyphens
    const usernamePattern = /^[a-zA-Z0-9]([a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
    
    return usernamePattern.test(username);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) {
      return;
    }

    const username = extractUsername(input);
    
    if (validateInput(input)) {
      onSearch(username);
    } else {
      // You could add error handling here
      alert('Please enter a valid GitHub username or URL');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Preview the extracted username
  const previewUsername = input.trim() ? extractUsername(input) : '';
  const isValidInput = input.trim() ? validateInput(input) : true;

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
        <div className="flex-1">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Enter GitHub username or URL (e.g., sakthivel2264 or https://github.com/sakthivel2264)"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors
                       ${isValidInput 
                         ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                         : 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                       }`}
            disabled={loading}
          />
          
          {/* Preview extracted username */}
          {previewUsername && input.trim() !== previewUsername && (
            <div className="mt-2 text-sm text-gray-600">
              {isValidInput ? (
                <span className="text-green-600">
                  ✓ Will search for: <strong>{previewUsername}</strong>
                </span>
              ) : (
                <span className="text-red-600">
                  ✗ Invalid username format
                </span>
              )}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading || !input.trim() || !isValidInput}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     whitespace-nowrap"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Searching...
            </div>
          ) : (
            'Search'
          )}
        </button>
      </div>
      
      {/* Help text */}
      <div className="text-center mt-4 text-sm text-gray-500">
        <p>
          Enter a GitHub username (e.g., <code className="bg-gray-100 px-1 rounded">sakthivel2264</code>) 
          or paste a GitHub profile URL
        </p>
      </div>
    </form>
  );
};

export default SearchForm;
