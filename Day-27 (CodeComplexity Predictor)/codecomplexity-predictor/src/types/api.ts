
export interface CodeInput {
  code: string;
  language?: string;
  model?: string;
}

export interface ComplexityPrediction {
  time_complexity: string;
  space_complexity: string;
  explanation: string;
  confidence_score: number;
  suggestions: string[];
}

export interface ComplexityResponse {
  success: boolean;
  prediction?: ComplexityPrediction;
  error?: string;
  processing_time?: number;
}

export interface Model {
  id: string;
  name: string;
  context_length: number;
}

export interface ModelsResponse {
  models: Model[];
  error?: string;
}
