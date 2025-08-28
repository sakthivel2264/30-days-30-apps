/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import axios from 'axios';
import type { BattleResult } from '../types';
import { ProfileCard } from './ProfileCard';

const API_BASE = 'http://localhost:8000';


const extractGithubUsername = (input: string): string => {
  if (!input) return '';
  
  const trimmedInput = input.trim();
  
  // If it's already a username (no URL patterns), return as-is
  if (!trimmedInput.includes('/') && !trimmedInput.includes('.')) {
    return trimmedInput;
  }
  
  try {
    // Handle different GitHub URL formats
    const githubPatterns = [
      // https://github.com/username
      /^https?:\/\/github\.com\/([^\/\?#]+)\/?$/,
      // https://github.com/username/
      /^https?:\/\/github\.com\/([^\/\?#]+)\/$/,
      // github.com/username
      /^github\.com\/([^\/\?#]+)\/?$/,
      // Just username with github.com prefix
      /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\?#]+)(?:\/.*)?$/
    ];
    
    for (const pattern of githubPatterns) {
      const match = trimmedInput.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // If no pattern matches but contains github.com, try to extract username
    if (trimmedInput.includes('github.com')) {
      const urlParts = trimmedInput.split('/');
      const githubIndex = urlParts.findIndex(part => part.includes('github.com'));
      if (githubIndex !== -1 && urlParts[githubIndex + 1]) {
        return urlParts[githubIndex + 1];
      }
    }
    
    // Last resort: if it looks like a URL but doesn't match patterns, 
    // try to extract the last meaningful part
    if (trimmedInput.includes('/')) {
      const parts = trimmedInput.split('/').filter(part => part && part !== 'www');
      if (parts.length > 0) {
        return parts[parts.length - 1];
      }
    }
    
    // If all else fails, return the original input
    return trimmedInput;
  } catch (error) {
    // If any error occurs in parsing, return original input
    return trimmedInput;
  }
};

// Validation function to check if username is valid
const isValidGithubUsername = (username: string): boolean => {
  if (!username) return false;
  
  // GitHub username rules:
  // - May contain alphanumeric characters and single hyphens
  // - Cannot begin or end with a hyphen
  // - Maximum 39 characters
  const githubUsernameRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
  return githubUsernameRegex.test(username);
};

export const BattleArena: React.FC = () => {
  const [username1, setUsername1] = useState('');
  const [username2, setUsername2] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [error, setError] = useState('');

  const handleBattle = async () => {
    // Extract usernames from URLs or use as-is
    const extractedUsername1 = extractGithubUsername(username1);
    const extractedUsername2 = extractGithubUsername(username2);

    // Validation
    if (!extractedUsername1 || !extractedUsername2) {
      setError('Please enter both GitHub usernames or profile URLs');
      return;
    }

    if (extractedUsername1 === extractedUsername2) {
      setError('Please enter different GitHub profiles');
      return;
    }

    // Validate usernames
    if (!isValidGithubUsername(extractedUsername1)) {
      setError(`"${extractedUsername1}" is not a valid GitHub username`);
      return;
    }

    if (!isValidGithubUsername(extractedUsername2)) {
      setError(`"${extractedUsername2}" is not a valid GitHub username`);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post(`${API_BASE}/api/battle`, {
        username1: extractedUsername1,
        username2: extractedUsername2,
      });
      
      setResult(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Battle failed. Please check the usernames and try again.';
      
      // Provide more specific error messages
      if (err.response?.status === 404) {
        setError('One or both GitHub profiles not found. Please check the usernames.');
      } else if (err.response?.status === 403) {
        setError('GitHub API rate limit exceeded. Please try again later.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUsername1('');
    setUsername2('');
    setResult(null);
    setError('');
  };

  // Real-time username extraction for preview
  const getDisplayUsername = (input: string): string => {
    if (!input) return '';
    const extracted = extractGithubUsername(input);
    return extracted !== input ? `→ ${extracted}` : '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            GitHub Profile Battle
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            ⚔️ Compare GitHub profiles and discover who wins! ⚔️
          </p>
          <p className="text-gray-500">
            Powered by AI insights and comprehensive profile analysis
          </p>
          <div className="mt-4 text-sm text-gray-500 bg-blue-50 rounded-lg p-3 max-w-2xl mx-auto">
            💡 <strong>Tip:</strong> You can enter either GitHub usernames (e.g., "octocat") or full profile URLs (e.g., "https://github.com/octocat")
          </div>
        </div>

        {/* Battle Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First GitHub Username or URL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., octocat or https://github.com/octocat"
                    value={username1}
                    onChange={(e) => setUsername1(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={loading}
                  />
                  {getDisplayUsername(username1) && (
                    <p className="text-xs text-blue-600 mt-1">
                      {getDisplayUsername(username1)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Second GitHub Username or URL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., torvalds or https://github.com/torvalds"
                    value={username2}
                    onChange={(e) => setUsername2(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={loading}
                  />
                  {getDisplayUsername(username2) && (
                    <p className="text-xs text-blue-600 mt-1">
                      {getDisplayUsername(username2)}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleBattle}
                  disabled={loading || !username1.trim() || !username2.trim()}
                  className="flex-1 py-4 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                      </svg>
                      Battle in Progress...
                    </span>
                  ) : (
                    '⚔️ Start Battle!'
                  )}
                </button>
                
                {result && (
                  <button
                    onClick={handleReset}
                    className="py-4 px-6 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-all"
                  >
                    New Battle
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Battle Results */}
        {result && (
          <div className="space-y-8">
            {/* Winner Announcement */}
            <div className="text-center py-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl text-white">
              <h2 className="text-4xl font-bold mb-2">
                🏆 {result.winner} Wins! 🏆
              </h2>
              <p className="text-xl opacity-90">
                Score: {result.winner_analysis.score.total.toFixed(1)} vs {result.loser_analysis.score.total.toFixed(1)}
              </p>
            </div>

            {/* Profile Cards */}
            <div className="grid lg:grid-cols-2 gap-8">
              <ProfileCard 
                analysis={result.winner_analysis}
                isWinner={true}
              />
              <ProfileCard 
                analysis={result.loser_analysis}
                isWinner={false}
              />
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <span className="mr-3">🧠</span>
                AI Battle Insights
              </h3>
              <div className="grid gap-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                    <span className="text-blue-500 font-bold text-lg">💡</span>
                    <p className="text-gray-700 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-200">
                <h4 className="text-xl font-bold mb-4 text-green-800 flex items-center">
                  <span className="mr-2">🏆</span>
                  Tips for {result.winner}
                </h4>
                <ul className="space-y-3">
                  {result.recommendations.winner.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
                <h4 className="text-xl font-bold mb-4 text-blue-800 flex items-center">
                  <span className="mr-2">📈</span>
                  Growth Tips for {result.loser}
                </h4>
                <ul className="space-y-3">
                  {result.recommendations.loser.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-600 font-bold">→</span>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
