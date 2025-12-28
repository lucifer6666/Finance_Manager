import { useState } from 'react';
import { SavingsInvestment } from '../types';

interface AddSavingsFormProps {
  onAdd: (investment: Omit<SavingsInvestment, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  loading?: boolean;
}

export const AddSavingsForm = ({ onAdd, loading = false }: AddSavingsFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    investment_type: 'mutual_fund' as SavingsInvestment['investment_type'],
    purchase_date: new Date().toISOString().split('T')[0],
    initial_amount: '',
    current_value: '',
    description: '',
    is_recurring: false,
    recurring_type: 'monthly' as 'monthly' | 'yearly',
    recurring_amount: '',
  });

  const investmentTypes = [
    { value: 'mutual_fund', label: 'Mutual Fund' },
    { value: 'life_insurance', label: 'Life Insurance' },
    { value: 'fixed_deposit', label: 'Fixed Deposit' },
    { value: 'stock', label: 'Stock' },
    { value: 'crypto', label: 'Crypto' },
    { value: 'other', label: 'Other' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const inputElement = e.target as HTMLInputElement;
    const isCheckbox = type === 'checkbox';
    
    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? inputElement.checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const initialAmount = Number.parseFloat(formData.initial_amount);
      const currentValueAmount = formData.current_value ? Number.parseFloat(formData.current_value) : initialAmount;
      const recurringAmountValue = formData.recurring_amount ? Number.parseFloat(formData.recurring_amount) : initialAmount;

      await onAdd({
        name: formData.name,
        investment_type: formData.investment_type,
        purchase_date: formData.purchase_date,
        initial_amount: initialAmount,
        current_value: currentValueAmount,
        description: formData.description || undefined,
        is_recurring: formData.is_recurring,
        recurring_type: formData.is_recurring ? formData.recurring_type : undefined,
        recurring_amount: formData.is_recurring ? recurringAmountValue : undefined,
      });
      setFormData({
        name: '',
        investment_type: 'mutual_fund',
        purchase_date: new Date().toISOString().split('T')[0],
        initial_amount: '',
        current_value: '',
        description: '',
        is_recurring: false,
        recurring_type: 'monthly',
        recurring_amount: '',
      });
    } catch (error) {
      console.error('Failed to add investment:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-black mb-6">Record New Investment</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-bold text-black mb-2">Investment Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., HDFC MF Growth"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700 placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-2">Investment Type</label>
          <select
            name="investment_type"
            value={formData.investment_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700"
          >
            {investmentTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-2">Purchase Date</label>
          <input
            type="date"
            name="purchase_date"
            value={formData.purchase_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-2">Initial Amount (₹)</label>
          <input
            type="number"
            name="initial_amount"
            value={formData.initial_amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700 placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-2">Current Value (₹)</label>
          <input
            type="number"
            name="current_value"
            value={formData.current_value}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700 placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-2">Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional notes"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Recurring Investment Section */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="is_recurring"
            name="is_recurring"
            checked={formData.is_recurring}
            onChange={handleChange}
            className="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="is_recurring" className="ml-2 text-sm font-bold text-black">
            Set up auto-entry (recurring investment)
          </label>
        </div>

        {formData.is_recurring && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">Recurring Frequency</label>
              <select
                name="recurring_type"
                value={formData.recurring_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Recurring Amount (₹)</label>
              <input
                type="number"
                name="recurring_amount"
                value={formData.recurring_amount}
                onChange={handleChange}
                placeholder="Amount to add each period"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700 placeholder-gray-400"
              />
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        {loading ? 'Recording...' : 'Record Investment'}
      </button>
    </form>
  );
};

