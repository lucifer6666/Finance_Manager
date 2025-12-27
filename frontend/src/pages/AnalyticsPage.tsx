import { useState, useEffect } from 'react';
import { analyticsApi } from '../api/client';
import { MonthlyChart } from '../components';

export const AnalyticsPage = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [spendingTrends, setSpendingTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await analyticsApi.getSpendingTrends(12);
        setSpendingTrends(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-black">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-4 text-black">Analytics</h1>
      </div>

      <div className="flex gap-4 mb-6">
        <label className="flex items-center gap-2 text-black">
          <span>Year:</span>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            min="2020"
            max={new Date().getFullYear() + 1}
            className="px-3 py-2 border rounded-md w-32 text-white bg-gray-700"
          />
        </label>
      </div>

      {spendingTrends.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <MonthlyChart data={spendingTrends} title="12-Month Spending Trends" />
        </div>
      )}

      {spendingTrends.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{spendingTrends.reduce((sum, item) => sum + item.income, 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Expense</p>
              <p className="text-2xl font-bold text-red-600">
                ₹{spendingTrends.reduce((sum, item) => sum + item.expense, 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Savings</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{spendingTrends.reduce((sum, item) => sum + item.savings, 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Monthly Savings</p>
              <p className="text-2xl font-bold text-purple-600">
                ₹{(spendingTrends.reduce((sum, item) => sum + item.savings, 0) / spendingTrends.length).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
