import type { GitHubUser, Repository, GitHubApiError } from '../types/github.types';

const GITHUB_API_BASE = 'https://api.github.com';

class GitHubApiService {
  private token?: string;

  constructor(token?: string) {
    this.token = token;
  }

  private async makeRequest<T>(url: string): Promise<T> {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (this.token) {
      headers.Authorization = `token ${this.token}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const error: GitHubApiError = {
        message: `GitHub API Error: ${response.statusText}`,
        status: response.status,
      };
      throw error;
    }

    return response.json();
  }

  async getUser(username: string): Promise<GitHubUser> {
    return this.makeRequest<GitHubUser>(`${GITHUB_API_BASE}/users/${username}`);
  }

  async getUserRepositories(username: string, page = 1, perPage = 100): Promise<Repository[]> {
    return this.makeRequest<Repository[]>(
      `${GITHUB_API_BASE}/users/${username}/repos?page=${page}&per_page=${perPage}&sort=updated&direction=desc`
    );
  }

  async getAllUserRepositories(username: string): Promise<Repository[]> {
    let allRepos: Repository[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const repos = await this.getUserRepositories(username, page, 100);
      allRepos = [...allRepos, ...repos];
      hasMore = repos.length === 100;
      page++;
    }

    return allRepos;
  }
}

export const githubApi = new GitHubApiService(import.meta.env.VITE_GITHUB_TOKEN);
