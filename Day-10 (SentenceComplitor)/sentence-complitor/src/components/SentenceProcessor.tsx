// src/components/SentenceProcessor.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { completeSentenceStream } from '@/services/openrouterService';

const SentenceProcessor: React.FC = () => {
  const [input, setInput] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai/gpt-3.5-turbo');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Generate suggestion as user types
  const generateSuggestion = useCallback(async (text: string) => {
    if (!text.trim() || text.length < 3) {
      setSuggestion('');
      return;
    }

    setIsGeneratingSuggestion(true);
    let newSuggestion = '';

    try {
      await completeSentenceStream(
        text,
        (chunk: string) => {
          newSuggestion += chunk;
          setSuggestion(newSuggestion);
        },
        selectedModel
      );
    } catch (error) {
      console.error('Error generating suggestion:', error);
      setSuggestion('');
    } finally {
      setIsGeneratingSuggestion(false);
    }
  }, [selectedModel]);

  // Debounced suggestion generation
  const handleInputChange = (value: string) => {
    setInput(value);
    setSuggestion(''); // Clear previous suggestion
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce suggestion generation (wait 500ms after user stops typing)
    debounceRef.current = setTimeout(() => {
      generateSuggestion(value);
    }, 500);
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      const newText = input + suggestion;
      setInput(newText);
      setSuggestion('');
      
      // Clear debounce and generate new suggestion for the completed text
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        generateSuggestion(newText);
      }, 500);
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Complitor</h1>
        <p className="text-gray-600">AI-Powered Real-time Sentence Completion</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start typing your sentence:
          </label>
          
          {/* Text Input with Overlay Suggestion */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Start typing and watch the magic happen..."
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-transparent relative z-10"
              rows={4}
              style={{ resize: 'none' }}
            />
            
            {/* Suggestion Overlay */}
            {suggestion && (
              <div className="absolute inset-0 p-4 pointer-events-none z-0">
                <div className="whitespace-pre-wrap break-words">
                  <span className="invisible">{input}</span>
                  <span className="text-gray-400 bg-gray-100 px-1 rounded">
                    {suggestion}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Suggestion Status */}
          <div className="mt-2 text-sm text-gray-500 flex items-center justify-between">
            <div className="flex items-center">
              {isGeneratingSuggestion && (
                <>
                  <div className="animate-spin w-3 h-3 border border-blue-500 border-t-transparent rounded-full mr-2"></div>
                  Generating suggestion...
                </>
              )}
              {suggestion && !isGeneratingSuggestion && (
                <>
                  <span className="text-blue-600 mr-2">💡</span>
                  Press Tab to accept suggestion
                </>
              )}
            </div>
            <div className="text-xs text-gray-400">
              Model: {selectedModel.split('/')[1]}
            </div>
          </div>
        </div>

        {/* Model Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Model:
          </label>
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo (Fast)</option>
            <option value="openai/gpt-4">GPT-4 (High Quality)</option>
            <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
            <option value="meta-llama/llama-3-8b-instruct">Llama 3 8B (Economical)</option>
          </select>
        </div>

        {/* Clear Button */}
        {input && (
          <button
            onClick={() => {
              setInput('');
              setSuggestion('');
              if (debounceRef.current) {
                clearTimeout(debounceRef.current);
              }
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            Clear Text
          </button>
        )}

        {/* Usage Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">How to use:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Start typing your sentence</li>
            <li>• AI suggestions appear automatically as you type</li>
            <li>• Press <kbd className="bg-white px-2 py-1 rounded border">Tab</kbd> to accept the suggestion</li>
            <li>• Continue typing for more suggestions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SentenceProcessor;
