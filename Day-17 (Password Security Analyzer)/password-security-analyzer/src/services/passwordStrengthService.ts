import zxcvbn from 'zxcvbn';
import type { PasswordStrength } from '../types';

export class PasswordStrengthService {
  static analyzePassword(password: string): PasswordStrength {
    if (!password) {
      return {
        score: 0,
        label: 'No Password',
        color: '#9ca3af',
        percentage: 0,
        feedback: {
          warning: 'Please enter a password',
          suggestions: ['Enter a password to see strength analysis']
        }
      };
    }

    const result = zxcvbn(password);
    
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#059669'];
    
    return {
      score: result.score,
      label: strengthLabels[result.score],
      color: strengthColors[result.score],
      percentage: ((result.score + 1) / 5) * 100,
      feedback: {
        warning: result.feedback.warning || '',
        suggestions: result.feedback.suggestions || []
      }
    };
  }

  static getPasswordEntropy(password: string): number {
    const result = zxcvbn(password);
    return Math.log2(result.guesses);
  }

  static estimateCrackTime(password: string): string {
    const result = zxcvbn(password);
    return result.crack_times_display.offline_slow_hashing_1e4_per_second;
  }

  static checkCommonPatterns(password: string): string[] {
    const issues: string[] = [];
    
    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
      issues.push('Contains repeated characters');
    }
    
    if (/123|abc|qwe|asd/i.test(password)) {
      issues.push('Contains keyboard sequences');
    }
    
    if (/password|123456|qwerty/i.test(password)) {
      issues.push('Contains common password patterns');
    }
    
    if (password.length < 8) {
      issues.push('Password is too short (minimum 8 characters)');
    }
    
    if (!/[A-Z]/.test(password)) {
      issues.push('Missing uppercase letters');
    }
    
    if (!/[a-z]/.test(password)) {
      issues.push('Missing lowercase letters');
    }
    
    if (!/[0-9]/.test(password)) {
      issues.push('Missing numbers');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      issues.push('Missing special characters');
    }
    
    return issues;
  }
}
