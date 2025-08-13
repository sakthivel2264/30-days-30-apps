import React, { useState, useCallback } from 'react';
import type { PasswordGeneratorOptions } from '../types';
import { PasswordGeneratorService } from '../services/passwordGeneratorService';
import { RefreshCw, Copy, Settings, Wand2 } from 'lucide-react';

interface PasswordGeneratorProps {
  onPasswordGenerated: (password: string) => void;
}

const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onPasswordGenerated }) => {
  const [options, setOptions] = useState<PasswordGeneratorOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
    customCharacters: '',
    excludeCharacters: ''
  });

  const [generatedPasswords, setGeneratedPasswords] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const generatePasswords = useCallback(() => {
    try {
      const passwords = PasswordGeneratorService.generateMultiplePasswords(options, 5);
      setGeneratedPasswords(passwords);
      if (passwords.length > 0) {
        onPasswordGenerated(passwords[0]);
      }
    } catch (error) {
      console.error('Password generation failed:', error);
    }
  }, [options, onPasswordGenerated]);

  const generatePassphrase = useCallback(() => {
    const passphrase = PasswordGeneratorService.generatePassphrase(4);
    setGeneratedPasswords([passphrase]);
    onPasswordGenerated(passphrase);
  }, [onPasswordGenerated]);

  const copyToClipboard = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
    } catch (error) {
      console.error('Failed to copy password:', error);
    }
  };

  const updateOption = (key: keyof PasswordGeneratorOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="security-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Password Generator</h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="btn-secondary"
        >
          <Settings className="w-4 h-4 mr-2" />
          Advanced
        </button>
      </div>

      {/* Basic Options */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password Length: {options.length}
          </label>
          <input
            type="range"
            min="8"
            max="64"
            value={options.length}
            onChange={(e) => updateOption('length', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>8</span>
            <span>32</span>
            <span>64</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.includeUppercase}
              onChange={(e) => updateOption('includeUppercase', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Uppercase (A-Z)</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.includeLowercase}
              onChange={(e) => updateOption('includeLowercase', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Lowercase (a-z)</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.includeNumbers}
              onChange={(e) => updateOption('includeNumbers', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Numbers (0-9)</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.includeSymbols}
              onChange={(e) => updateOption('includeSymbols', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Symbols (!@#)</span>
          </label>
        </div>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800">Advanced Options</h4>
          
          <div className="grid grid-cols-1 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.excludeSimilar}
                onChange={(e) => updateOption('excludeSimilar', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Exclude similar characters (il1Lo0O)</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.excludeAmbiguous}
                onChange={(e) => updateOption('excludeAmbiguous', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Exclude ambiguous characters ({}[]()...)</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Include Characters
              </label>
              <input
                type="text"
                value={options.customCharacters || ''}
                onChange={(e) => updateOption('customCharacters', e.target.value)}
                placeholder="Additional characters..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exclude Characters
              </label>
              <input
                type="text"
                value={options.excludeCharacters || ''}
                onChange={(e) => updateOption('excludeCharacters', e.target.value)}
                placeholder="Characters to exclude..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Generation Buttons */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={generatePasswords}
          className="btn-primary flex-1"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Generate Passwords
        </button>
        
        <button
          onClick={generatePassphrase}
          className="btn-secondary"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Passphrase
        </button>
      </div>

      {/* Generated Passwords */}
      {generatedPasswords.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Generated Passwords:</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scroll">
            {generatedPasswords.map((password, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <code className="text-sm font-mono text-gray-800 flex-1 mr-3 break-all">
                  {password}
                </code>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onPasswordGenerated(password)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Use
                  </button>
                  <button
                    onClick={() => copyToClipboard(password)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordGenerator;
