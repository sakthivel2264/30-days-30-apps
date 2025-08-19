// src/services/aiService.ts
import type { Expense, AIRecommendation } from '../types';

class AIService {
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
  }

  async getExpenseRecommendations(expenses: Expense[]): Promise<AIRecommendation[]> {
    if (!this.apiKey) {
      return this.getFallbackRecommendations(expenses);
    }

    try {
      const expenseData = this.prepareExpenseData(expenses);
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku',
          messages: [
            {
              role: 'system',
              content: 'You are a financial advisor AI. Analyze expense data and provide actionable recommendations for budgeting and saving. Return recommendations as JSON array with type, message, priority, and actionable fields.'
            },
            {
              role: 'user',
              content: `Analyze these expenses and provide recommendations: ${JSON.stringify(expenseData)}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error('AI service request failed');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      try {
        return JSON.parse(content);
      } catch {
        return this.parseRecommendationsFromText(content);
      }
    } catch (error) {
      console.error('AI service error:', error);
      return this.getFallbackRecommendations(expenses);
    }
  }

  private prepareExpenseData(expenses: Expense[]) {
    const now = new Date();
    const currentMonth = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === now.getMonth() && 
             expenseDate.getFullYear() === now.getFullYear();
    });

    const categoryTotals = currentMonth.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalExpenses: currentMonth.reduce((sum, exp) => sum + exp.amount, 0),
      categoryBreakdown: categoryTotals,
      transactionCount: currentMonth.length,
      averageTransaction: currentMonth.length > 0 ? 
        currentMonth.reduce((sum, exp) => sum + exp.amount, 0) / currentMonth.length : 0
    };
  }

  private getFallbackRecommendations(expenses: Expense[]): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    if (totalSpent > 50000) {
      recommendations.push({
        type: 'warning',
        message: 'Your monthly spending is quite high. Consider reviewing your largest expense categories.',
        priority: 'high',
        actionable: true
      });
    }

    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0];

    if (topCategory) {
      recommendations.push({
        type: 'budget',
        message: `${topCategory} is your highest expense category at ₹${topCategory.toLocaleString()}. Consider setting a budget limit.`,
        priority: 'medium',
        actionable: true
      });
    }

    recommendations.push({
      type: 'saving',
      message: 'Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.',
      priority: 'low',
      actionable: true
    });

    return recommendations;
  }

  private parseRecommendationsFromText(text: string): AIRecommendation[] {
    // Simple text parsing fallback
    return [{
      type: 'saving',
      message: text.substring(0, 200) + '...',
      priority: 'medium',
      actionable: true
    }];
  }
}

export const aiService = new AIService();
