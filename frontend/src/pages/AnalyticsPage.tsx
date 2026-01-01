import { useState, useEffect } from 'react';
import { analyticsApi } from '../api/client';
import { MonthlyChart, CategoryPieChart } from '../components';

export const AnalyticsPage = () => {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [viewMode, setViewMode] = useState<'trends' | 'monthly'>('trends');
  const [spendingTrends, setSpendingTrends] = useState<any[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch spending trends
  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      try {
        const response = await analyticsApi.getSpendingTrends(12, year);
        setSpendingTrends(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    if (viewMode === 'trends') {
      fetchTrends();
    }
  }, [viewMode, year]);

  // Fetch monthly data
  useEffect(() => {
    const fetchMonthlyData = async () => {
      setLoading(true);
      try {
        const [summaryResponse, insightsResponse] = await Promise.all([
          analyticsApi.getMonthly(year, month),
          analyticsApi.getInsights(year, month),
        ]);
        setMonthlySummary(summaryResponse.data);
        setInsights(insightsResponse.data);
      } catch (error) {
        console.error('Failed to fetch monthly data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (viewMode === 'monthly') {
      fetchMonthlyData();
    }
  }, [year, month, viewMode]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('₹', '₹');
  };

  const getInsightClass = (severity: string) => {
    if (severity === 'alert') {
      return 'bg-red-50 border-red-600';
    } else if (severity === 'warning') {
      return 'bg-yellow-50 border-yellow-600';
    } else {
      return 'bg-blue-50 border-blue-600';
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-black">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-4 text-black">Analytics</h1>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setViewMode('trends')}
          className={`px-4 py-2 rounded-md font-semibold transition ${
            viewMode === 'trends'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-black hover:bg-gray-300'
          }`}
        >
          📊 Spending Trends
        </button>
        <button
          onClick={() => setViewMode('monthly')}
          className={`px-4 py-2 rounded-md font-semibold transition ${
            viewMode === 'monthly'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-black hover:bg-gray-300'
          }`}
        >
          📅 Monthly Analysis
        </button>
      </div>

      {/* Trends View */}
      {viewMode === 'trends' && (
        <div className="space-y-6">
          <div className="flex gap-4 mb-6">
            <label className="flex items-center gap-2 text-black">
              <span>Year:</span>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number.parseInt(e.target.value))}
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
              <h2 className="text-2xl font-bold mb-4">Yearly Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="border-l-4 border-green-600 pl-4">
                  <p className="text-sm text-gray-600 mb-1">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(spendingTrends.reduce((sum, item) => sum + item.income, 0))}
                  </p>
                </div>
                <div className="border-l-4 border-red-600 pl-4">
                  <p className="text-sm text-gray-600 mb-1">Total Expense</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(spendingTrends.reduce((sum, item) => sum + item.expense, 0))}
                  </p>
                </div>
                <div className="border-l-4 border-orange-600 pl-4">
                  <p className="text-sm text-gray-600 mb-1">Total Investments</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(spendingTrends.reduce((sum, item) => sum + (item.investments || 0), 0))}
                  </p>
                </div>
                <div className="border-l-4 border-blue-600 pl-4">
                  <p className="text-sm text-gray-600 mb-1">Total Savings</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(spendingTrends.reduce((sum, item) => sum + item.savings, 0))}
                  </p>
                </div>
                <div className="border-l-4 border-purple-600 pl-4">
                  <p className="text-sm text-gray-600 mb-1">Avg Monthly Savings</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(spendingTrends.reduce((sum, item) => sum + item.savings, 0) / spendingTrends.length)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {spendingTrends.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Monthly Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 border-b-2">
                    <tr>
                      <th className="px-4 py-2 text-black font-bold">Month</th>
                      <th className="px-4 py-2 text-black font-bold text-right">Income</th>
                      <th className="px-4 py-2 text-black font-bold text-right">Expense</th>
                      <th className="px-4 py-2 text-black font-bold text-right">Investments</th>
                      <th className="px-4 py-2 text-black font-bold text-right">Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spendingTrends.map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 text-black">{item.month}</td>
                        <td className="px-4 py-2 text-right text-green-600 font-semibold">{formatCurrency(item.income)}</td>
                        <td className="px-4 py-2 text-right text-red-600 font-semibold">{formatCurrency(item.expense)}</td>
                        <td className="px-4 py-2 text-right text-orange-600 font-semibold">{formatCurrency(item.investments || 0)}</td>
                        <td className="px-4 py-2 text-right text-blue-600 font-semibold">{formatCurrency(item.savings)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monthly Analysis View */}
      {viewMode === 'monthly' && (
        <div className="space-y-6">
          <div className="flex gap-4 mb-6 flex-wrap">
            <label className="flex items-center gap-2 text-black">
              <span>Year:</span>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number.parseInt(e.target.value))}
                min="2020"
                max={new Date().getFullYear() + 1}
                className="px-3 py-2 border rounded-md w-32 text-white bg-gray-700"
              />
            </label>
            <label className="flex items-center gap-2 text-black">
              <span>Month:</span>
              <select
                value={month}
                onChange={(e) => setMonth(Number.parseInt(e.target.value))}
                className="px-3 py-2 border rounded-md text-white bg-gray-700"
              >
                {months.map((m, idx) => (
                  <option key={idx} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {monthlySummary && (
            <>
              {/* Monthly Summary Cards */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-black">
                  {months[month - 1]} {year} Summary
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="border-l-4 border-green-600 pl-4">
                    <p className="text-sm text-gray-600 mb-1">Income</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(monthlySummary.total_income)}
                    </p>
                  </div>
                  <div className="border-l-4 border-red-600 pl-4">
                    <p className="text-sm text-gray-600 mb-1">Expense</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(monthlySummary.total_expense)}
                    </p>
                  </div>
                  <div className="border-l-4 border-orange-600 pl-4">
                    <p className="text-sm text-gray-600 mb-1">Investments</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(monthlySummary.investments || 0)}
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-600 pl-4">
                    <p className="text-sm text-gray-600 mb-1">Savings</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(monthlySummary.savings)}
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-600 pl-4">
                    <p className="text-sm text-gray-600 mb-1">Savings Rate</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {monthlySummary.total_income > 0 
                        ? (monthlySummary.savings / monthlySummary.total_income * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Distribution */}
              {monthlySummary.top_categories && monthlySummary.top_categories.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-bold mb-4 text-black">Expense Categories</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <CategoryPieChart 
                        data={monthlySummary.top_categories.map((cat: any) => ({
                          name: cat.name,
                          value: cat.amount
                        }))} 
                        title="Category Distribution"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-black">Category Breakdown</h3>
                      <div className="space-y-2">
                        {monthlySummary.top_categories.map((category: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-black font-medium">{category.name}</span>
                            <div className="text-right">
                              <p className="text-red-600 font-bold">{formatCurrency(category.amount)}</p>
                              <p className="text-sm text-gray-600">
                                {((category.amount / monthlySummary.total_expense) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Insights */}
              {insights && insights.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-bold mb-4 text-black">Insights & Recommendations</h2>
                  <div className="space-y-3">
                    {insights.map((insight, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-l-4 ${getInsightClass(insight.severity)}`}
                      >
                        <p className="text-black">
                          {insight.severity === 'alert' ? '⚠️ ' : insight.severity === 'warning' ? '⚡ ' : 'ℹ️ '}
                          {insight.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
