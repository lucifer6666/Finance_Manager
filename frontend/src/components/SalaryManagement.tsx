import { useState } from 'react';
import { useSalaries, Salary } from '../hooks/useSalaries';

export const SalaryManagement = () => {
  const { salaries, loading, addSalary, updateSalary, deleteSalary } = useSalaries();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    start_date: new Date().toISOString().split('T')[0],
    is_active: true,
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      if (editingId) {
        await updateSalary(editingId, {
          name: formData.name,
          amount: parseFloat(formData.amount),
          is_active: formData.is_active,
          description: formData.description || undefined,
        });
        setEditingId(null);
      } else {
        await addSalary({
          name: formData.name,
          amount: parseFloat(formData.amount),
          start_date: formData.start_date,
          is_active: formData.is_active,
          description: formData.description || undefined,
        });
      }
      setFormData({ name: '', amount: '', start_date: new Date().toISOString().split('T')[0], is_active: true, description: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save salary:', error);
    }
  };

  const handleEdit = (salary: Salary) => {
    setFormData({
      name: salary.name,
      amount: salary.amount.toString(),
      start_date: salary.start_date || new Date().toISOString().split('T')[0],
      is_active: salary.is_active,
      description: salary.description || '',
    });
    setEditingId(salary.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ name: '', amount: '', start_date: new Date().toISOString().split('T')[0], is_active: true, description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this salary?')) {
      try {
        await deleteSalary(id);
      } catch (error) {
        console.error('Failed to delete salary:', error);
      }
    }
  };

  if (loading && salaries.length === 0) {
    return <div className="text-black">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Salary Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Salary'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-black mb-4">
            {editingId ? 'Edit Salary' : 'Add New Salary'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">Salary Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Primary Salary, Bonus"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700 placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">Monthly Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700 placeholder-gray-400"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional notes"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700 placeholder-gray-400"
              />
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
              <label htmlFor="is_active" className="ml-2 text-sm font-bold text-black">
                Active (Auto-add on 1st of month)
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {editingId ? 'Update Salary' : 'Add Salary'}
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

      {/* Salaries List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-black mb-4">All Salaries</h3>
        {salaries.length === 0 ? (
          <p className="text-gray-600">No salaries configured yet. Add one to get started!</p>
        ) : (
          <div className="space-y-3">
            {salaries.map((salary) => (
              <div
                key={salary.id}
                className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold text-black">{salary.name}</h4>
                    {salary.is_active ? (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    ₹{salary.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Started: {salary.start_date ? new Date(salary.start_date).toLocaleDateString() : 'Not set'}
                  </p>
                  {salary.description && (
                    <p className="text-sm text-gray-600 mt-1">{salary.description}</p>
                  )}
                  {salary.last_added_date && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last added: {new Date(salary.last_added_date).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(salary)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(salary.id)}
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
