
import React from 'react';
import type { Model } from '../types/api';

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  loading: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onModelChange,
  loading,
}) => {
  return (
    <div className="mb-4">
      <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-2">
        AI Model
      </label>
      <select
        id="model-select"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        disabled={loading}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name} ({model.context_length?.toLocaleString()} tokens)
          </option>
        ))}
      </select>
      {models.length === 0 && !loading && (
        <p className="text-sm text-gray-500 mt-1">No models available</p>
      )}
    </div>
  );
};

export default ModelSelector;
