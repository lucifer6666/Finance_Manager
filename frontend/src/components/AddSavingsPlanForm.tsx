import { useState } from 'react';
import { SavingsPlan } from '../types';

interface AddSavingsPlanFormProps {
  onAdd: (plan: Omit<SavingsPlan, 'id' | 'created_at' | 'updated_at' | 'last_processed_date'>) => Promise<any>;
  loading?: boolean;
}

export const AddSavingsPlanForm = ({ onAdd, loading = false }: AddSavingsPlanFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    investment_type: 'fixed_deposit' as string,
    amount: '',
    recurring_type: 'monthly' as 'monthly' | 'yearly',
    due_date: '1',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_active: true,
    description: '',
  });

  const investmentTypes = [
    { value: 'mutual_fund', label: 'Mutual Fund' },
    { value: 'life_insurance', label: 'Life Insurance' },
    { value: 'fixed_deposit', label: 'Fixed Deposit' },
    { value: 'stock', label: 'Stock' },
    { value: 'crypto', label: 'Crypto' },
    { value: 'recurring_savings', label: 'Recurring Savings' },
    { value: 'ppf', label: 'PPF' },
    { value: 'nsc', label: 'NSC' },
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
      const amount = Number.parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      await onAdd({
        name: formData.name,
        investment_type: formData.investment_type,
        amount,
        recurring_type: formData.recurring_type,
        due_date: Number.parseInt(formData.due_date),
        start_date: formData.start_date || new Date().toISOString().split('T')[0],
        end_date: formData.end_date || null,
        is_active: formData.is_active,
        description: formData.description || undefined,
      });

      // Reset form
      setFormData({
        name: '',
        investment_type: 'fixed_deposit',
        amount: '',
        recurring_type: 'monthly',
        due_date: '1',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        is_active: true,
        description: '',
      });
    } catch (error) {
      console.error('Failed to add saving plan:', error);
      alert('Failed to add saving plan. Please check the form and try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-black mb-6">Create New Saving Plan</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-bold text-black mb-2">Plan Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Emergency Fund, Vacation Savings"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700 placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-2">Investment Type *</label>
          <select
            name="investment_type"
            value={formData.investment_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700"
            required
          >
            {investmentTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-2">Amount (₹) *</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700 placeholder-gray-400"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Monthly plans use the full amount. Yearly plans are split into a monthly equivalent automatically.
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-2">Frequency *</label>
          <select
            name="recurring_type"
            value={formData.recurring_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700"
            required
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-2">Due Date (Day of Month) *</label>
          <input
            type="number"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            min="1"
            max="31"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700"
            required
          />
          <p className="text-xs text-gray-400 mt-1">When in the month the saving is due (e.g., 1 = 1st, 15 = 15th)</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-2">Start Date *</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-2">End Date (Optional)</label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            placeholder="Leave empty for no end date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700 placeholder-gray-400"
          />
          <p className="text-xs text-gray-400 mt-1">Leave empty to continue indefinitely</p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="is_active" className="ml-2 text-sm font-semibold text-black">
            Active
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-black mb-2">Description (Optional)</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add notes about this saving plan..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700 placeholder-gray-400"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        {loading ? 'Creating Plan...' : 'Create Saving Plan'}
      </button>
    </form>
  );
};
