// src/components/CodeInput.tsx
import React, { useState } from 'react';
import type { CodeInput as CodeInputType } from '../types/api';

interface CodeInputProps {
  onSubmit: (input: CodeInputType) => void;
  loading: boolean;
  selectedModel: string;
}

const CodeInput: React.FC<CodeInputProps> = ({ onSubmit, loading, selectedModel }) => {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('auto');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onSubmit({
        code: code.trim(),
        language: language === 'auto' ? undefined : language,
        model: selectedModel,
      });
    }
  };

  const languages = [
    { value: 'auto', label: 'Auto-detect' },
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
  ];

  const sampleCode = `def bubble_sort(arr):
    for i in range(len(arr)):
        for j in range(len(arr) - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Code Analysis</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
            Programming Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Source Code
            </label>
            <button
              type="button"
              onClick={() => setCode(sampleCode)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Load sample
            </button>
          </div>
          <textarea
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-vertical"
            required
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Analyzing...' : 'Analyze Complexity'}
          </button>
          
          <button
            type="button"
            onClick={() => setCode('')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default CodeInput;
