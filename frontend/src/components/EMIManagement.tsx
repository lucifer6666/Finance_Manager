import { useState } from 'react';
import { useEmis } from '../hooks/useEmis';
import { useCreditCards } from '../hooks/useCreditCards';

export const EMIManagement = () => {
  const { emis, loading, addEmi, updateEmi, deleteEmi } = useEmis();
  const { cards } = useCreditCards();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: 'expense',
    category: 'EMI',
    description: '',
    due_date: '5',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    payment_method: 'bank',
    credit_card_id: '',
    is_active: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const inputElement = e.target as HTMLInputElement;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? inputElement.checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateEmi(editingId, {
          name: formData.name || undefined,
          amount: parseFloat(formData.amount),
          type: formData.type || undefined,
          category: formData.category,
          description: formData.description,
          due_date: Number(formData.due_date),
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
          payment_method: formData.payment_method || undefined,
          credit_card_id: formData.credit_card_id ? Number(formData.credit_card_id) : undefined,
          is_active: formData.is_active,
        });
        setEditingId(null);
      } else {
        await addEmi({
          name: formData.name,
          amount: parseFloat(formData.amount),
          type: formData.type || undefined,
          category: formData.category,
          description: formData.description,
          due_date: Number(formData.due_date),
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
          payment_method: formData.payment_method || undefined,
          credit_card_id: formData.credit_card_id ? Number(formData.credit_card_id) : undefined,
          is_active: formData.is_active,
        });
      }

      setFormData({
        name: '',
        amount: '',
        type: 'expense',
        category: 'EMI',
        description: '',
        due_date: '5',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        payment_method: 'bank',
        credit_card_id: '',
        is_active: true,
      });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save EMI:', error);
    }
  };

  const handleEdit = (emi: any) => {
    setFormData({
      name: emi.name || '',
      amount: emi.amount.toString(),
      type: emi.type || 'expense',
      category: emi.category || 'EMI',
      description: emi.description || '',
      due_date: String(emi.due_date),
      start_date: emi.start_date || new Date().toISOString().split('T')[0],
      end_date: emi.end_date || '',
      payment_method: emi.payment_method || 'bank',
      credit_card_id: emi.credit_card_id ? String(emi.credit_card_id) : '',
      is_active: emi.is_active,
    });
    setEditingId(emi.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      amount: '',
      type: 'expense',
      category: 'EMI',
      description: '',
      due_date: '5',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      payment_method: 'bank',
      credit_card_id: '',
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this EMI?')) {
      try {
        await deleteEmi(id);
      } catch (error) {
        console.error('Failed to delete EMI:', error);
      }
    }
  };

  if (loading && emis.length === 0) {
    return <div className="text-black">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">EMI Tracking</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add EMI'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-black mb-4">
            {editingId ? 'Edit EMI' : 'Add New EMI'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">EMI Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Home Loan, Car EMI"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white bg-gray-700 placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., EMI, Loan"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white bg-gray-700 placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">EMI Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white bg-gray-700 placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">Due Date</label>
                <input
                  type="number"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  min="1"
                  max="31"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white bg-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white bg-gray-700"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white bg-gray-700"
                >
                  <option value="expense" className="bg-gray-700">Expense</option>
                  <option value="income" className="bg-gray-700">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">Payment Method</label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white bg-gray-700"
                >
                  <option value="bank" className="bg-gray-700">Bank Transfer</option>
                  <option value="card" className="bg-gray-700">Credit Card</option>
                  <option value="cash" className="bg-gray-700">Cash</option>
                  <option value="upi" className="bg-gray-700">UPI</option>
                </select>
              </div>

              {formData.payment_method === 'card' && (
                <div>
                  <label className="block text-sm font-bold text-black mb-2">Select Credit Card</label>
                  <select
                    name="credit_card_id"
                    value={formData.credit_card_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white bg-gray-700"
                  >
                    <option value="" className="bg-gray-700">Choose a credit card</option>
                    {cards.map((card) => (
                      <option key={card.id} value={card.id} className="bg-gray-700">
                        {card.name} - {card.bank_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g., Home Loan EMI, Car EMI Monthly"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white bg-gray-700 placeholder-gray-400"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 rounded focus:ring-2 focus:ring-purple-500"
              />
              <label htmlFor="is_active" className="ml-2 text-sm font-bold text-black">
                Active (Auto-add on the due date each month)
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {editingId ? 'Update EMI' : 'Add EMI'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-black mb-4">All EMIs</h3>
        {emis.length === 0 ? (
          <p className="text-gray-600">No EMIs configured yet. Add one to track recurring expenses.</p>
        ) : (
          <div className="space-y-3">
            {emis.map((emi) => (
              <div
                key={emi.id}
                className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold text-black">{emi.name}</h4>
                    {emi.is_active ? (
                      <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                      {emi.payment_method === 'bank' ? 'Bank Transfer' : emi.payment_method === 'card' ? 'Credit Card' : emi.payment_method === 'upi' ? 'UPI' : 'Cash'}
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                      {emi.category}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    ₹{emi.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Due on day {emi.due_date} · Starts {emi.start_date ? new Date(emi.start_date).toLocaleDateString() : 'Not set'}
                  </p>
                  {emi.end_date && (
                    <p className="text-sm text-gray-600 mt-1">
                      Ends {new Date(emi.end_date).toLocaleDateString()}
                    </p>
                  )}
                  {emi.last_added_date && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last added: {new Date(emi.last_added_date).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(emi)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(emi.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
