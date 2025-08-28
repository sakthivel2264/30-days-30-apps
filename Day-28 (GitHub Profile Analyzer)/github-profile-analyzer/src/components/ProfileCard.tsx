import React from 'react';
import type { GitHubUser } from '../types/github.types';
import { formatDate, formatNumber } from '../utils/helpers';

interface ProfileCardProps {
  user: GitHubUser;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <img
          src={user.avatar_url}
          alt={user.name || user.login}
          className="w-32 h-32 rounded-full border-4 border-gray-200"
        />
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user.name || user.login}
          </h1>
          <p className="text-xl text-gray-600 mb-2">@{user.login}</p>
          
          {user.bio && (
            <p className="text-gray-700 mb-4 leading-relaxed">{user.bio}</p>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
            {user.company && (
              <div className="flex items-center gap-1">
                <span className="font-medium">🏢</span>
                {user.company}
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-1">
                <span className="font-medium">📍</span>
                {user.location}
              </div>
            )}
            {user.blog && (
              <div className="flex items-center gap-1">
                <span className="font-medium">🔗</span>
                <a
                  href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {user.blog}
                </a>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-6">
            <div>
              <span className="font-bold text-lg">{formatNumber(user.followers)}</span>
              <span className="text-gray-600 ml-1">followers</span>
            </div>
            <div>
              <span className="font-bold text-lg">{formatNumber(user.following)}</span>
              <span className="text-gray-600 ml-1">following</span>
            </div>
            <div>
              <span className="font-bold text-lg">{formatNumber(user.public_repos)}</span>
              <span className="text-gray-600 ml-1">repositories</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Joined {formatDate(user.created_at)}
          </p>
        </div>
        
        <a
          href={user.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 
                     transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          View on GitHub
        </a>
      </div>
    </div>
  );
};

export default ProfileCard;
