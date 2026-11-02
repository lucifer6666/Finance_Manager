import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { eventApi } from '../api/client';
import { EventItem, EventAnalysis } from '../types';
import { CategoryPieChart } from './CategoryPieChart';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const formatPaymentMethod = (method: string) => {
  const methods: { [key: string]: string } = { upi: 'UPI', cash: 'Cash', card: 'Card', bank: 'Bank Transfer' };
  return methods[method] || method;
};

export const EventsAnalytics = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState({ name: '', start_date: '', end_date: '' });
  const [saving, setSaving] = useState(false);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<EventAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await eventApi.getAll();
      setEvents(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const loadAnalysis = async (id: number) => {
    setLoadingAnalysis(true);
    try {
      const response = await eventApi.getAnalysis(id);
      setAnalysis(response.data);
    } catch (err) {
      console.error('Failed to fetch event analysis:', err);
      setAnalysis(null);
      setError('Failed to load event analysis');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleSelect = (id: number) => {
    if (selectedId === id) {
      setSelectedId(null);
      setAnalysis(null);
      return;
    }
    setSelectedId(id);
    setAnalysis(null);
    loadAnalysis(id);
  };

  const startEdit = (event: EventItem) => {
    setEditingId(event.id);
    setDraft({ name: event.name, start_date: event.start_date, end_date: event.end_date });
    setError(null);
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    if (!draft.name.trim()) {
      setError('Event name is required');
      return;
    }
    if (draft.end_date < draft.start_date) {
      setError('End date must be on or after start date');
      return;
    }
    setSaving(true);
    try {
      await eventApi.update(editingId, { ...draft, name: draft.name.trim() });
      setEditingId(null);
      setError(null);
      await loadEvents();
      if (selectedId === editingId) await loadAnalysis(editingId);
    } catch (err) {
      console.error('Failed to update event:', err);
      setError('Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (event: EventItem) => {
    if (!globalThis.confirm(`Delete "${event.name}"? Its transactions will be kept but unlinked from the event.`)) return;
    try {
      await eventApi.delete(event.id);
      if (selectedId === event.id) {
        setSelectedId(null);
        setAnalysis(null);
      }
      await loadEvents();
    } catch (err) {
      console.error('Failed to delete event:', err);
      setError('Failed to delete event');
    }
  };

  const inputClass = 'px-2 py-1 border rounded-md text-white bg-gray-700';

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-1 text-black">Events</h2>
        <p className="text-sm text-gray-600 mb-4">
          Click an event to see its analysis. Link transactions to events from the Transactions page.
        </p>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        {loading && events.length === 0 ? (
          <p className="text-black">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-black">No events yet. Add one from the Transactions page.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 border-b-2">
                <tr>
                  <th className="px-4 py-2 text-black font-bold">Event</th>
                  <th className="px-4 py-2 text-black font-bold">Start Date</th>
                  <th className="px-4 py-2 text-black font-bold">End Date</th>
                  <th className="px-4 py-2 text-black font-bold text-right">Transactions</th>
                  <th className="px-4 py-2 text-black font-bold text-right">Expense</th>
                  <th className="px-4 py-2 text-black font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const isEditing = editingId === event.id;
                  const isSelected = selectedId === event.id;
                  return (
                    <tr
                      key={event.id}
                      className={`border-b ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-4 py-2 text-black">
                        {isEditing ? (
                          <input
                            type="text"
                            value={draft.name}
                            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                            className={inputClass}
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSelect(event.id)}
                            className="font-semibold text-blue-700 hover:underline text-left"
                          >
                            {event.name}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-2 text-black">
                        {isEditing ? (
                          <input
                            type="date"
                            value={draft.start_date}
                            onChange={(e) => setDraft({ ...draft, start_date: e.target.value })}
                            className={inputClass}
                          />
                        ) : (
                          formatDate(event.start_date)
                        )}
                      </td>
                      <td className="px-4 py-2 text-black">
                        {isEditing ? (
                          <input
                            type="date"
                            value={draft.end_date}
                            onChange={(e) => setDraft({ ...draft, end_date: e.target.value })}
                            className={inputClass}
                          />
                        ) : (
                          formatDate(event.end_date)
                        )}
                      </td>
                      <td className="px-4 py-2 text-right text-black">{event.transaction_count}</td>
                      <td className="px-4 py-2 text-right text-red-600 font-semibold">
                        {formatCurrency(event.total_expense)}
                      </td>
                      <td className="px-4 py-2 text-center whitespace-nowrap">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={saveEdit}
                              disabled={saving}
                              className="text-green-700 hover:text-green-900 font-semibold mr-3 disabled:text-gray-400"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSelect(event.id)}
                              className="text-blue-700 hover:text-blue-900 font-semibold mr-3"
                            >
                              {isSelected ? 'Hide' : 'Analyze'}
                            </button>
                            <button
                              type="button"
                              onClick={() => startEdit(event)}
                              className="text-gray-700 hover:text-black mr-3"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(event)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedId !== null && loadingAnalysis && (
        <div className="flex items-center justify-center p-8">
          <p className="text-black text-lg">Loading event analysis...</p>
        </div>
      )}

      {selectedId !== null && analysis && !loadingAnalysis && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-black">{analysis.event.name}</h2>
                <p className="text-sm text-gray-600">
                  {formatDate(analysis.event.start_date)} – {formatDate(analysis.event.end_date)} ({analysis.duration_days} day
                  {analysis.duration_days === 1 ? '' : 's'})
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSelect(selectedId)}
                className="text-gray-600 hover:text-black text-xl leading-none"
                aria-label="Close analysis"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border-l-4 border-red-600 pl-4">
                <p className="text-sm text-gray-600 mb-1">Total Expense</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(analysis.total_expense)}</p>
              </div>
              <div className="border-l-4 border-purple-600 pl-4">
                <p className="text-sm text-gray-600 mb-1">Avg Daily Expense</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(analysis.avg_daily_expense)}</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <p className="text-sm text-gray-600 mb-1">Transactions</p>
                <p className="text-2xl font-bold text-blue-600">{analysis.transaction_count}</p>
              </div>
              <div className="border-l-4 border-green-600 pl-4">
                <p className="text-sm text-gray-600 mb-1">Income</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(analysis.total_income)}</p>
              </div>
            </div>
          </div>

          {analysis.categories.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-black">Expense by Category</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CategoryPieChart
                  data={analysis.categories.map((c) => ({ name: c.name, value: c.amount }))}
                  title="Category Distribution"
                />
                <div className="space-y-2">
                  {analysis.categories.map((c) => (
                    <div key={c.name} className="flex justify-between items-center p-3 rounded bg-gray-50">
                      <span className="text-black font-medium">{c.name}</span>
                      <div className="text-right">
                        <p className="text-red-600 font-bold">{formatCurrency(c.amount)}</p>
                        <p className="text-sm text-gray-600">
                          {analysis.total_expense > 0 ? ((c.amount / analysis.total_expense) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {analysis.daily.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-black">Daily Spending</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analysis.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(d: string) => formatDate(d).slice(0, 6)} />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(d) => formatDate(String(d))}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Bar dataKey="amount" name="Expense" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {analysis.payment_methods.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-black">Payment Methods</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {analysis.payment_methods.map((pm) => (
                  <div key={pm.name} className="border-l-4 border-gray-400 pl-4">
                    <p className="text-sm text-gray-600 mb-1">{formatPaymentMethod(pm.name)}</p>
                    <p className="text-lg font-bold text-black">{formatCurrency(pm.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-black">Transactions</h3>
            {analysis.transactions.length === 0 ? (
              <p className="text-black">No transactions are linked to this event yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 border-b-2">
                    <tr>
                      <th className="px-4 py-2 text-black font-bold">Date</th>
                      <th className="px-4 py-2 text-black font-bold">Description</th>
                      <th className="px-4 py-2 text-black font-bold">Category</th>
                      <th className="px-4 py-2 text-black font-bold">Payment</th>
                      <th className="px-4 py-2 text-black font-bold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.transactions.map((t) => (
                      <tr key={t.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 text-black">{formatDate(t.date)}</td>
                        <td className="px-4 py-2 text-black">{t.description || '-'}</td>
                        <td className="px-4 py-2 text-black">{t.category}</td>
                        <td className="px-4 py-2 text-black">{formatPaymentMethod(t.payment_method)}</td>
                        <td
                          className={`px-4 py-2 text-right font-semibold ${
                            t.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {t.type === 'income' ? '+' : '-'}
                          {formatCurrency(t.amount)}
                          {t.is_payment && <span className="ml-1 text-xs text-gray-500">(card bill, not counted)</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
