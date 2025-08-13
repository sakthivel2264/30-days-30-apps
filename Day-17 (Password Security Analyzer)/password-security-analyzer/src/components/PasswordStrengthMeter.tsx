import React from 'react';
import type { PasswordStrength } from '../types';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface PasswordStrengthMeterProps {
  strength: PasswordStrength;
  password: string;
  showDetails?: boolean;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ 
  strength, 
  password,
  showDetails = true 
}) => {
  const getStrengthIcon = () => {
    switch (strength.score) {
      case 0:
      case 1:
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 2:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 3:
        return <Shield className="w-5 h-5 text-blue-500" />;
      case 4:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Strength Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStrengthIcon()}
            <span className="text-sm font-medium text-gray-700">
              Password Strength: <span style={{ color: strength.color }}>{strength.label}</span>
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {strength.percentage.toFixed(0)}%
          </span>
        </div>
        
        <div className="strength-meter">
          <div 
            className="strength-bar"
            style={{
              width: `${strength.percentage}%`,
              backgroundColor: strength.color
            }}
          />
        </div>
      </div>

      {/* Detailed Feedback */}
      {showDetails && password && (
        <div className="space-y-3">
          {/* Warning */}
          {strength.feedback.warning && (
            <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-yellow-800">{strength.feedback.warning}</span>
            </div>
          )}

          {/* Suggestions */}
          {strength.feedback.suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Suggestions:</h4>
              <ul className="space-y-1">
                {strength.feedback.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Password Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-gray-500">Length:</span>
              <span className="font-medium ml-2">{password.length} characters</span>
            </div>
            <div className="space-y-1">
              <span className="text-gray-500">Character Types:</span>
              <div className="flex space-x-1 ml-2">
                {/[a-z]/.test(password) && <span className="text-green-600">a-z</span>}
                {/[A-Z]/.test(password) && <span className="text-green-600">A-Z</span>}
                {/[0-9]/.test(password) && <span className="text-green-600">0-9</span>}
                {/[!@#$%^&*(),.?":{}|<>]/.test(password) && <span className="text-green-600">!@#</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
