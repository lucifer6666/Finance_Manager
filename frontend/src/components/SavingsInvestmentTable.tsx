import { useState } from 'react';
import { SavingsInvestment } from '../types';

interface SavingsInvestmentTableProps {
  investments: SavingsInvestment[];
  onDelete?: (id: number) => Promise<void>;
  onUpdate?: (id: number, investment: Partial<SavingsInvestment>) => Promise<void>;
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

const recurringColors: Record<string, string> = {
  monthly: 'bg-cyan-100 text-cyan-800',
  yearly: 'bg-indigo-100 text-indigo-800',
  none: 'bg-gray-100 text-gray-600',
};

export const SavingsInvestmentTable = ({ investments, onDelete, onUpdate, loading = false }: SavingsInvestmentTableProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRecurring, setEditRecurring] = useState<{ is_recurring: boolean; recurring_type?: string }>({
    is_recurring: false,
  });

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      try {
        await onDelete?.(id);
      } catch (error) {
        console.error('Failed to delete investment:', error);
      }
    }
  };

  const handleEditClick = (investment: SavingsInvestment) => {
    setEditingId(investment.id);
    setEditRecurring({
      is_recurring: investment.is_recurring,
      recurring_type: investment.recurring_type || undefined,
    });
  };

  const handleSaveRecurring = async (id: number) => {
    try {
      await onUpdate?.(id, {
        is_recurring: editRecurring.is_recurring ? 1 : 0,
        recurring_type: editRecurring.is_recurring ? editRecurring.recurring_type : null,
      });
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update investment:', error);
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
              <th className="px-6 py-3 text-center text-sm font-semibold text-black">Recurring</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-black">Actions</th>
            </tr>
          </thead>
          <tbody>
            {investments.map(investment => {
              const profitLoss = investment.current_value - investment.initial_amount;
              const profitLossPercent = (profitLoss / investment.initial_amount) * 100;
              const isEditing = editingId === investment.id;

              const recurringLabel = investment.is_recurring
                ? investment.recurring_type
                  ? investment.recurring_type.charAt(0).toUpperCase() + investment.recurring_type.slice(1)
                  : 'Active'
                : 'None';

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
                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editRecurring.is_recurring}
                            onChange={(e) =>
                              setEditRecurring({
                                ...editRecurring,
                                is_recurring: e.target.checked,
                              })
                            }
                            className="w-4 h-4 cursor-pointer"
                          />
                          <span className="text-black">Recurring</span>
                        </label>
                        {editRecurring.is_recurring && (
                          <select
                            value={editRecurring.recurring_type || ''}
                            onChange={(e) =>
                              setEditRecurring({
                                ...editRecurring,
                                recurring_type: e.target.value,
                              })
                            }
                            className="text-xs px-2 py-1 border border-gray-300 rounded bg-white text-black"
                          >
                            <option value="">Select Type</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                        )}
                      </div>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer hover:opacity-80 ${
                          recurringColors[investment.is_recurring ? investment.recurring_type || 'none' : 'none']
                        }`}
                        onClick={() => handleEditClick(investment)}
                      >
                        {recurringLabel}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveRecurring(investment.id)}
                            disabled={loading}
                            className="text-green-600 hover:text-green-800 disabled:text-gray-400 text-sm font-semibold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            disabled={loading}
                            className="text-gray-600 hover:text-gray-800 disabled:text-gray-400 text-sm font-semibold"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleDelete(investment.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                        >
                          Delete
                        </button>
                      )}
                    </div>
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
