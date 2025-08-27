
import { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import type { ComplexityResponse, Model, CodeInput } from '../types/api';

export const useComplexityPredictor = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ComplexityResponse | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [modelsLoading, setModelsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setModelsLoading(true);
    try {
      const response = await ApiService.getAvailableModels();
      if (response.models) {
        setModels(response.models);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setModelsLoading(false);
    }
  };

  const predictComplexity = async (input: CodeInput) => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await ApiService.predictComplexity(input);
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Prediction failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
  };

  return {
    loading,
    result,
    models,
    modelsLoading,
    predictComplexity,
    reset,
  };
};
