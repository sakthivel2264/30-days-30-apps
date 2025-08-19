// src/components/Dashboard.tsx
import React from 'react';
import type { Expense } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface DashboardProps {
  expenses: Expense[];
}

const Dashboard: React.FC<DashboardProps> = ({ expenses }) => {
  const now = new Date();
  const currentMonth = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startOfMonth(now) && expenseDate <= endOfMonth(now);
  });

  const lastMonth = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return expenseDate >= startOfMonth(lastMonthDate) && expenseDate <= endOfMonth(lastMonthDate);
  });

  const currentTotal = currentMonth.reduce((sum, exp) => sum + exp.amount, 0);
  const lastTotal = lastMonth.reduce((sum, exp) => sum + exp.amount, 0);
  const percentageChange = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0;

  const categoryTotals = currentMonth.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">This Month</dt>
                  <dd className="text-lg font-medium text-gray-900">₹{currentTotal.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {percentageChange >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-red-400" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-green-400" />
                )}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">vs Last Month</dt>
                  <dd className={`text-lg font-medium ${percentageChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Transactions</dt>
                  <dd className="text-lg font-medium text-gray-900">{currentMonth.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Daily Average</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₹{currentMonth.length > 0 ? (currentTotal / now.getDate()).toLocaleString() : '0'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Categories This Month</h3>
          {topCategories.length > 0 ? (
            <div className="space-y-4">
              {topCategories.map(([category, amount]) => {
                const percentage = (amount / currentTotal) * 100;
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900">{category}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 w-16 text-right">
                        ₹{amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No expenses recorded for this month.</p>
          )}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Expenses</h3>
          {expenses.length > 0 ? (
            <div className="space-y-3">
              {expenses.slice(0, 5).map(expense => (
                <div key={expense._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                    <p className="text-sm text-gray-500">{expense.category} • {format(new Date(expense.date), 'MMM dd')}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">₹{expense.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No expenses recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
