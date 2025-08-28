import type { Repository, UserStats, LanguageStats } from '../types/github.types';

export const calculateUserStats = (repositories: Repository[]): UserStats => {
  let totalStars = 0;
  let totalForks = 0;
  let totalSize = 0;
  const languageStats: LanguageStats = {};
  let mostStarredRepo: Repository | null = null;

  repositories.forEach((repo) => {
    totalStars += repo.stargazers_count;
    totalForks += repo.forks_count;
    totalSize += repo.size;

    if (repo.language) {
      languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
    }

    if (!mostStarredRepo || repo.stargazers_count > mostStarredRepo.stargazers_count) {
      mostStarredRepo = repo;
    }
  });

  const recentRepos = repositories
    .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
    .slice(0, 6);

  return {
    totalStars,
    totalForks,
    totalSize,
    languageStats,
    mostStarredRepo,
    recentRepos,
  };
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getLanguageColor = (language: string): string => {
  const colors: { [key: string]: string } = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#239120',
    PHP: '#4F5D95',
    Ruby: '#701516',
    Go: '#00ADD8',
    Rust: '#dea584',
    Swift: '#ffac45',
    Kotlin: '#F18E33',
    Dart: '#00B4AB',
    HTML: '#e34c26',
    CSS: '#1572B6',
    Vue: '#2c3e50',
    React: '#61DAFB',
  };
  return colors[language] || '#666666';
};
