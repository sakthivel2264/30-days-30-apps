import React, { useState } from 'react';
import { useMoodTracker } from './hooks/useMoodTracker';
import MoodEntryForm from './components/MoodEntryForm';
import MoodChart from './components/MoodChart';
import MoodInsights from './components/MoodInsights';
import StatsDashboard from './components/StatsDashboard';
import { format } from 'date-fns';
import { loadDummyData } from './data/dummyMoodData';

function App() {
  const {
    entries,
    addMoodEntry,
    deleteMoodEntry,
    getMoodPattern,
    getCurrentStreak,
    getWeeklyStats,
    generateInsights,
    insights,
    isLoadingInsights
  } = useMoodTracker();

  const [activeTab, setActiveTab] = useState<'today' | 'charts' | 'insights' | 'stats'>('today');
  const [chartType, setChartType] = useState<'daily' | 'weekly'>('daily');

  // Get today's entry if it exists
  const todayEntry = entries.find(entry => entry.date === format(new Date(), 'yyyy-MM-dd'));
  const pattern = getMoodPattern();
  const currentStreak = getCurrentStreak();
  const weeklyStats = getWeeklyStats();

  const TabButton: React.FC<{
    id: string;
    label: string;
    icon: string;
    isActive: boolean;
    onClick: () => void;
  }> = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🧠 Mood Tracker Dashboard
          </h1>
          <p className="text-gray-600">
            Track your emotions, discover patterns, and improve your mental well-being with AI insights
          </p>
          
          {currentStreak > 0 && (
            <div className="mt-4 inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full">
              <span>🔥</span>
              <span className="font-semibold">{currentStreak} day tracking streak!</span>
            </div>
          )}
          {/* <div className="text-center mb-4 mt-2">
            <button
              onClick={() => {
                const dummyEntries = loadDummyData();
                console.log(`Loaded ${dummyEntries.length} dummy mood entries`);
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              🎭 Loaded 31 Days Demo Data
            </button>
          </div> */}

        </header>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <TabButton
            id="today"
            label="Today"
            icon="📝"
            isActive={activeTab === 'today'}
            onClick={() => setActiveTab('today')}
          />
          <TabButton
            id="charts"
            label="Charts"
            icon="📊"
            isActive={activeTab === 'charts'}
            onClick={() => setActiveTab('charts')}
          />
          <TabButton
            id="insights"
            label="AI Insights"
            icon="🧠"
            isActive={activeTab === 'insights'}
            onClick={() => setActiveTab('insights')}
          />
          <TabButton
            id="stats"
            label="Statistics"
            icon="📈"
            isActive={activeTab === 'stats'}
            onClick={() => setActiveTab('stats')}
          />
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'today' && (
            <div className="max-w-2xl mx-auto">
              <MoodEntryForm
                onSubmit={addMoodEntry}
                todayEntry={todayEntry ? {
                  mood: todayEntry.mood,
                  note: todayEntry.note,
                  factors: todayEntry.factors
                } : null}
              />
              
              {entries.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    📅 Recent Entries
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                    {entries.slice(0, 5).map(entry => (
                      <div key={entry.id} className="mood-card p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">
                              {{
                                excellent: '😄',
                                good: '😊',
                                okay: '😐',
                                bad: '😞',
                                terrible: '😢'
                              }[entry.mood]}
                            </span>
                            <div>
                              <div className="font-medium text-gray-800 capitalize">
                                {entry.mood}
                              </div>
                              <div className="text-sm text-gray-600">
                                {format(new Date(entry.date), 'MMM dd, yyyy')}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteMoodEntry(entry.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                        
                        {entry.note && (
                          <p className="mt-2 text-sm text-gray-700">
                            "{entry.note}"
                          </p>
                        )}
                        
                        {entry.factors.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {entry.factors.map(factor => (
                              <span
                                key={factor}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                              >
                                {factor}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="space-y-6">
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setChartType('daily')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    chartType === 'daily'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  📈 Daily View
                </button>
                <button
                  onClick={() => setChartType('weekly')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    chartType === 'weekly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  📊 Weekly View
                </button>
              </div>
              
              {entries.length > 0 ? (
                <MoodChart
                  entries={entries}
                  weeklyStats={weeklyStats}
                  type={chartType}
                />
              ) : (
                <div className="mood-card p-8 text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No data yet
                  </h3>
                  <p className="text-gray-600">
                    Start logging your moods to see beautiful charts and patterns!
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="max-w-4xl mx-auto">
              <MoodInsights
                insights={insights}
                isLoading={isLoadingInsights}
                onRefresh={generateInsights}
              />
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="max-w-4xl mx-auto">
              {entries.length > 0 ? (
                <StatsDashboard
                  pattern={pattern}
                  currentStreak={currentStreak}
                  totalEntries={entries.length}
                />
              ) : (
                <div className="mood-card p-8 text-center">
                  <div className="text-4xl mb-4">📈</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No statistics yet
                  </h3>
                  <p className="text-gray-600">
                    Log a few mood entries to unlock detailed statistics and patterns!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-500 text-sm">
          <p>
            💙 Track your journey to better mental health • 
            <span className="ml-1">Data stays private and secure in your browser</span>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
