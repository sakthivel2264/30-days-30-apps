export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  size: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics: string[];
}

export interface LanguageStats {
  [language: string]: number;
}

export interface UserStats {
  totalStars: number;
  totalForks: number;
  totalSize: number;
  languageStats: LanguageStats;
  mostStarredRepo: Repository | null;
  recentRepos: Repository[];
}

export interface GitHubApiError {
  message: string;
  status: number;
}
