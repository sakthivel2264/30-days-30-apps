import type { PasswordGeneratorOptions } from '../types';

export class PasswordGeneratorService {
  private static readonly CHARACTER_SETS = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    similar: 'il1Lo0O',
    ambiguous: '{}[]()/\\\'"`~,;.<>'
  };

  static generatePassword(options: PasswordGeneratorOptions): string {
    let charset = '';
    
    // Build character set based on options
    if (options.includeLowercase) {
      charset += this.CHARACTER_SETS.lowercase;
    }
    
    if (options.includeUppercase) {
      charset += this.CHARACTER_SETS.uppercase;
    }
    
    if (options.includeNumbers) {
      charset += this.CHARACTER_SETS.numbers;
    }
    
    if (options.includeSymbols) {
      charset += this.CHARACTER_SETS.symbols;
    }
    
    if (options.customCharacters) {
      charset += options.customCharacters;
    }
    
    // Remove similar/ambiguous characters if requested
    if (options.excludeSimilar) {
      charset = charset.split('').filter(char => 
        !this.CHARACTER_SETS.similar.includes(char)
      ).join('');
    }
    
    if (options.excludeAmbiguous) {
      charset = charset.split('').filter(char => 
        !this.CHARACTER_SETS.ambiguous.includes(char)
      ).join('');
    }
    
    // Remove excluded characters
    if (options.excludeCharacters) {
      charset = charset.split('').filter(char => 
        !options.excludeCharacters!.includes(char)
      ).join('');
    }
    
    if (!charset) {
      throw new Error('No characters available for password generation');
    }
    
    return this.generateSecurePassword(charset, options.length);
  }

  private static generateSecurePassword(charset: string, length: number): string {
    let password = '';
    
    // Use crypto.getRandomValues for better randomness
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }
    
    return password;
  }

  static generateMultiplePasswords(options: PasswordGeneratorOptions, count: number = 5): string[] {
    const passwords: string[] = [];
    
    for (let i = 0; i < count; i++) {
      passwords.push(this.generatePassword(options));
    }
    
    return passwords;
  }

  static generatePassphrase(wordCount: number = 4): string {
    // Simple word list for passphrase generation
    const words = [
      'correct', 'horse', 'battery', 'staple', 'mountain', 'river', 'sunset', 'ocean',
      'forest', 'rainbow', 'thunder', 'whisper', 'dancing', 'keyboard', 'journey',
      'crystal', 'guitar', 'painting', 'garden', 'butterfly', 'telescope', 'adventure',
      'lighthouse', 'melody', 'diamond', 'volcano', 'penguin', 'telescope', 'carnival',
      'treasure', 'moonlight', 'symphony', 'cascade', 'horizon', 'mystery', 'harmony'
    ];
    
    const selectedWords: string[] = [];
    
    for (let i = 0; i < wordCount; i++) {
      const randomIndex = Math.floor(Math.random() * words.length);
      selectedWords.push(words[randomIndex]);
    }
    
    return selectedWords.join('-');
  }
}
