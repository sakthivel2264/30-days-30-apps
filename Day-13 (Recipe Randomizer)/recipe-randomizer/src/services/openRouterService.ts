
import type { OpenRouterResponse, Recipe } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export class OpenRouterService {
  static async generateRecipe(ingredients: string[]): Promise<Recipe[]> {
    if (!API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    const prompt = `Generate 3 Indian recipes using the following ingredients: ${ingredients.join(', ')}.

    Please respond with ONLY a valid JSON array containing 3 recipe objects, each with this exact structure:
    [
      {
        "id": "unique_id",
        "name": "Recipe Name",
        "description": "Brief description",
        "ingredients": ["ingredient 1", "ingredient 2"],
        "instructions": ["step 1", "step 2"],
        "prepTime": "15 minutes",
        "cookTime": "30 minutes",
        "servings": 4,
        "cuisine": "Indian",
        "course": "Main Course"
      }
    ]

    Focus on authentic Indian recipes with traditional spices and cooking methods. Ensure the recipes are practical for home cooking.`;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Indian Recipe Generator'
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
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

      // Parse the JSON response
      const recipes = JSON.parse(content.trim());
      return recipes;
    } catch (error) {
      console.error('Error generating recipe:', error);
      throw error;
    }
  }
}
