import { useState } from 'react';
import { Transaction } from '../types';

interface AddTransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  loading?: boolean;
}

export const AddTransactionForm = ({ onAdd, loading = false }: AddTransactionFormProps) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    payment_method: 'cash' as 'cash' | 'card' | 'upi' | 'bank',
    credit_card_id: undefined,
  });

  const categories = {
    expense: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Other'],
    income: ['Salary', 'Freelance', 'Bonus', 'Investment', 'Other'],
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || '' : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onAdd({
        ...formData,
        amount: formData.amount as unknown as number,
        credit_card_id: formData.payment_method === 'card' ? formData.credit_card_id : undefined,
      });
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        type: 'expense',
        category: '',
        description: '',
        payment_method: 'cash',
        credit_card_id: undefined,
      });
    } catch (error) {
      console.error('Failed to add transaction:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-black mb-4">Add Transaction</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-bold text-black mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md text-white bg-gray-700"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-1">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            className="w-full px-3 py-2 border rounded-md text-white bg-gray-700 placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-1">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md text-white bg-gray-700"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md text-white bg-gray-700"
            required
          >
            <option value="">Select Category</option>
            {categories[formData.type].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-1">Payment Method</label>
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md text-white bg-gray-700"
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-1">Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional"
            className="w-full px-3 py-2 border rounded-md text-white bg-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Adding...' : 'Add Transaction'}
      </button>
    </form>
  );
};
