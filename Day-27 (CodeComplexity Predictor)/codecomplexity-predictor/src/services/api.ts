
import type { CodeInput, ComplexityResponse, ModelsResponse } from '../types/api';

const API_BASE_URL = 'http://localhost:8000';

export class ApiService {
  static async predictComplexity(input: CodeInput): Promise<ComplexityResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/predict-complexity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error predicting complexity:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  static async getAvailableModels(): Promise<ModelsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/models`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching models:', error);
      return {
        models: [],
        error: error instanceof Error ? error.message : 'Failed to fetch models',
      };
    }
  }
}
