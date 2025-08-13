import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { MoodEntry, MoodLevel, WeeklyStats } from '../types';
import { format, subDays } from 'date-fns';

interface MoodChartProps {
  entries: MoodEntry[];
  weeklyStats: WeeklyStats[];
  type: 'daily' | 'weekly';
}

const MoodChart: React.FC<MoodChartProps> = ({ entries, weeklyStats, type }) => {
  const moodToNumber = (mood: MoodLevel): number => {
    const values = { terrible: 1, bad: 2, okay: 3, good: 4, excellent: 5 };
    return values[mood];
  };

  const numberToMood = (num: number): string => {
    const moods = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];
    return moods[Math.round(num)] || 'Okay';
  };

  const getMoodColor = (value: number): string => {
    if (value >= 4.5) return '#22c55e';
    if (value >= 3.5) return '#84cc16';
    if (value >= 2.5) return '#eab308';
    if (value >= 1.5) return '#f97316';
    return '#ef4444';
  };

  if (type === 'daily') {
    // Prepare daily data for the last 14 days
    const dailyData = [];
    for (let i = 13; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const entry = entries.find(e => e.date === date);
      dailyData.push({
        date: format(subDays(new Date(), i), 'MMM dd'),
        mood: entry ? moodToNumber(entry.mood) : null,
        note: entry?.note || '',
        factors: entry?.factors || []
      });
    }

    return (
      <div className="mood-card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📈 Daily Mood Trend (Last 14 days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis 
              domain={[0.5, 5.5]}
              tick={{ fontSize: 12 }}
              tickFormatter={numberToMood}
              stroke="#666"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload[0] && payload[0].value) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-semibold">{label}</p>
                      <p className="text-sm" style={{ color: getMoodColor(payload[0].value as number) }}>
                        Mood: {numberToMood(payload[0].value as number)}
                      </p>
                      {data.note && (
                        <p className="text-xs text-gray-600 mt-1">
                          Note: {data.note.substring(0, 50)}
                          {data.note.length > 50 ? '...' : ''}
                        </p>
                      )}
                      {data.factors.length > 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                          Factors: {data.factors.slice(0, 3).join(', ')}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="mood" 
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 6, fill: '#3b82f6' }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Weekly chart
  return (
    <div className="mood-card p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        📊 Weekly Mood Overview
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={weeklyStats}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="week" 
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <YAxis 
            domain={[1, 5]}
            tick={{ fontSize: 12 }}
            tickFormatter={numberToMood}
            stroke="#666"
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload[0]) {
                const data = payload[0].payload as WeeklyStats;
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold">Week of {label}</p>
                    <p className="text-sm" style={{ color: getMoodColor(data.averageMood) }}>
                      Average: {numberToMood(data.averageMood)}
                    </p>
                    <p className="text-xs text-gray-600">
                      Entries: {data.totalEntries}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="averageMood" 
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodChart;
