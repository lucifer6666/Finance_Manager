import { useState } from 'react';
import { useCreditCards } from '../hooks';
import { CreditCardSummary } from '../components';

interface CreditCardForm {
  name: string;
  bank_name: string;
  billing_cycle_start: string;
  billing_cycle_end: string;
  due_date: string;
  credit_limit: string;
}

export const CreditCardsPage = () => {
  const { cards, addCard, updateCard, deleteCard } = useCreditCards();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreditCardForm>({
    name: '',
    bank_name: '',
    billing_cycle_start: '1',
    billing_cycle_end: '30',
    due_date: '5',
    credit_limit: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCard({
        name: formData.name,
        bank_name: formData.bank_name,
        billing_cycle_start: parseInt(formData.billing_cycle_start),
        billing_cycle_end: parseInt(formData.billing_cycle_end),
        due_date: parseInt(formData.due_date),
        credit_limit: parseFloat(formData.credit_limit),
      });
      setFormData({
        name: '',
        bank_name: '',
        billing_cycle_start: '1',
        billing_cycle_end: '30',
        due_date: '5',
        credit_limit: '',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add credit card:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this credit card?')) {
      try {
        await deleteCard(id);
      } catch (error) {
        console.error('Failed to delete credit card:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-black">Credit Cards</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {showForm ? 'Cancel' : '+ Add Card'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-black">Add New Credit Card</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-1">Card Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., HDFC Platinum"
                className="w-full px-3 py-2 border rounded-md text-white bg-gray-700"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Bank Name</label>
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                placeholder="e.g., HDFC Bank"
                className="w-full px-3 py-2 border rounded-md text-white bg-gray-700 placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Billing Cycle Start (Day)</label>
              <input
                type="number"
                name="billing_cycle_start"
                value={formData.billing_cycle_start}
                onChange={handleChange}
                min="1"
                max="31"
                className="w-full px-3 py-2 border rounded-md text-white bg-gray-700"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Billing Cycle End (Day)</label>
              <input
                type="number"
                name="billing_cycle_end"
                value={formData.billing_cycle_end}
                onChange={handleChange}
                min="1"
                max="31"
                className="w-full px-3 py-2 border rounded-md text-white bg-gray-700"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Due Date (Day)</label>
              <input
                type="number"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                min="1"
                max="31"
                className="w-full px-3 py-2 border rounded-md text-white bg-gray-700"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Credit Limit</label>
              <input
                type="number"
                name="credit_limit"
                value={formData.credit_limit}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 py-2 border rounded-md text-white bg-gray-700 placeholder-gray-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
          >
            Add Credit Card
          </button>
        </form>
      )}

      <CreditCardSummary cards={cards} />

      {cards.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Card Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Bank</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Limit</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Cycle</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cards.map(card => (
                <tr key={card.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-black">{card.name}</td>
                  <td className="px-6 py-4 text-sm text-black">{card.bank_name}</td>
                  <td className="px-6 py-4 text-sm text-black">₹{card.credit_limit.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-black">{card.billing_cycle_start}-{card.billing_cycle_end}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
