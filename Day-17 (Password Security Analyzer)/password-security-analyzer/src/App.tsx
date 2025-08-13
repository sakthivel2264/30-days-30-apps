import React, { useState, useCallback } from 'react';
import { PasswordStrengthService } from './services/passwordStrengthService';
import { usePasswordHistory } from './hooks/usePasswordHistory';
import PasswordStrengthMeter from './components/PasswordStrengthMeter';
import PasswordGenerator from './components/PasswordGenerator';
import BreachCheck from './components/BreachCheck';
import PasswordHistory from './components/PasswordHistory';
import { Shield, Key, Search, Clock, Eye, EyeOff } from 'lucide-react';

function App() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'analyzer' | 'generator' | 'breach' | 'history'>('analyzer');
  
  const { addToHistory } = usePasswordHistory();
  
  const strength = PasswordStrengthService.analyzePassword(password);

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
  };

  const handlePasswordGenerated = useCallback((generatedPassword: string) => {
    setPassword(generatedPassword);
    setActiveTab('analyzer');
    
    // Add to history if it's a strong password
    if (PasswordStrengthService.analyzePassword(generatedPassword).score >= 2) {
      addToHistory(generatedPassword, 'Generated password');
    }
  }, [addToHistory]);

  const handleSaveToHistory = () => {
    if (password && strength.score >= 1) {
      addToHistory(password, 'Manual entry', 90); // 90 days expiry
    }
  };

  const TabButton: React.FC<{
    id: string;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
  }> = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              Password Security Analyzer
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Analyze password strength, check for breaches, and generate secure passwords
          </p>
        </header>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <TabButton
            id="analyzer"
            label="Analyzer"
            icon={<Shield className="w-4 h-4" />}
            isActive={activeTab === 'analyzer'}
            onClick={() => setActiveTab('analyzer')}
          />
          <TabButton
            id="generator"
            label="Generator"
            icon={<Key className="w-4 h-4" />}
            isActive={activeTab === 'generator'}
            onClick={() => setActiveTab('generator')}
          />
          <TabButton
            id="breach"
            label="Breach Check"
            icon={<Search className="w-4 h-4" />}
            isActive={activeTab === 'breach'}
            onClick={() => setActiveTab('breach')}
          />
          <TabButton
            id="history"
            label="History"
            icon={<Clock className="w-4 h-4" />}
            isActive={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
          />
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'analyzer' && (
            <div className="max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Password Input */}
                <div className="security-card">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">
                    Password Analysis
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter password to analyze:
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          placeholder="Enter your password..."
                          className="password-input pr-10"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {password && (
                      <div className="space-y-4">
                        <PasswordStrengthMeter 
                          strength={strength} 
                          password={password}
                          showDetails={true}
                        />
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={handleSaveToHistory}
                            className="btn-secondary"
                            disabled={!password || strength.score < 1}
                          >
                            Save to History
                          </button>
                          <button
                            onClick={() => setActiveTab('generator')}
                            className="btn-primary"
                          >
                            Generate Better Password
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-6">
                  <div className="security-card">
                    <h4 className="font-semibold text-gray-800 mb-4">Password Insights</h4>
                    
                    {password ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Length:</span>
                          <span className="font-medium">{password.length} characters</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estimated crack time:</span>
                          <span className="font-medium">
                            {PasswordStrengthService.estimateCrackTime(password)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Entropy:</span>
                          <span className="font-medium">
                            {PasswordStrengthService.getPasswordEntropy(password).toFixed(1)} bits
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        Enter a password to see detailed insights
                      </p>
                    )}
                  </div>

                  {/* Common Issues */}
                  {password && (
                    <div className="security-card">
                      <h4 className="font-semibold text-gray-800 mb-4">Security Issues</h4>
                      
                      {(() => {
                        const issues = PasswordStrengthService.checkCommonPatterns(password);
                        return issues.length > 0 ? (
                          <ul className="space-y-2">
                            {issues.map((issue, index) => (
                              <li key={index} className="flex items-start space-x-2 text-sm">
                                <span className="text-red-500 mt-1">•</span>
                                <span className="text-red-700">{issue}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-green-600 text-sm">No common security issues detected!</p>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'generator' && (
            <div className="max-w-4xl mx-auto">
              <PasswordGenerator onPasswordGenerated={handlePasswordGenerated} />
            </div>
          )}

          {activeTab === 'breach' && (
            <div className="max-w-4xl mx-auto">
              <BreachCheck />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto">
              <PasswordHistory />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-500 text-sm">
          <p>
            🔒 Your security is our priority • All password analysis happens locally in your browser
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
