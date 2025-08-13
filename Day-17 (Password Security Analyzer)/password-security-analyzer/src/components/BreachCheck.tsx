import React, { useState } from 'react';
import type { BreachCheckResult } from '../types';
import { BreachCheckService } from '../services/breachCheckService';
import { Shield, AlertTriangle, Search, Mail, Calendar, Database } from 'lucide-react';
import { format } from 'date-fns';

const BreachCheck: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<BreachCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkBreach = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const breachResult = await BreachCheckService.checkEmailBreach(email);
      setResult(breachResult);
    } catch (err) {
      setError('Failed to check for breaches. Please try again.');
      console.error('Breach check error:', err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkBreach();
    }
  };

  return (
    <div className="security-card">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Data Breach Check</h3>
      </div>

      {/* Search Input */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter your email address to check for data breaches:
          </label>
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="your.email@example.com"
                className="password-input pl-10"
                disabled={isChecking}
              />
            </div>
            <button
              onClick={checkBreach}
              disabled={isChecking || !email}
              className="btn-primary"
            >
              {isChecking ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="breach-result space-y-4">
          {/* Status Summary */}
          <div className={`p-4 rounded-lg border ${
            result.isBreached 
              ? 'bg-red-50 border-red-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center space-x-3">
              {result.isBreached ? (
                <AlertTriangle className="w-6 h-6 text-red-500" />
              ) : (
                <Shield className="w-6 h-6 text-green-500" />
              )}
              <div>
                <h4 className={`font-semibold ${
                  result.isBreached ? 'text-red-800' : 'text-green-800'
                }`}>
                  {result.isBreached 
                    ? `Found in ${result.breachCount} data breach${result.breachCount > 1 ? 'es' : ''}` 
                    : 'No breaches found'
                  }
                </h4>
                <p className={`text-sm ${
                  result.isBreached ? 'text-red-600' : 'text-green-600'
                }`}>
                  {result.isBreached 
                    ? 'Your email address was found in known data breaches' 
                    : 'Your email address was not found in any known data breaches'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Breach Details */}
          {result.breaches.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">Breach Details:</h4>
              {result.breaches.map((breach, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-semibold text-gray-800">{breach.name}</h5>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(breach.date), 'MMM dd, yyyy')}</span>
                        </div>
                        {breach.pwnCount && (
                          <div className="flex items-center space-x-1">
                            <Database className="w-3 h-3" />
                            <span>{breach.pwnCount.toLocaleString()} accounts</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {breach.verified && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{breach.description}</p>
                  
                  {breach.dataClasses.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Compromised data:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {breach.dataClasses.map((dataClass, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                          >
                            {dataClass}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {result.isBreached && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">🛡️ Recommended Actions:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Change your password immediately if you're still using the same one</li>
                <li>• Enable two-factor authentication on all important accounts</li>
                <li>• Monitor your accounts for suspicious activity</li>
                <li>• Consider using a password manager to generate unique passwords</li>
                <li>• Be cautious of phishing emails that might reference this breach</li>
              </ul>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            Last checked: {format(result.checkDate, 'MMM dd, yyyy HH:mm')}
          </div>
        </div>
      )}

      {/* Information Note */}
      <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> This tool checks against known data breaches using free APIs. 
          For the most comprehensive check, consider using premium services like HaveIBeenPwned.
        </p>
      </div>
    </div>
  );
};

export default BreachCheck;
