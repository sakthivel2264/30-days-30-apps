import type { OpenRouterResponse, MoodEntry, MoodInsight, WeeklyStats } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export class OpenRouterService {
  static async generateMoodInsights(
    recentEntries: MoodEntry[], 
    weeklyStats: WeeklyStats[],
    currentStreak: number
  ): Promise<MoodInsight[]> {
    if (!API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    const moodData = this.prepareMoodDataForAI(recentEntries, weeklyStats, currentStreak);

    const prompt = `You are a compassionate mental health assistant analyzing mood tracking data. Please analyze the following mood data and provide insights in JSON format.

User's Mood Data:
${moodData}

Based on this data, provide insights as a JSON array with exactly 3-5 insights. Each insight should have this structure:
[
  {
    "id": "unique_id",
    "type": "pattern" | "trigger" | "suggestion" | "achievement",
    "title": "Insight Title",
    "description": "Detailed, empathetic description",
    "confidence": 0.8,
    "actionable": true,
    "suggestions": ["actionable suggestion 1", "actionable suggestion 2"]
  }
]

Guidelines:
- Be encouraging and supportive in tone
- Focus on actionable insights and positive patterns when possible
- If patterns suggest concerning trends, provide gentle guidance
- Include specific suggestions for mood improvement
- Base insights on actual data patterns, not generic advice
- Confidence should reflect how certain the pattern is (0.1-1.0)
- Types: "pattern" for trends, "trigger" for identified factors, "suggestion" for recommendations, "achievement" for positive milestones

Respond with ONLY the JSON array, no additional text.`;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Mood Tracker Dashboard'
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a supportive mental health assistant that provides empathetic, evidence-based insights about mood patterns. Always maintain a positive, encouraging tone while being honest about concerning patterns.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: OpenRouterResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from API');
      }

      console.log('Raw AI Response:', content);

      // Parse the JSON response
      const insights = JSON.parse(content.trim());
      
      // Validate and sanitize insights
      return this.validateInsights(insights);
    } catch (error) {
      console.error('Error generating insights:', error);
      
      // Return fallback insights based on basic pattern analysis
      return this.generateFallbackInsights(recentEntries, currentStreak);
    }
  }

  private static prepareMoodDataForAI(
    entries: MoodEntry[], 
    weeklyStats: WeeklyStats[], 
    streak: number
  ): string {
    const recentEntries = entries.slice(-14); // Last 2 weeks
    const moodCounts = recentEntries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonFactors = recentEntries
      .flatMap(e => e.factors)
      .reduce((acc, factor) => {
        acc[factor] = (acc[factor] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return JSON.stringify({
      totalEntries: recentEntries.length,
      moodDistribution: moodCounts,
      commonFactors,
      currentStreak: streak,
      weeklyTrends: weeklyStats.slice(-4), // Last 4 weeks
      recentNotes: recentEntries
        .filter(e => e.note.trim().length > 0)
        .map(e => ({ date: e.date, mood: e.mood, note: e.note.substring(0, 100) }))
    }, null, 2);
  }

  private static validateInsights(insights: any[]): MoodInsight[] {
    if (!Array.isArray(insights)) {
      throw new Error('Insights must be an array');
    }

    return insights
      .filter(insight => 
        insight.id && 
        insight.type && 
        insight.title && 
        insight.description &&
        typeof insight.confidence === 'number' &&
        typeof insight.actionable === 'boolean'
      )
      .map((insight, index) => ({
        id: insight.id || `insight-${Date.now()}-${index}`,
        type: insight.type,
        title: insight.title,
        description: insight.description,
        confidence: Math.max(0.1, Math.min(1.0, insight.confidence)),
        actionable: insight.actionable,
        suggestions: Array.isArray(insight.suggestions) ? insight.suggestions : []
      }));
  }

  private static generateFallbackInsights(entries: MoodEntry[], streak: number): MoodInsight[] {
    const recentEntries = entries.slice(-7);
    const avgMood = recentEntries.reduce((sum, e) => sum + this.moodToNumber(e.mood), 0) / recentEntries.length;
    
    const insights: MoodInsight[] = [];

    // Streak insight
    if (streak >= 3) {
      insights.push({
        id: 'streak-achievement',
        type: 'achievement',
        title: `${streak}-Day Tracking Streak! 🎉`,
        description: `You've been consistently tracking your mood for ${streak} days. This self-awareness is a powerful tool for emotional growth.`,
        confidence: 1.0,
        actionable: true,
        suggestions: ['Continue your tracking habit', 'Consider adding more detailed notes', 'Celebrate this achievement']
      });
    }

    // Mood trend insight
    if (avgMood >= 3) {
      insights.push({
        id: 'positive-trend',
        type: 'pattern',
        title: 'Positive Mood Pattern Detected',
        description: 'Your recent mood entries show a generally positive trend. Keep up the great work!',
        confidence: 0.8,
        actionable: true,
        suggestions: ['Identify what\'s contributing to these positive moods', 'Maintain your current self-care routine']
      });
    } else {
      insights.push({
        id: 'support-suggestion',
        type: 'suggestion',
        title: 'Gentle Reminder for Self-Care',
        description: 'Recent entries suggest you might benefit from extra self-care. Remember, it\'s okay to have difficult days.',
        confidence: 0.7,
        actionable: true,
        suggestions: ['Try a short mindfulness exercise', 'Reach out to a friend or family member', 'Consider gentle physical activity']
      });
    }

    return insights;
  }

  private static moodToNumber(mood: string): number {
    const moodValues = { terrible: 1, bad: 2, okay: 3, good: 4, excellent: 5 };
    return moodValues[mood as keyof typeof moodValues] || 3;
  }
}
