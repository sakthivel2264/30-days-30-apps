// types/index.ts
export interface ConversationEntry {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
}

export interface ImageData {
  file: File;
  url: string;
  base64: string;
}

export interface APIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface OpenRouterRequestBody {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string | Array<{
      type: 'text' | 'image_url';
      text?: string;
      image_url?: {
        url: string;
      };
    }>;
  }>;
  max_tokens?: number;
}

export type LoadingState = 'idle' | 'uploading' | 'analyzing' | 'error';
