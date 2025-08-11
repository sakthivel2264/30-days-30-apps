

import type { OpenRouterRequestBody, APIResponse } from '../types';

class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.VITE_OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenRouter API key not found in environment variables');
    }
  }

  async analyzeImage(
    base64Image: string, 
    question: string, 
    model: string = 'google/gemini-2.5-pro-exp-03-25'
  ): Promise<string> {
    const requestBody: OpenRouterRequestBody = {
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: question
            },
            {
              type: 'image_url',
              image_url: {
                url: base64Image
              }
            }
          ]
        }
      ],
      max_tokens: 500
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Image Analysis App'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.statusText} - ${errorText}`);
    }

    const data: APIResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response received from API');
    }

    return data.choices[0].message.content;
  }

  async analyzeImageWithContext(
    base64Image: string,
    question: string,
    conversationHistory: Array<{ question: string; answer: string }>,
    model: string = 'google/gemini-2.5-pro-exp-03-25'
  ): Promise<string> {
    const messages: OpenRouterRequestBody['messages'] = [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: base64Image }
          }
        ]
      }
    ];

    // Add conversation history
    conversationHistory.forEach(entry => {
      messages.push(
        { role: 'user', content: entry.question },
        { role: 'assistant', content: entry.answer }
      );
    });

    // Add current question
    messages.push({ role: 'user', content: question });

    const requestBody: OpenRouterRequestBody = {
      model,
      messages,
      max_tokens: 500
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Image Analysis App'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data: APIResponse = await response.json();
    return data.choices[0].message.content;
  }
}

export const openRouterService = new OpenRouterService();
