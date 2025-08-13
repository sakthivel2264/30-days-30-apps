
import { useState, useEffect, useCallback } from 'react';
import type { PasswordHistoryEntry } from '../types';
import { PasswordStrengthService } from '../services/passwordStrengthService';

const STORAGE_KEY = 'password-history';

export const usePasswordHistory = () => {
  const [history, setHistory] = useState<PasswordHistoryEntry[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedHistory = JSON.parse(stored).map((entry: any) => ({
          ...entry,
          createdAt: new Date(entry.createdAt),
          expiresAt: entry.expiresAt ? new Date(entry.expiresAt) : undefined
        }));
        setHistory(parsedHistory);
      } catch (error) {
        console.error('Error loading password history:', error);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addToHistory = useCallback((password: string, description?: string, expiryDays?: number) => {
    const strength = PasswordStrengthService.analyzePassword(password);
    const now = new Date();
    
    const entry: PasswordHistoryEntry = {
      id: `pwd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      password,
      strength: strength.score,
      createdAt: now,
      expiresAt: expiryDays ? new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000) : undefined,
      isExpired: false,
      description
    };

    setHistory(prev => [entry, ...prev].slice(0, 50)); // Keep only last 50 entries
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(entry => entry.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getExpiredPasswords = useCallback(() => {
    const now = new Date();
    return history.filter(entry => 
      entry.expiresAt && entry.expiresAt < now
    );
  }, [history]);

  const getPasswordsByStrength = useCallback((minStrength: number) => {
    return history.filter(entry => entry.strength >= minStrength);
  }, [history]);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getExpiredPasswords,
    getPasswordsByStrength
  };
};
