import { useState, useEffect } from 'react';
import { CreditCard, CreditCardPayment } from '../types';

interface AddPaymentFormProps {
  cards: CreditCard[];
  onAdd: (payment: Omit<CreditCardPayment, 'id' | 'created_at'>) => Promise<void>;
  loading?: boolean;
}

export const AddPaymentForm = ({ cards, onAdd, loading = false }: AddPaymentFormProps) => {
  const [formData, setFormData] = useState({
    credit_card_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    amount: '' as string | number,
    payment_method: 'bank' as 'cash' | 'upi' | 'bank' | 'cheque',
    description: '',
    transaction_id: undefined as undefined | number,
  });

  useEffect(() => {
    if (cards.length > 0 && !formData.credit_card_id) {
      setFormData(prev => ({
        ...prev,
        credit_card_id: cards[0].id.toString(),
      }));
    }
  }, [cards, formData.credit_card_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
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
        credit_card_id: Number.parseInt(formData.credit_card_id),
        payment_date: formData.payment_date,
        amount: typeof formData.amount === 'string' ? Number.parseFloat(formData.amount) : formData.amount,
        payment_method: formData.payment_method,
        description: formData.description || undefined,
        transaction_id: formData.transaction_id,
      });
      setFormData({
        credit_card_id: cards.length > 0 ? cards[0].id.toString() : '',
        payment_date: new Date().toISOString().split('T')[0],
        amount: '',
        payment_method: 'bank',
        description: '',
        transaction_id: undefined,
      });
    } catch (error) {
      console.error('Failed to add payment:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-black mb-4">Add Credit Card Payment</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="credit_card_id" className="block text-sm font-bold text-black mb-1">Credit Card</label>
          <select
            id="credit_card_id"
            name="credit_card_id"
            value={formData.credit_card_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md text-white bg-gray-700"
            required
          >
            <option value="">Select a card</option>
            {cards.map(card => (
              <option key={card.id} value={card.id}>
                {card.name} - {card.bank_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="payment_date" className="block text-sm font-bold text-black mb-1">Payment Date</label>
          <input
            id="payment_date"
            type="date"
            name="payment_date"
            value={formData.payment_date}
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
          <label htmlFor="payment_method" className="block text-sm font-bold text-black mb-1">Payment Method</label>
          <select
            id="payment_method"
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md text-white bg-gray-700"
          >
            <option value="bank">Bank Transfer</option>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-bold text-black mb-1">Description</label>
          <input
            id="description"
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Bill payment, partial payment, etc."
            className="w-full px-3 py-2 border rounded-md text-white bg-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
      >
        {loading ? 'Adding Payment...' : 'Add Payment'}
      </button>
    </form>
  );
};
