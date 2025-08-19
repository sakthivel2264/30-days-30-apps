// src/App.tsx
import { useState, useEffect } from 'react';
import type { Expense, AIRecommendation } from './types';
import { dbService } from './services/database';
import { aiService } from './services/aiService';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import Dashboard from '@/components/Dashboard';
import AIRecommendations from '@/components/AIRecommendations';
import { PlusCircle, BarChart3, Brain, List } from 'lucide-react';

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'list' | 'ai'>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await dbService.connect();
      await loadExpenses();
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      const fetchedExpenses = await dbService.getExpenses();
      setExpenses(fetchedExpenses);
      
      if (fetchedExpenses.length > 0) {
        const aiRecommendations = await aiService.getExpenseRecommendations(fetchedExpenses);
        setRecommendations(aiRecommendations);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const handleAddExpense = async (expenseData: Omit<Expense, '_id'>) => {
    try {
      const newExpense = await dbService.addExpense(expenseData);
      setExpenses(prev => [newExpense, ...prev]);
      
      // Get updated AI recommendations
      const updatedRecommendations = await aiService.getExpenseRecommendations([newExpense, ...expenses]);
      setRecommendations(updatedRecommendations);
      
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await dbService.deleteExpense(id);
      const updatedExpenses = expenses.filter(expense => expense._id !== id);
      setExpenses(updatedExpenses);
      
      if (updatedExpenses.length > 0) {
        const updatedRecommendations = await aiService.getExpenseRecommendations(updatedExpenses);
        setRecommendations(updatedRecommendations);
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Expense Tracker</h1>
            <div className="text-sm text-gray-500">
              Total: ₹{expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'add', label: 'Add Expense', icon: PlusCircle },
              { id: 'list', label: 'Expenses', icon: List },
              { id: 'ai', label: 'AI Insights', icon: Brain }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as never)}
                  className={`flex items-center space-x-2 py-4 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && <Dashboard expenses={expenses} />}
        {activeTab === 'add' && <ExpenseForm onSubmit={handleAddExpense} />}
        {activeTab === 'list' && <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />}
        {activeTab === 'ai' && <AIRecommendations recommendations={recommendations} />}
      </main>
    </div>
  );
}

export default App;
