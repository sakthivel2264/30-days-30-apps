export interface GitHubProfile {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  email: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface Repository {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  size: number;
  created_at: string;
  updated_at: string;
}

export interface ProfileScore {
  total: number;
  activity: number;
  quality: number;
  impact: number;
  consistency: number;
  breakdown: {
    repos: number;
    followers: number;
    stars: number;
    forks: number;
    languages: number;
  };
}

export interface ProfileAnalysis {
  profile: GitHubProfile;
  repositories: Repository[];
  score: ProfileScore;
  languages: Record<string, number>;
  top_repos: Repository[];
}

export interface BattleResult {
  winner: string;
  loser: string;
  winner_analysis: ProfileAnalysis;
  loser_analysis: ProfileAnalysis;
  insights: string[];
  recommendations: {
    winner: string[];
    loser: string[];
  };
}
