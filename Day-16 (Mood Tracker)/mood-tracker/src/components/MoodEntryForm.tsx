import React, { useState, useEffect } from 'react';
import type { MoodLevel } from '../types';
import MoodButton from './MoodButton';
import { format } from 'date-fns';

interface MoodEntryFormProps {
  onSubmit: (mood: MoodLevel, note: string, factors: string[]) => void;
  todayEntry?: { mood: MoodLevel; note: string; factors: string[] } | null;
}

const MoodEntryForm: React.FC<MoodEntryFormProps> = ({ onSubmit, todayEntry }) => {
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [note, setNote] = useState('');
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);

  const commonFactors = [
    '💤 Sleep', '🏃‍♂️ Exercise', '🍎 Diet', '👥 Social', 
    '💼 Work', '📚 Learning', '🌤️ Weather', '💊 Health',
    '🎵 Music', '🧘‍♀️ Meditation', '☕ Caffeine', '🎮 Entertainment'
  ];

  // Load today's entry if it exists
  useEffect(() => {
    if (todayEntry) {
      setSelectedMood(todayEntry.mood);
      setNote(todayEntry.note);
      setSelectedFactors(todayEntry.factors);
    }
  }, [todayEntry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMood) {
      onSubmit(selectedMood, note, selectedFactors);
    }
  };

  const toggleFactor = (factor: string) => {
    setSelectedFactors(prev => 
      prev.includes(factor)
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    );
  };

  return (
    <div className="mood-card p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-1">
          How are you feeling today?
        </h2>
        <p className="text-gray-600 text-sm">
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mood Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select your mood:
          </label>
          <div className="flex justify-center space-x-3">
            {(['terrible', 'bad', 'okay', 'good', 'excellent'] as MoodLevel[]).map(mood => (
              <MoodButton
                key={mood}
                mood={mood}
                isSelected={selectedMood === mood}
                onClick={() => setSelectedMood(mood)}
                size="lg"
              />
            ))}
          </div>
        </div>

        {/* Influencing Factors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What influenced your mood today? (optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {commonFactors.map(factor => (
              <button
                key={factor}
                type="button"
                onClick={() => toggleFactor(factor)}
                className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                  selectedFactors.includes(factor)
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {factor}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add a note (optional):
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What happened today? Any thoughts or reflections..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            maxLength={500}
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {note.length}/500 characters
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedMood}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            selectedMood
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {todayEntry ? '📝 Update Today\'s Mood' : '✨ Log Mood Entry'}
        </button>
      </form>
    </div>
  );
};

export default MoodEntryForm;
