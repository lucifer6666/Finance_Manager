import { useState } from 'react';
import { SavingsInvestment } from '../types';

interface SavingsInvestmentTableProps {
  investments: SavingsInvestment[];
  onDelete?: (id: number) => Promise<void>;
  loading?: boolean;
}

const investmentTypeColors: Record<string, string> = {
  mutual_fund: 'bg-blue-100 text-blue-800',
  life_insurance: 'bg-purple-100 text-purple-800',
  fixed_deposit: 'bg-green-100 text-green-800',
  stock: 'bg-yellow-100 text-yellow-800',
  crypto: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 text-gray-800',
};

export const SavingsInvestmentTable = ({ investments, onDelete, loading = false }: SavingsInvestmentTableProps) => {
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      try {
        await onDelete?.(id);
      } catch (error) {
        console.error('Failed to delete investment:', error);
      }
    }
  };

  if (investments.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-black">No investments recorded yet</p>
      </div>
    );
  }

  const totalInitial = investments.reduce((sum, inv) => sum + inv.initial_amount, 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + inv.current_value, 0);
  const totalProfitLoss = totalCurrent - totalInitial;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-md">
          <p className="text-sm opacity-90">Total Invested</p>
          <p className="text-3xl font-bold">₹{totalInitial.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-md">
          <p className="text-sm opacity-90">Current Value</p>
          <p className="text-3xl font-bold">₹{totalCurrent.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
        <div className={`bg-gradient-to-br ${totalProfitLoss >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} text-white p-4 rounded-lg shadow-md`}>
          <p className="text-sm opacity-90">Profit/Loss</p>
          <p className="text-3xl font-bold">{totalProfitLoss >= 0 ? '+' : ''}₹{totalProfitLoss.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-black">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-black">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-black">Purchase Date</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-black">Initial</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-black">Current Value</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-black">Profit/Loss</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-black">Actions</th>
            </tr>
          </thead>
          <tbody>
            {investments.map(investment => {
              const profitLoss = investment.current_value - investment.initial_amount;
              const profitLossPercent = (profitLoss / investment.initial_amount) * 100;
              
              return (
                <tr key={investment.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-black">{investment.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${investmentTypeColors[investment.investment_type] || investmentTypeColors.other}`}>
                      {investment.investment_type.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-black">{new Date(investment.purchase_date).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-right text-black">₹{investment.initial_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-right text-black">₹{investment.current_value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td className={`px-6 py-4 text-sm font-semibold text-right ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitLoss >= 0 ? '+' : ''}₹{profitLoss.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ({profitLossPercent.toFixed(2)}%)
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(investment.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
