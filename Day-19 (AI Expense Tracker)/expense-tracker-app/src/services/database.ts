// src/services/database.ts
import type { Expense } from '../types';

class DatabaseService {
  private baseURL = 'http://localhost:5000/api';

  async connect(): Promise<void> {
    try {
      // Test connection to backend API
      const response = await fetch(`${this.baseURL}/health`);
      if (response.ok) {
        console.log('Connected to backend API');
      } else {
        throw new Error('Backend API not responding');
      }
    } catch (error) {
      console.error('Backend API connection error:', error);
      console.log('Using localStorage as fallback');
    }
  }

  async addExpense(expense: Omit<Expense, '_id'>): Promise<Expense> {
    try {
      const response = await fetch(`${this.baseURL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...expense,
          createdAt: new Date()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add expense to backend');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error adding expense:', error);
      // Fallback to localStorage
      const expenses = this.getLocalExpenses();
      const newExpense = {
        ...expense,
        _id: Date.now().toString(),
        createdAt: new Date()
      };
      expenses.push(newExpense);
      localStorage.setItem('expenses', JSON.stringify(expenses));
      return newExpense;
    }
  }

  async getExpenses(): Promise<Expense[]> {
    try {
      const response = await fetch(`${this.baseURL}/expenses`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch expenses from backend');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching expenses:', error);
      // Fallback to localStorage
      return this.getLocalExpenses();
    }
  }

  async deleteExpense(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/expenses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense from backend');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      // Fallback to localStorage
      const expenses = this.getLocalExpenses();
      const filteredExpenses = expenses.filter(expense => expense._id !== id);
      localStorage.setItem('expenses', JSON.stringify(filteredExpenses));
    }
  }

  private getLocalExpenses(): Expense[] {
    try {
      const stored = localStorage.getItem('expenses');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async disconnect(): Promise<void> {
    // No need to disconnect from API, but keeping method for compatibility
    console.log('API connection closed');
  }
}

export const dbService = new DatabaseService();
