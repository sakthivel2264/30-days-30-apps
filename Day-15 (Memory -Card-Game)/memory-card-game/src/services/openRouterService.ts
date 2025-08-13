import type { OpenRouterResponse, GeneratedTheme } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export class OpenRouterService {
  static async generateThemeCards(theme: string, cardCount: number): Promise<GeneratedTheme> {
    if (!API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    const prompt = `Generate exactly ${cardCount} pairs of matching content for a memory card game with the theme "${theme}".

    Please respond with ONLY a valid JSON object with this exact structure:
    {
      "theme": "${theme}",
      "cards": [
        {
          "content": "descriptive name",
          "emoji": "relevant emoji"
        }
      ]
    }

    Requirements:
    - Generate exactly ${cardCount} unique items
    - Each item should have a descriptive name and a single relevant emoji
    - Items should be thematically related to "${theme}"
    - Make the content interesting and varied
    - Ensure emojis are visually distinct for easy recognition

    Examples for different themes:
    - Animals: {"content": "Lion", "emoji": "🦁"}
    - Food: {"content": "Pizza", "emoji": "🍕"}
    - Tech: {"content": "Smartphone", "emoji": "📱"}
    - Space: {"content": "Rocket", "emoji": "🚀"}
    - Nature: {"content": "Mountain", "emoji": "⛰️"}`;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Memory Card Game'
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 1500
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

      const generatedTheme = JSON.parse(content.trim());
      return generatedTheme;
    } catch (error) {
      console.error('Error generating theme cards:', error);
      throw error;
    }
  }
}
