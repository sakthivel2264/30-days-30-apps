// src/App.tsx
import React from 'react';
import CodeInput from './components/CodeInput';
import ComplexityResult from './components/ComplexityResult';
import ModelSelector from './components/ModelSelector';
import LoadingSpinner from './components/LoadingSpinner';
import { useComplexityPredictor } from './hooks/useComplexityPredictor';

const App: React.FC = () => {
  const {
    loading,
    result,
    models,
    modelsLoading,
    predictComplexity,
    reset,
  } = useComplexityPredictor();

  const [selectedModel, setSelectedModel] = React.useState<string>('anthropic/claude-3.5-sonnet');

  React.useEffect(() => {
    if (models.length > 0 && !models.find(m => m.id === selectedModel)) {
      setSelectedModel(models[0].id);
    }
  }, [models, selectedModel]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Code Complexity Predictor
          </h1>
          <p className="text-lg text-gray-600">
            Analyze algorithmic complexity using AI-powered analysis
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Configuration</h2>
            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              loading={modelsLoading}
            />
          </div>

          <CodeInput
            onSubmit={predictComplexity}
            loading={loading}
            selectedModel={selectedModel}
          />

          {loading && <LoadingSpinner />}

          {result && !loading && (
            <ComplexityResult result={result} onReset={reset} />
          )}
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Powered by OpenRouter API • Built with React, TypeScript & TailwindCSS
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
