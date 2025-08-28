import { useState, useCallback } from 'react';
import type { GitHubUser, Repository, UserStats, GitHubApiError } from '../types/github.types';
import { githubApi } from '../services/githubApi';
import { calculateUserStats } from '../utils/helpers';

interface UseGitHubReturn {
  user: GitHubUser | null;
  repositories: Repository[];
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  searchUser: (username: string) => Promise<void>;
  clearData: () => void;
}

export const useGitHub = (): UseGitHubReturn => {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUser = useCallback(async (username: string) => {
    if (!username.trim()) {
      setError('Please enter a valid username');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userData = await githubApi.getUser(username);
      const reposData = await githubApi.getAllUserRepositories(username);
      const userStats = calculateUserStats(reposData);

      setUser(userData);
      setRepositories(reposData);
      setStats(userStats);
    } catch (err) {
      const error = err as GitHubApiError;
      setError(error.message || 'Failed to fetch user data');
      setUser(null);
      setRepositories([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setUser(null);
    setRepositories([]);
    setStats(null);
    setError(null);
  }, []);

  return {
    user,
    repositories,
    stats,
    loading,
    error,
    searchUser,
    clearData,
  };
};
