import React from 'react';
import type { ProfileAnalysis } from '../types';

interface ProfileCardProps {
  analysis: ProfileAnalysis;
  isWinner?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ analysis, isWinner }) => {
  const { profile, score, languages, top_repos } = analysis;

  return (
    <div className={`p-6 rounded-xl shadow-lg transition-all duration-300 ${
      isWinner 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 transform scale-105' 
        : 'bg-white border border-gray-200 hover:shadow-xl'
    }`}>
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <img
          src={profile.avatar_url}
          alt={profile.login}
          className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
        />
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-800">
            {profile.name || profile.login}
          </h3>
          <p className="text-gray-600 text-lg">@{profile.login}</p>
          {isWinner && (
            <div className="flex items-center mt-2">
              <span className="text-2xl">🏆</span>
              <span className="ml-2 text-green-600 font-bold text-lg">Winner!</span>
            </div>
          )}
        </div>
      </div>

      {/* Bio and Details */}
      <div className="space-y-2 mb-6">
        {profile.bio && (
          <p className="text-gray-700 italic">{profile.bio}</p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {profile.location && (
            <span className="flex items-center">
              <span className="mr-1">📍</span>
              {profile.location}
            </span>
          )}
          {profile.company && (
            <span className="flex items-center">
              <span className="mr-1">🏢</span>
              {profile.company}
            </span>
          )}
          {profile.blog && (
            <span className="flex items-center">
              <span className="mr-1">🔗</span>
              <a href={profile.blog} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Website
              </a>
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">{profile.public_repos}</div>
          <div className="text-sm text-gray-600">Repositories</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">{profile.followers}</div>
          <div className="text-sm text-gray-600">Followers</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-3xl font-bold text-yellow-600">{score.breakdown.stars}</div>
          <div className="text-sm text-gray-600">Total Stars</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-3xl font-bold text-green-600">{Object.keys(languages).length}</div>
          <div className="text-sm text-gray-600">Languages</div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total Score</span>
          <span className="text-2xl font-bold text-blue-600">{score.total.toFixed(1)}/100</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000" 
            style={{ width: `${Math.min(score.total, 100)}%` }}
          ></div>
        </div>
        
        <div className="space-y-2">
          <ScoreBar label="Activity" score={score.activity} max={25} color="bg-blue-500" />
          <ScoreBar label="Quality" score={score.quality} max={30} color="bg-green-500" />
          <ScoreBar label="Impact" score={score.impact} max={25} color="bg-yellow-500" />
          <ScoreBar label="Consistency" score={score.consistency} max={20} color="bg-purple-500" />
        </div>
      </div>

      {/* Top Languages */}
      <div className="mt-6">
        <h4 className="font-semibold mb-2">Top Languages</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(languages)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([lang, count]) => (
              <span key={lang} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                {lang} ({count})
              </span>
            ))}
        </div>
      </div>

      {/* Top Repositories */}
      <div className="mt-6">
        <h4 className="font-semibold mb-2">Top Repositories</h4>
        <div className="space-y-2">
          {top_repos.slice(0, 3).map((repo) => (
            <div key={repo.name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <span className="font-medium">{repo.name}</span>
                {repo.language && (
                  <span className="ml-2 text-sm text-gray-600">{repo.language}</span>
                )}
              </div>
              <span className="text-yellow-500">⭐ {repo.stargazers_count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ScoreBarProps {
  label: string;
  score: number;
  max: number;
  color: string;
}

const ScoreBar: React.FC<ScoreBarProps> = ({ label, score, max, color }) => (
  <div className="flex items-center space-x-3">
    <span className="text-sm w-20 font-medium">{label}</span>
    <div className="flex-1 bg-gray-200 rounded-full h-2">
      <div 
        className={`${color} h-2 rounded-full transition-all duration-1000`}
        style={{ width: `${(score / max) * 100}%` }}
      ></div>
    </div>
    <span className="text-sm w-12 text-right font-medium">{score.toFixed(1)}</span>
  </div>
);
