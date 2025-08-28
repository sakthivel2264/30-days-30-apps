import React from 'react';
import { useGitHub } from './hooks/useGitHub';
import SearchForm from './components/SearchForm';
import ProfileCard from './components/ProfileCard';
import StatsCard from './components/StatsCard';
import LanguageChart from './components/LanguageChart';
import RepositoryCard from './components/RepositoryCard';
import { formatFileSize } from './utils/helpers';

const App: React.FC = () => {
  const { user, stats, loading, error, searchUser } = useGitHub();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            GitHub Profile Analyzer
          </h1>
          <p className="text-xl text-gray-600">
            Discover comprehensive insights about any GitHub profile
          </p>
        </div>

        {/* Search Form */}
        <SearchForm onSearch={searchUser} loading={loading} />

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Profile Data */}
        {user && (
          <>
            {/* Profile Card */}
            <ProfileCard user={user} />

            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                  title="Total Stars"
                  value={stats.totalStars}
                  icon="⭐"
                  color="text-yellow-600"
                />
                <StatsCard
                  title="Total Forks"
                  value={stats.totalForks}
                  icon="🍴"
                  color="text-green-600"
                />
                <StatsCard
                  title="Repositories"
                  value={user.public_repos}
                  icon="📁"
                  color="text-blue-600"
                />
                <StatsCard
                  title="Total Size"
                  value={stats.totalSize}
                  icon="💾"
                  color="text-purple-600"
                  subtitle={formatFileSize(stats.totalSize * 1024)}
                />
              </div>
            )}

            {/* Language Chart and Most Starred Repo */}
            {stats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <LanguageChart languageStats={stats.languageStats} />
                
                {stats.mostStarredRepo && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Most Starred Repository</h3>
                    <RepositoryCard repository={stats.mostStarredRepo} />
                  </div>
                )}
              </div>
            )}

            {/* Recent Repositories */}
            {stats?.recentRepos && stats.recentRepos.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Repositories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.recentRepos.map((repo) => (
                    <RepositoryCard key={repo.id} repository={repo} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Welcome Message */}
        {!user && !loading && !error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Search for a GitHub Profile
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Enter any GitHub username to view detailed analytics including repository stats, 
              language breakdown, contribution insights, and more.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
