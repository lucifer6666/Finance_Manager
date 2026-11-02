import { useState } from 'react';

interface AddEventFormProps {
  onAdd: (event: { name: string; start_date: string; end_date: string }) => Promise<void>;
}

export const AddEventForm = ({ onAdd }: AddEventFormProps) => {
  const today = new Date().toISOString().split('T')[0];
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (endDate < startDate) {
      setError('End date must be on or after start date');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onAdd({ name: name.trim(), start_date: startDate, end_date: endDate });
      setName('');
    } catch (err) {
      console.error('Failed to add event:', err);
      setError('Failed to add event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-black mb-3">Add Event</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label htmlFor="event_name" className="block text-sm font-bold text-black mb-1">Name</label>
          <input
            id="event_name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Goa Trip"
            className="w-full px-3 py-2 border rounded-md text-white bg-gray-700 placeholder-gray-400"
            required
          />
        </div>
        <div>
          <label htmlFor="event_start" className="block text-sm font-bold text-black mb-1">Start Date</label>
          <input
            id="event_start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-white bg-gray-700"
            required
          />
        </div>
        <div>
          <label htmlFor="event_end" className="block text-sm font-bold text-black mb-1">End Date</label>
          <input
            id="event_end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-white bg-gray-700"
            required
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
        >
          {saving ? 'Adding...' : 'Add Event'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </form>
  );
};
