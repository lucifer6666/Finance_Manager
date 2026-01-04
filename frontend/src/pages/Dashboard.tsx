import { useEffect, useState } from 'react';
import { useAnalytics, useTransactions, useCreditCards } from '../hooks';
import { AddTransactionForm, InsightPanel, CategoryPieChart, MonthlyChart } from '../components';
import { analyticsApi } from '../api/client';

export const Dashboard = () => {
  const now = new Date();
  const { _, addTransaction } = useTransactions(now.getFullYear(), now.getMonth() + 1);
  const { analytics } = useAnalytics(now.getFullYear(), now.getMonth() + 1);
  const { cards } = useCreditCards();
  const [spendingTrends, setSpendingTrends] = useState<any[]>([]);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await analyticsApi.getSpendingTrends(6);
        setSpendingTrends(response.data);
      } catch (error) {
        console.error('Failed to fetch spending trends:', error);
      }
    };
    fetchTrends();
  }, []);

  if (!analytics) {
    return <div className="flex items-center justify-center h-screen text-black">Loading...</div>;
  }

  const summary = analytics.monthly_summary;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-black">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md">
          <p className="text-sm opacity-90">Total Income</p>
          <p className="text-3xl font-bold">₹{summary.total_income.toLocaleString()}</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow-md">
          <p className="text-sm opacity-90">Total Expense</p>
          <p className="text-3xl font-bold">₹{summary.total_expense.toLocaleString()}</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-md">
          <p className="text-sm opacity-90">Investments</p>
          <p className="text-3xl font-bold">₹{(summary.investments || 0).toLocaleString()}</p>
        </div>
        
        <div className={`bg-gradient-to-br ${summary.savings >= 0 ? 'from-blue-500 to-blue-600' : 'from-red-500 to-red-600'} text-white p-6 rounded-lg shadow-md`}>
          <p className="text-sm opacity-90">Savings</p>
          <p className="text-3xl font-bold">₹{summary.savings.toLocaleString()}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-md">
          <p className="text-sm opacity-90">Savings Rate</p>
          <p className="text-3xl font-bold">
            {summary.total_income > 0 
              ? (summary.savings / summary.total_income * 100).toFixed(1)
              : 0}%
          </p>
        </div>
      </div>

      {/* Insights */}
      {/* <div className="bg-white p-6 rounded-lg shadow-md">
        <InsightPanel insights={analytics.insights} />
      </div> */}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyChart data={spendingTrends} />
        <CategoryPieChart data={summary.top_categories} />
      </div>

      {/* Add Transaction Form */}
      <AddTransactionForm cards={cards} onAdd={addTransaction} />
    </div>
  );
};
