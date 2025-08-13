import React, { useState, useEffect, useRef } from 'react';
import type { GameSettings, GeneratedText } from './types';
import { OpenRouterService } from './services/openRouterService';
import { useTypingTest } from './hooks/useTypingTest';
import { usePersonalBests } from './hooks/usePersonalBests';
import GameSettingsComponent from './components/GameSettings';
import TypingDisplay from './components/TypingDisplay';
import StatsDisplay from './components/StatsDisplay';
import ResultsModal from './components/ResultsModal';
import PersonalBests from './components/PersonalBests';

function App() {
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    timeLimit: 60,
    difficulty: 'medium',
    category: 'general'
  });

  const [generatedText, setGeneratedText] = useState<GeneratedText>({
    text: "Welcome to the AI-powered Typing Speed Tester! This application will help you improve your typing speed and accuracy with dynamically generated content. Start by selecting your preferred settings and generating new text. Focus on accuracy first, then speed will naturally follow. Good luck and happy typing!",
    category: 'general',
    difficulty: 'medium'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    currentPosition,
    userInput,
    isActive,
    isCompleted,
    timeRemaining,
    stats,
    characterStates,
    startTest,
    resetTest,
    handleKeyPress,
    getTestResult,
  } = useTypingTest(generatedText.text, gameSettings);

  const {
    personalBests,
    updatePersonalBest,
    getPersonalBest,
    getOverallBest
  } = usePersonalBests();

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Handle test completion
  useEffect(() => {
    if (isCompleted) {
      const result = getTestResult();
      const wasNewRecord = updatePersonalBest(result);
      setIsNewRecord(wasNewRecord);
      setShowResults(true);
    }
  }, [isCompleted, getTestResult, updatePersonalBest]);

  // Focus management
  useEffect(() => {
    if (isActive && hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, [isActive]);

  // Generate new text
  const generateNewText = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const newText = await OpenRouterService.generateTypingText(
        gameSettings.category,
        gameSettings.difficulty,
        gameSettings.timeLimit < 60 ? 50 : gameSettings.timeLimit < 120 ? 100 : 150
      );
      setGeneratedText(newText);
      resetTest();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate text');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle keyboard input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This is needed for mobile devices
    const value = e.target.value;
    if (value.length > userInput.length) {
      const newChar = value[value.length - 1];
      handleKeyPress(newChar);
    } else if (value.length < userInput.length) {
      handleKeyPress('Backspace');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' || e.key.length === 1) {
      e.preventDefault();
      handleKeyPress(e.key);
    }
  };

  // Click to focus
  const handleDisplayClick = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  };

  const currentPersonalBest = getPersonalBest(gameSettings.difficulty, gameSettings.category);
  const overallBest = getOverallBest();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ⚡ AI Typing Speed Tester
          </h1>
          <p className="text-gray-600">
            Test your typing speed with AI-generated content • Measure WPM & Accuracy in real-time
          </p>
        </header>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Testing Area */}
            <div className="lg:col-span-2">
              <GameSettingsComponent
                settings={gameSettings}
                onSettingsChange={setGameSettings}
                onGenerateText={generateNewText}
                isLoading={isGenerating}
                disabled={isActive}
              />

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  <strong>Error:</strong> {error}
                  <div className="text-sm mt-1">
                    Make sure your OpenRouter API key is configured. Using fallback text for now.
                  </div>
                </div>
              )}

              <StatsDisplay
                stats={stats}
                timeRemaining={timeRemaining}
                isActive={isActive}
                personalBest={currentPersonalBest}
              />

              <div className="relative mb-6">
                <TypingDisplay
                  characterStates={characterStates}
                  currentPosition={currentPosition}
                />
                
                {/* Hidden Input for keyboard capture */}
                <input
                  ref={hiddenInputRef}
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="absolute opacity-0 pointer-events-none"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />

                {/* Click overlay for focus */}
                <div
                  className="absolute inset-0 cursor-text"
                  onClick={handleDisplayClick}
                />
              </div>

              <div className="text-center space-x-4">
                {!isActive && !isCompleted && (
                  <button
                    onClick={startTest}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold text-lg hover:from-green-600 hover:to-green-700 transition-colors shadow-lg"
                  >
                    🚀 Start Typing Test
                  </button>
                )}
                
                {(isActive || isCompleted) && (
                  <button
                    onClick={resetTest}
                    className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 transition-colors"
                  >
                    🔄 Reset Test
                  </button>
                )}
              </div>

              {!isActive && !isCompleted && (
                <div className="text-center text-gray-600 mt-4">
                  <p className="text-sm">
                    💡 <strong>Tip:</strong> Click on the text area or press any key to start typing
                  </p>
                </div>
              )}
            </div>

            {/* Personal Bests Sidebar */}
            <div className="lg:col-span-1">
              <PersonalBests 
                personalBests={personalBests}
                overallBest={overallBest}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {showResults && isCompleted && (
        <ResultsModal
          result={getTestResult()}
          isNewRecord={isNewRecord}
          personalBest={currentPersonalBest}
          overallBest={overallBest}
          onClose={() => setShowResults(false)}
          onNewTest={() => {
            setShowResults(false);
            setIsNewRecord(false);
            resetTest();
          }}
        />
      )}
    </div>
  );
}

export default App;
