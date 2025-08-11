// components/ImageAnalyzer.tsx
import React, { useState, useCallback } from 'react';
import type { ConversationEntry, LoadingState } from '../types';
import { useImageUpload } from '../hooks/useImageUpload';
import { openRouterService } from '../services/openRouterService';
import { ImageUpload } from '@/components/ImageUpload';
import { QuestionInput } from '@/components/QuestionInput';
import { ConversationHistory } from '@/components/ConversationHistory';
import { SuggestedQuestions } from '@/components/SuggestedQuestions';

const SUGGESTED_QUESTIONS: string[] = [
  "Describe this image in detail",
  "What objects can you see in this image?",
  "What's the mood or atmosphere of this scene?",
  "Is this photo taken indoors or outdoors?",
  "What colors are most prominent?",
  "How many people are in this image?",
  "What's happening in this image?",
  "What's the setting or location?"
];

export const ImageAnalyzer: React.FC = () => {
  const { image, loadingState, error: uploadError, uploadImage, clearImage } = useImageUpload();
  const [question, setQuestion] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);
  const [analysisState, setAnalysisState] = useState<LoadingState>('idle');
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('google/gemini-2.0-flash-exp:free');

  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const askQuestion = useCallback(async (questionText: string): Promise<void> => {
    if (!image || !questionText.trim()) return;

    setAnalysisState('analyzing');
    setApiError(null);

    try {
      const answer = await openRouterService.analyzeImageWithContext(
        image.base64,
        questionText,
        conversationHistory.map(entry => ({
          question: entry.question,
          answer: entry.answer
        })),
        selectedModel
      );

      const newEntry: ConversationEntry = {
        id: generateId(),
        question: questionText,
        answer,
        timestamp: new Date()
      };

      setConversationHistory(prev => [...prev, newEntry]);
      setQuestion('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image';
      setApiError(errorMessage);
    } finally {
      setAnalysisState('idle');
    }
  }, [image, conversationHistory, selectedModel]);

  const handleQuestionSubmit = useCallback((): void => {
    if (question.trim()) {
      askQuestion(question.trim());
    }
  }, [question, askQuestion]);

  const handleSuggestedQuestion = useCallback((suggestedQuestion: string): void => {
    setQuestion(suggestedQuestion);
  }, []);

  const handleNewImage = useCallback((): void => {
    clearImage();
    setConversationHistory([]);
    setQuestion('');
    setApiError(null);
  }, [clearImage]);

  const handleExportConversation = useCallback((): void => {
    const data = {
      conversation: conversationHistory,
      timestamp: new Date().toISOString(),
      model: selectedModel
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `image-analysis-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [conversationHistory, selectedModel]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">VisionQuery</h1>
        <p className="text-lg text-gray-600">Upload an image and ask questions about it</p>
      </div>

      <ImageUpload
        image={image}
        loadingState={loadingState}
        error={uploadError}
        onImageUpload={uploadImage}
        onNewImage={handleNewImage}
      />

      {image && (
        <>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-2">
              AI Model:
            </label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="openai/gpt-4o">GPT-4 Vision</option>
              <option value="anthropic/claude-3-opus">Claude 3 Opus</option>
              <option value="google/gemini-pro-vision">Gemini Pro Vision</option>
            </select>
          </div>

          <SuggestedQuestions
            questions={SUGGESTED_QUESTIONS}
            onQuestionSelect={handleSuggestedQuestion}
            disabled={analysisState === 'analyzing'}
          />

          <QuestionInput
            question={question}
            onQuestionChange={setQuestion}
            onSubmit={handleQuestionSubmit}
            loading={analysisState === 'analyzing'}
            disabled={analysisState === 'analyzing'}
          />

          {apiError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex justify-between items-start">
                <p className="text-red-800 flex-1">
                  <span className="font-semibold">Error:</span> {apiError}
                </p>
                <button 
                  onClick={() => setApiError(null)}
                  className="ml-4 text-red-600 hover:text-red-800 font-medium text-sm focus:outline-none"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <ConversationHistory
            conversations={conversationHistory}
            onExport={handleExportConversation}
          />
        </>
      )}
    </div>
  );
};
