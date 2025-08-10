// src/services/openRouterService.ts

const OPENROUTER_API_KEY = process.env.VITE_OPENROUTER_API_KEY;
const BASE_URL = 'https://openrouter.ai/api/v1';

export const completeSentenceStream = async (
  partialSentence: string, 
  onChunk: (chunk: string) => void,
  model: string = 'openai/gpt-3.5-turbo'
) => {
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Sentence Complitor - AI Writing Assistant',
      },
      body: JSON.stringify({
        model,
        messages: [
        //   { 
        //     role: 'system', 
        //     content: 'Complete the sentence naturally with 3-8 words. Be concise and maintain the original tone. You are an Sentence Completion AI not a Conversational AI.' 
        //   },
          { role: 'user', content: `You are a sentence completion AI. Your task is to complete partial sentences naturally and seamlessly.

            RULES:
            - Complete with 3-8 words maximum
            - Maintain the exact tone, style, and context of the input
            - Ensure grammatical correctness and natural flow
            - Do NOT start conversations or add greetings
            - Do NOT explain or comment on your completion
            - Do NOT add punctuation unless the sentence naturally ends
            - Focus on logical continuation, not creative interpretation
            - Match the formality level of the input text
            - Preserve the original subject and perspective

            EXAMPLES:
            Input: "The weather today is"
            Output: " absolutely perfect for hiking"

            Input: "I can't believe that"
            Output: " happened so suddenly"

            Input: "The meeting will start"
            Output: " in fifteen minutes sharp"

            Complete the following sentence by providing only the continuation: ${partialSentence}` }
        ],
        stream: true,
        max_tokens: 30,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            continue;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in streaming completion:', error);
    throw error;
  }
};
