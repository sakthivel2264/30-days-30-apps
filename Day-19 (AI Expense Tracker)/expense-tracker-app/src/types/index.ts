
// src/types/index.ts
export interface Expense {
  _id?: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod: 'cash' | 'credit' | 'debit' | 'upi';
  tags?: string[];
  createdAt?: Date;
}

export interface AIRecommendation {
  type: 'saving' | 'budget' | 'category' | 'warning';
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export interface BudgetCategory {
  category: string;
  budget: number;
  spent: number;
  percentage: number;
}
