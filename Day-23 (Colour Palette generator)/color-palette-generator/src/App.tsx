import React, { useState, useEffect } from 'react';

interface Color {
  hex: string;
  name: string;
}

interface Palette {
  id: string;
  colors: Color[];
  aiDescription: string;
  createdAt: string;
}

const ColorPaletteGenerator: React.FC = () => {
  const [currentPalette, setCurrentPalette] = useState<Palette | null>(null);
  const [paletteHistory, setPaletteHistory] = useState<Palette[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Color names for AI context
  const colorNames = [
    'Sunset', 'Ocean', 'Forest', 'Lavender', 'Coral', 'Mint', 'Peach', 'Sky',
    'Rose', 'Sage', 'Amber', 'Ivory', 'Slate', 'Crimson', 'Teal', 'Mauve'
  ];

  useEffect(() => {
    // Load API key and palette history from localStorage
    const savedApiKey = import.meta.env.VITE_API
    const savedHistory = localStorage.getItem('palette_history');
    
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedHistory) setPaletteHistory(JSON.parse(savedHistory));
    
    // Generate initial palette
    generateRandomPalette();
  }, []);

  // Generate random hex color
  const generateRandomColor = (): string => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  };

  // Generate random palette
  const generateRandomPalette = async () => {
    setIsGenerating(true);
    
    const colors: Color[] = [];
    for (let i = 0; i < 5; i++) {
      colors.push({
        hex: generateRandomColor(),
        name: colorNames[Math.floor(Math.random() * colorNames.length)]
      });
    }

    const newPalette: Palette = {
      id: Date.now().toString(),
      colors,
      aiDescription: '',
      createdAt: new Date().toISOString()
    };

    setCurrentPalette(newPalette);
    setIsGenerating(false);

    // Get AI description if API key is available
    if (apiKey) {
      await getAIDescription(newPalette);
    }
  };

  // Get AI description from OpenRouter
  const getAIDescription = async (palette: Palette) => {
    if (!apiKey) return;

    setIsLoadingAI(true);
    try {
      const colorList = palette.colors.map(c => `${c.name} (${c.hex})`).join(', ');
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Color Palette Generator'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku',
          messages: [{
            role: 'user',
            content: `Create a creative, inspiring description for this color palette: ${colorList}. 
                     Describe the mood, potential use cases, and what feelings or themes this palette evokes. 
                     Keep it under 100 words and make it engaging.`
          }],
          temperature: 0.8,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const description = data.choices[0]?.message?.content || 'A beautiful color palette with harmonious tones.';
      
      const updatedPalette = { ...palette, aiDescription: description };
      setCurrentPalette(updatedPalette);
      
      // Save to history
      const newHistory = [updatedPalette, ...paletteHistory.slice(0, 9)];
      setPaletteHistory(newHistory);
      localStorage.setItem('palette_history', JSON.stringify(newHistory));
      
    } catch (error) {
      console.error('AI Description Error:', error);
      const fallbackDescription = 'A carefully curated palette with balanced colors that work beautifully together.';
      setCurrentPalette(prev => prev ? { ...prev, aiDescription: fallbackDescription } : null);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Copy color to clipboard
  const copyToClipboard = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedColor(hex);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  // Save API key
  const saveApiKey = () => {
    localStorage.setItem('openrouter_api_key', apiKey);
    setShowApiInput(false);
  };

  // Export palette as CSS
  const exportAsCSS = () => {
    if (!currentPalette) return;
    
    const cssVariables = currentPalette.colors
      .map((color, index) => `  --color-${index + 1}: ${color.hex};`)
      .join('\n');
    
    const cssContent = `:root {\n${cssVariables}\n}`;
    
    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palette-${currentPalette.id}.css`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export palette as JSON
  const exportAsJSON = () => {
    if (!currentPalette) return;
    
    const blob = new Blob([JSON.stringify(currentPalette, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palette-${currentPalette.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent">
            Color Palette Generator
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Generate beautiful color palettes with AI-powered descriptions
          </p>
          
          {/* API Key Input */}
          <div className="mb-6">
            {!apiKey || showApiInput ? (
              <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                <input
                  type="password"
                  placeholder="Enter OpenRouter API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <button
                  onClick={saveApiKey}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Save Key
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowApiInput(true)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                🔑 API Key Configured
              </button>
            )}
          </div>
        </div>

        {/* Current Palette */}
        {currentPalette && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
            {/* Color Swatches */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
              {currentPalette.colors.map((color, index) => (
                <div
                  key={index}
                  className="group relative"
                >
                  <div
                    className="w-full h-32 rounded-xl cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    style={{ backgroundColor: color.hex }}
                    onClick={() => copyToClipboard(color.hex)}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-colors duration-300 flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold">
                        {copiedColor === color.hex ? '✓ Copied!' : 'Click to Copy'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-white font-semibold">{color.name}</p>
                    <p className="text-gray-300 text-sm font-mono">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Description */}
            <div className="mb-6">
              <h3 className="text-white text-lg font-semibold mb-2">AI Description</h3>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                {isLoadingAI ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-pink-400 border-t-transparent"></div>
                    Generating AI description...
                  </div>
                ) : (
                  <p className="text-gray-300 leading-relaxed">
                    {currentPalette.aiDescription}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={generateRandomPalette}
                disabled={isGenerating}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : '🎨 Generate New Palette'}
              </button>
              
              <button
                onClick={exportAsCSS}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                📄 Export CSS
              </button>
              
              <button
                onClick={exportAsJSON}
                className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                💾 Export JSON
              </button>
            </div>
          </div>
        )}

        {/* Palette History */}
        {paletteHistory.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-white text-2xl font-bold mb-6">Recent Palettes</h2>
            
            <div className="grid gap-4">
              {paletteHistory.map((palette) => (
                <div
                  key={palette.id}
                  className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                  onClick={() => setCurrentPalette(palette)}
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex gap-2">
                      {palette.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 rounded-full border-2 border-white/20"
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                    </div>
                    <span className="text-gray-400 text-sm">
                      {new Date(palette.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {palette.aiDescription && (
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {palette.aiDescription}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400">
          <p>Click on colors to copy hex codes • Export palettes for use in your projects</p>
          <p className="text-sm mt-2">
            Powered by OpenRouter API • Get your free API key at{' '}
            <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300">
              openrouter.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteGenerator;
