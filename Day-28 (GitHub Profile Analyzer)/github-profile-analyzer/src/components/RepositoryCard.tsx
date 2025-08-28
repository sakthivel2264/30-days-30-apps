import React from 'react';
import type { Repository } from '../types/github.types';
import { formatDate, getLanguageColor } from '../utils/helpers';

interface RepositoryCardProps {
  repository: Repository;
}

const RepositoryCard: React.FC<RepositoryCardProps> = ({ repository }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 truncate">
          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors"
          >
            {repository.name}
          </a>
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            ⭐ {repository.stargazers_count}
          </span>
          <span className="flex items-center gap-1">
            🍴 {repository.forks_count}
          </span>
        </div>
      </div>
      
      {repository.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{repository.description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {repository.language && (
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getLanguageColor(repository.language) }}
              ></div>
              <span className="text-sm text-gray-600">{repository.language}</span>
            </div>
          )}
        </div>
        <span className="text-xs text-gray-500">
          Updated {formatDate(repository.updated_at)}
        </span>
      </div>
      
      {repository.topics.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {repository.topics.slice(0, 3).map((topic) => (
            <span
              key={topic}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {topic}
            </span>
          ))}
          {repository.topics.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{repository.topics.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default RepositoryCard;
