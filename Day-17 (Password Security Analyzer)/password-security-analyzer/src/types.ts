export interface PasswordStrength {
  score: number; // 0-4 (from zxcvbn)
  label: string;
  color: string;
  percentage: number;
  feedback: {
    warning: string;
    suggestions: string[];
  };
}

export interface PasswordHistoryEntry {
  id: string;
  password: string;
  strength: number;
  createdAt: Date;
  expiresAt?: Date;
  isExpired: boolean;
  description?: string;
}

export interface BreachCheckResult {
  isBreached: boolean;
  breachCount: number;
  breaches: BreachDetails[];
  checkDate: Date;
}

export interface BreachDetails {
  name: string;
  date: string;
  description: string;
  dataClasses: string[];
  verified: boolean;
  pwnCount?: number;
}

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
  customCharacters?: string;
  excludeCharacters?: string;
}

export interface SecuritySettings {
  passwordExpiryDays: number;
  minPasswordStrength: number;
  enableBreachCheck: boolean;
  autoCheckOnEntry: boolean;
  showPasswordInHistory: boolean;
}
