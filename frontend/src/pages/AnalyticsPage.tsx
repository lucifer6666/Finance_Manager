import { useState, useEffect } from 'react';
import { analyticsApi, transactionApi, paymentApi, savingsApi, creditCardApi } from '../api/client';
import { MonthlyChart, CategoryPieChart } from '../components';

export const AnalyticsPage = () => {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [viewMode, setViewMode] = useState<'trends' | 'monthly' | 'export'>('trends');
  const [spendingTrends, setSpendingTrends] = useState<any[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [yearlyCategories, setYearlyCategories] = useState<any>(null);
  const [includeInvestments, setIncludeInvestments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState<'monthly' | 'yearly'>('monthly');
  const [exporting, setExporting] = useState(false);

  // Fetch spending trends
  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      try {
        const response = await analyticsApi.getSpendingTrends(12, year);
        setSpendingTrends(response.data);
        
        // Also fetch yearly categories
        const categoriesResponse = await analyticsApi.getYearlyCategories(year, includeInvestments);
        setYearlyCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    if (viewMode === 'trends') {
      fetchTrends();
    }
  }, [viewMode, year, includeInvestments]);

  // Fetch monthly data
  useEffect(() => {
    const fetchMonthlyData = async () => {
      setLoading(true);
      try {
        const [summaryResponse, insightsResponse] = await Promise.all([
          analyticsApi.getMonthly(year, month, includeInvestments),
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
  }, [year, month, viewMode, includeInvestments]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('₹', '₹');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const formatPaymentMethod = (method: string) => {
    const methods: { [key: string]: string } = {
      'upi': 'UPI',
      'cash': 'Cash',
      'card': 'Card',
      'bank': 'Bank Transfer',
      'cheque': 'Cheque',
    };
    return methods[method] || method;
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const isYearly = exportType === 'yearly';
      
      // Fetch cards to get card names
      const cardsRes = await creditCardApi.getAll();
      const cardMap: { [key: number]: string } = {};
      cardsRes.data.forEach(card => {
        cardMap[card.id] = card.name;
      });
      
      if (isYearly) {
        // Yearly export
        // Fetch all data for the year
        const [transactionsRes, paymentsRes, savingsRes] = await Promise.all([
          transactionApi.getAll(0, 1000),
          paymentApi.getAll(0, 1000),
          savingsApi.getAll(),
        ]);
        
        // Filter by year
        const yearTransactions = transactionsRes.data.filter(t => 
          new Date(t.date).getFullYear() === year
        );
        const yearPayments = paymentsRes.data.filter(p => 
          new Date(p.payment_date).getFullYear() === year
        );
        const yearSavings = savingsRes.data.filter(s => 
          new Date(s.purchase_date).getFullYear() === year
        );
        
        // Generate Transactions CSV
        let transactionsCsv = 'Date,Type,Category,Description,Amount,Account,Payment Method\n';
        yearTransactions.forEach(t => {
          const date = t.date || 'N/A';
          const type = (t.type || 'expense').toUpperCase();
          const category = t.category || 'N/A';
          const description = (t.description || '').replace(/"/g, '""');
          const amount = t.amount || 0;
          const account = 'Personal'; // Default account
          const paymentMethod = formatPaymentMethod(t.payment_method || 'bank');
          
          transactionsCsv += `${date},${type},"${category}","${description}",${amount},"${account}","${paymentMethod}"\n`;
        });
        downloadCSV(transactionsCsv, `Transactions_${year}.csv`);
        
        // Generate Credit Card Bills CSV
        let billsCsv = 'Card Name,Payment Date,Amount,Description,Payment Method,Status\n';
        yearPayments.forEach(p => {
          const cardName = cardMap[p.credit_card_id] || 'Unknown Card';
          const date = p.payment_date || 'N/A';
          const amount = p.amount || 0;
          const description = (p.description || '').replace(/"/g, '""');
          const paymentMethod = formatPaymentMethod(p.payment_method || 'bank');
          const status = 'Paid';
          
          billsCsv += `"${cardName}",${date},${amount},"${description}","${paymentMethod}","${status}"\n`;
        });
        downloadCSV(billsCsv, `CreditCard_Bills_${year}.csv`);
        
        // Generate Investments CSV
        let investmentsCsv = 'Name,Investment Type,Initial Amount,Current Value,Purchase Date,Recurring,Recurring Type,Recurring Amount\n';
        yearSavings.forEach(s => {
          const name = (s.name || '').replace(/"/g, '""');
          const investmentType = (s.investment_type || 'other').toUpperCase();
          const initialAmount = s.initial_amount || 0;
          const currentValue = s.current_value || 0;
          const purchaseDate = s.purchase_date || 'N/A';
          const isRecurring = s.is_recurring ? 'Yes' : 'No';
          const recurringType = (s.recurring_type || 'N/A').toUpperCase();
          const recurringAmount = s.recurring_amount || 0;
          
          investmentsCsv += `"${name}","${investmentType}",${initialAmount},${currentValue},"${purchaseDate}","${isRecurring}","${recurringType}",${recurringAmount}\n`;
        });
        downloadCSV(investmentsCsv, `Investments_${year}.csv`);
        
        alert('✓ Exported 3 files for ' + year);
      } else {
        // Monthly export
        const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long' });
        
        // Fetch all data
        const [transactionsRes, paymentsRes, savingsRes] = await Promise.all([
          transactionApi.getByMonth(year, month),
          paymentApi.getAll(0, 1000),
          savingsApi.getAll(),
        ]);
        
        // Filter payments by month
        const monthPayments = paymentsRes.data.filter(p => {
          const payDate = new Date(p.payment_date);
          return payDate.getMonth() + 1 === month && payDate.getFullYear() === year;
        });
        
        // Filter savings by month
        const monthSavings = savingsRes.data.filter(s => {
          const invDate = new Date(s.purchase_date);
          return invDate.getMonth() + 1 === month && invDate.getFullYear() === year;
        });
        
        // Generate Transactions CSV
        let transactionsCsv = 'Date,Type,Category,Description,Amount,Account,Payment Method\n';
        transactionsRes.data.forEach(t => {
          const date = t.date || 'N/A';
          const type = (t.type || 'expense').toUpperCase();
          const category = t.category || 'N/A';
          const description = (t.description || '').replace(/"/g, '""');
          const amount = t.amount || 0;
          const account = 'Personal'; // Default account
          const paymentMethod = formatPaymentMethod(t.payment_method || 'bank');
          
          transactionsCsv += `${date},${type},"${category}","${description}",${amount},"${account}","${paymentMethod}"\n`;
        });
        downloadCSV(transactionsCsv, `Transactions_${year}_${String(month).padStart(2, '0')}.csv`);
        
        // Generate Credit Card Bills CSV
        let billsCsv = 'Card Name,Payment Date,Amount,Description,Payment Method,Status\n';
        monthPayments.forEach(p => {
          const cardName = cardMap[p.credit_card_id] || 'Unknown Card';
          const date = p.payment_date || 'N/A';
          const amount = p.amount || 0;
          const description = (p.description || '').replace(/"/g, '""');
          const paymentMethod = formatPaymentMethod(p.payment_method || 'bank');
          const status = 'Paid';
          
          billsCsv += `"${cardName}",${date},${amount},"${description}","${paymentMethod}","${status}"\n`;
        });
        downloadCSV(billsCsv, `CreditCard_Bills_${year}_${String(month).padStart(2, '0')}.csv`);
        
        // Generate Investments CSV
        let investmentsCsv = 'Name,Investment Type,Initial Amount,Current Value,Purchase Date,Recurring,Recurring Type,Recurring Amount\n';
        monthSavings.forEach(s => {
          const name = (s.name || '').replace(/"/g, '""');
          const investmentType = (s.investment_type || 'other').toUpperCase();
          const initialAmount = s.initial_amount || 0;
          const currentValue = s.current_value || 0;
          const purchaseDate = s.purchase_date || 'N/A';
          const isRecurring = s.is_recurring ? 'Yes' : 'No';
          const recurringType = (s.recurring_type || 'N/A').toUpperCase();
          const recurringAmount = s.recurring_amount || 0;
          
          investmentsCsv += `"${name}","${investmentType}",${initialAmount},${currentValue},"${purchaseDate}","${isRecurring}","${recurringType}",${recurringAmount}\n`;
        });
        downloadCSV(investmentsCsv, `Investments_${year}_${String(month).padStart(2, '0')}.csv`);
        
        alert('✓ Exported 3 files for ' + monthName + ' ' + year);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
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
        <button
          onClick={() => setViewMode('export')}
          className={`px-4 py-2 rounded-md font-semibold transition ${
            viewMode === 'export'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-black hover:bg-gray-300'
          }`}
        >
          📥 Export Data
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

          {/* Yearly Category Distribution */}
          {yearlyCategories?.top_categories?.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-black">Yearly Expense Categories</h2>
                <label className="flex items-center gap-2 text-black cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeInvestments}
                    onChange={(e) => setIncludeInvestments(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold">Include Investments</span>
                </label>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <CategoryPieChart 
                    data={yearlyCategories.top_categories.map((cat: any) => ({
                      name: cat.name,
                      value: cat.amount
                    }))} 
                    title="Category Distribution"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-black">Category Breakdown</h3>
                  <div className="space-y-2">
                    {yearlyCategories.top_categories.map((category: any) => (
                      <div key={category.name} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-black font-medium">{category.name}</span>
                        <div className="text-right">
                          <p className="text-red-600 font-bold">{formatCurrency(category.amount)}</p>
                          {category.name !== 'Investments' && (
                            <p className="text-sm text-gray-600">
                              {yearlyCategories.total_expense > 0 
                                ? ((category.amount / yearlyCategories.total_expense) * 100).toFixed(1)
                                : 0}%
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
                    {spendingTrends.map((item) => (
                      <tr key={item.month} className="border-b hover:bg-gray-50">
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
                  <option key={m} value={idx + 1}>
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
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold mb-4 text-black">Monthly Expense Categories</h2>
                    <label className="flex items-center gap-2 text-black cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeInvestments}
                        onChange={(e) => setIncludeInvestments(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-semibold">Include Investments</span>
                    </label>
                  </div>
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
                        {monthlySummary.top_categories.map((category: any) => (
                          <div key={category.name} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-black font-medium">{category.name}</span>
                            <div className="text-right">
                              <p className="text-red-600 font-bold">{formatCurrency(category.amount)}</p>
                                {category.name !== 'Investments' && (
                                <p className="text-sm text-gray-600">
                                  {((category.amount / monthlySummary.total_expense) * 100).toFixed(1)}%
                                </p>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Export View */}
      {viewMode === 'export' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-black">Export Financial Data</h2>
            
            <div className="space-y-4">
              {/* Export Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-black mb-3">Export Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="exportType"
                      value="monthly"
                      checked={exportType === 'monthly'}
                      onChange={(e) => setExportType(e.target.value as 'monthly' | 'yearly')}
                      className="w-4 h-4"
                    />
                    <span className="text-black font-medium">Monthly Export</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="exportType"
                      value="yearly"
                      checked={exportType === 'yearly'}
                      onChange={(e) => setExportType(e.target.value as 'monthly' | 'yearly')}
                      className="w-4 h-4"
                    />
                    <span className="text-black font-medium">Yearly Export</span>
                  </label>
                </div>
              </div>

              {/* Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number.parseInt(e.target.value))}
                    min="2020"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-3 py-2 border rounded-md text-white bg-gray-700"
                  />
                </div>
                
                {exportType === 'monthly' && (
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Month</label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(Number.parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-md text-white bg-gray-700"
                    >
                      {months.map((m, idx) => (
                        <option key={m} value={idx + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Export Information */}
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> The exported CSV will include:
                </p>
                <ul className="text-sm text-blue-900 ml-4 mt-2 space-y-1">
                  <li>✓ All transactions</li>
                  <li>✓ All credit card bill payments</li>
                  <li>✓ All savings & investment records</li>
                </ul>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={exporting}
                className={`w-full py-3 px-4 rounded-md font-semibold text-white transition ${
                  exporting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {exporting ? 'Exporting...' : '📥 Export as CSV'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
