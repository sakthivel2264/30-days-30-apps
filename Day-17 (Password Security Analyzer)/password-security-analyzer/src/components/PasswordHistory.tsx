import React, { useState } from 'react';
import { usePasswordHistory } from '../hooks/usePasswordHistory';
import { Clock, Trash2, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { format, isAfter } from 'date-fns';

const PasswordHistory: React.FC = () => {
  const { 
    history, 
    removeFromHistory, 
    clearHistory, 
    getExpiredPasswords 
  } = usePasswordHistory();
  
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [filter, setFilter] = useState<'all' | 'expired' | 'strong'>('all');

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getStrengthLabel = (score: number) => {
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[score] || 'Unknown';
  };

  const getStrengthColor = (score: number) => {
    const colors = ['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-blue-600', 'text-green-600'];
    return colors[score] || 'text-gray-600';
  };

  const filteredHistory = history.filter(entry => {
    switch (filter) {
      case 'expired':
        return entry.expiresAt && isAfter(new Date(), entry.expiresAt);
      case 'strong':
        return entry.strength >= 3;
      default:
        return true;
    }
  });

  const expiredCount = getExpiredPasswords().length;

  if (history.length === 0) {
    return (
      <div className="security-card text-center">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Password History</h3>
        <p className="text-gray-600">
          Generated and analyzed passwords will appear here for easy reference and management.
        </p>
      </div>
    );
  }

  return (
    <div className="security-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Password History</h3>
          {expiredCount > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              {expiredCount} expired
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1"
          >
            <option value="all">All Passwords</option>
            <option value="expired">Expired Only</option>
            <option value="strong">Strong Only</option>
          </select>
          
          <button
            onClick={clearHistory}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scroll">
        {filteredHistory.map((entry) => {
          const isExpired = entry.expiresAt && isAfter(new Date(), entry.expiresAt);
          const isVisible = showPasswords[entry.id];
          
          return (
            <div
              key={entry.id}
              className={`p-4 rounded-lg border transition-colors ${
                isExpired 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-sm font-medium ${getStrengthColor(entry.strength)}`}>
                      {getStrengthLabel(entry.strength)}
                    </span>
                    {isExpired && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-xs">Expired</span>
                      </div>
                    )}
                    {entry.strength >= 3 && !isExpired && (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Created: {format(entry.createdAt, 'MMM dd, yyyy HH:mm')}</div>
                    {entry.expiresAt && (
                      <div>Expires: {format(entry.expiresAt, 'MMM dd, yyyy')}</div>
                    )}
                    {entry.description && (
                      <div className="text-gray-700">{entry.description}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => togglePasswordVisibility(entry.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => removeFromHistory(entry.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="font-mono text-sm bg-white border rounded p-2">
                {isVisible ? entry.password : '••••••••••••••••'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordHistory;
