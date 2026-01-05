import { useState } from 'react';
import { Transaction, CreditCard } from '../types';

interface AddTransactionFormProps {
  cards?: CreditCard[];
  onAdd: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  loading?: boolean;
}

export const AddTransactionForm = ({ cards = [], onAdd, loading = false }: AddTransactionFormProps) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '' as string | number,
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    payment_method: 'upi' as 'cash' | 'card' | 'upi' | 'bank',
    credit_card_id: undefined as undefined | number,
    is_payment: false,
  });

  const categories = {
    expense: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Groceries', 'Blinkit', 'Zomato', 'Vehicle', 'Rent', 'Family', 'Other'],
    income: ['Salary', 'Freelance', 'Bonus', 'Investment', 'Other'],
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type: inputType } = e.target;
    setFormData(prev => {
      if (inputType === 'checkbox') {
        return { ...prev, [name]: (e.target as HTMLInputElement).checked };
      }
      if (name === 'amount') {
        const numValue = value === '' ? '' : Number.parseFloat(value);
        return { ...prev, [name]: numValue };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onAdd({
        ...formData,
        amount: formData.amount as unknown as number,
        credit_card_id: formData.payment_method === 'card' ? formData.credit_card_id : undefined,
        is_payment: formData.is_payment,
      });
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        type: 'expense',
        category: '',
        description: '',
        payment_method: 'cash',
        credit_card_id: undefined,
        is_payment: false,
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
          <label htmlFor="date" className="block text-sm font-bold text-black mb-1">Date</label>
          <input
            id="date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md text-white bg-gray-700"
            required
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-bold text-black mb-1">Amount</label>
          <input
            id="amount"
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
          <label htmlFor="type" className="block text-sm font-bold text-black mb-1">Type</label>
          <select
            id="type"
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
          <label htmlFor="category" className="block text-sm font-bold text-black mb-1">Category</label>
          <select
            id="category"
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
          <label htmlFor="payment_method" className="block text-sm font-bold text-black mb-1">Payment Method</label>
          <select
            id="payment_method"
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
          <label htmlFor="description" className="block text-sm font-bold text-black mb-1">Description</label>
          <input
            id="description"
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional"
            className="w-full px-3 py-2 border rounded-md text-white bg-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {formData.payment_method === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="credit_card_id" className="block text-sm font-bold text-black mb-1">Select Credit Card</label>
            <select
              id="credit_card_id"
              name="credit_card_id"
              value={formData.credit_card_id ?? ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md text-white bg-gray-700"
              required={formData.payment_method === 'card'}
            >
              <option value="">Select a card</option>
              {cards.map(card => (
                <option key={card.id} value={card.id}>
                  {card.name} - {card.bank_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <label htmlFor="is_payment" className="flex items-center text-black mb-2">
              <input
                id="is_payment"
                type="checkbox"
                name="is_payment"
                checked={formData.is_payment}
                onChange={handleChange}
                className="w-4 h-4 mr-2"
              />
              <span className="text-sm font-bold">Mark as Card Payment</span>
            </label>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
      >
        {loading ? 'Adding...' : 'Add Transaction'}
      </button>
    </form>
  );
};
