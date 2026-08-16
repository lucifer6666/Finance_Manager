import { useMemo, useState } from 'react';
import { useSavings } from '../hooks';
import { AddSavingsPlanForm, SavingsComparisonCard } from '../components';
import { SavingsPlan } from '../types';

export const SavingsPage = () => {
  const { investments, plans, entries, comparison, loading, error, addPlan, updatePlan, backfillEntries, deleteEntry, migrateToPlans, refreshPlansAndEntries } = useSavings();
  const [activeTab, setActiveTab] = useState<'plans' | 'add-plan' | 'entries'>('plans');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isMigrating, setIsMigrating] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [editingPlan, setEditingPlan] = useState<Partial<SavingsPlan> | null>(null);

  const filteredEntries = useMemo(() => {
    if (!selectedMonth) return entries;
    const [year, month] = selectedMonth.split('-').map(Number);
    return entries.filter((entry) => {
      const entryDate = new Date(entry.entry_date);
      return entryDate.getFullYear() === year && entryDate.getMonth() + 1 === month;
    });
  }, [entries, selectedMonth]);

  const handleStartEdit = (plan: SavingsPlan) => {
    setEditingPlanId(plan.id);
    setEditingPlan({
      name: plan.name,
      investment_type: plan.investment_type,
      amount: plan.amount,
      recurring_type: plan.recurring_type,
      due_date: plan.due_date,
      start_date: plan.start_date || new Date().toISOString().slice(0, 10),
      end_date: plan.end_date || '',
      is_active: plan.is_active,
      description: plan.description || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingPlanId || !editingPlan) return;

    try {
      await updatePlan(editingPlanId, editingPlan);
      setEditingPlanId(null);
      setEditingPlan(null);
    } catch (error) {
      console.error('Failed to save plan update', error);
    }
  };

  const getMonthlyEquivalent = (plan: SavingsPlan) =>
    plan.recurring_type === 'yearly' ? plan.amount / 12 : plan.amount;

  const handleTogglePlanStatus = async (plan: SavingsPlan) => {
    await updatePlan(plan.id, { is_active: !plan.is_active });
  };

  const handleDeleteEntry = async (entryId: number) => {
    if (!window.confirm('Delete this monthly saving entry?')) return;

    try {
      await deleteEntry(entryId);
      const [year, month] = selectedMonth.split('-').map(Number);
      await refreshPlansAndEntries(year, month);
    } catch (error) {
      console.error('Failed to delete entry', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-700 font-semibold">Loading savings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-semibold mb-2">Error Loading Data</p>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-gray-900">Savings & Investments</h1>

      {comparison && <SavingsComparisonCard comparison={comparison} />}

      <div className="bg-white rounded-lg shadow-md p-2">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'plans', label: 'View Plans' },
            { key: 'add-plan', label: '+ Add Plan' },
            { key: 'entries', label: 'Monthly Entries' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'plans' | 'add-plan' | 'entries')}
              className={`px-4 py-2 rounded-md font-semibold ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-2xl shadow-md">
              <p className="text-sm opacity-90">Active Plans</p>
              <p className="text-3xl font-bold mt-2">{plans.filter((plan) => plan.is_active).length}</p>
            </div>
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-5 rounded-2xl shadow-md">
              <p className="text-sm opacity-90">Monthly Commitment</p>
              <p className="text-3xl font-bold mt-2">₹{plans.filter((plan) => plan.is_active).reduce((sum, plan) => sum + getMonthlyEquivalent(plan), 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white p-5 rounded-2xl shadow-md">
              <p className="text-sm opacity-90">Entries This Month</p>
              <p className="text-3xl font-bold mt-2">₹{filteredEntries.reduce((sum, entry) => sum + entry.amount, 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <h2 className="text-2xl font-bold text-black p-6 pb-2">Saving Plans</h2>
            {plans.length === 0 ? (
              <p className="px-6 pb-6 text-gray-600">No saving plans configured yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-700">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-black">Name</th>
                      <th className="px-6 py-3 font-semibold text-black">Type</th>
                      <th className="px-6 py-3 font-semibold text-black">Amount</th>
                      <th className="px-6 py-3 font-semibold text-black">Schedule</th>
                      <th className="px-6 py-3 font-semibold text-black">Due</th>
                      <th className="px-6 py-3 font-semibold text-black">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => {
                      const badgeClass = plan.investment_type === 'mutual_fund'
                        ? 'bg-blue-100 text-blue-800'
                        : plan.investment_type === 'fixed_deposit'
                          ? 'bg-emerald-100 text-emerald-800'
                          : plan.investment_type === 'life_insurance'
                            ? 'bg-violet-100 text-violet-800'
                            : plan.investment_type === 'stock'
                              ? 'bg-amber-100 text-amber-800'
                              : plan.investment_type === 'crypto'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-slate-100 text-slate-800';

                      return (
                        <tr key={plan.id} className="border-t border-gray-200 hover:bg-slate-50">
                          <td className="px-6 py-4 font-semibold text-black">{plan.name}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                              {plan.investment_type.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-green-700">₹{getMonthlyEquivalent(plan).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${plan.recurring_type === 'yearly' ? 'bg-indigo-100 text-indigo-800' : 'bg-cyan-100 text-cyan-800'}`}>
                              {plan.recurring_type ? plan.recurring_type.charAt(0).toUpperCase() + plan.recurring_type.slice(1) : 'One-time'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-black">Day {plan.due_date}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                                {plan.is_active ? 'Active' : 'Inactive'}
                              </span>
                              <button
                                onClick={() => handleStartEdit(plan)}
                                className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleTogglePlanStatus(plan)}
                                className="text-xs font-semibold text-orange-700 hover:text-orange-900"
                              >
                                {plan.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {editingPlanId && editingPlan && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-black mb-4">Edit Saving Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={editingPlan.name || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                  placeholder="Plan name"
                />
                <select
                  value={editingPlan.investment_type || 'fixed_deposit'}
                  onChange={(e) => setEditingPlan({ ...editingPlan, investment_type: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                >
                  <option value="mutual_fund">Mutual Fund</option>
                  <option value="life_insurance">Life Insurance</option>
                  <option value="fixed_deposit">Fixed Deposit</option>
                  <option value="stock">Stock</option>
                  <option value="crypto">Crypto</option>
                  <option value="recurring_savings">Recurring Savings</option>
                  <option value="ppf">PPF</option>
                  <option value="nsc">NSC</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="number"
                  value={editingPlan.amount ?? 0}
                  onChange={(e) => setEditingPlan({ ...editingPlan, amount: Number(e.target.value) })}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                  placeholder="Amount"
                />
                <select
                  value={editingPlan.recurring_type || 'monthly'}
                  onChange={(e) => setEditingPlan({ ...editingPlan, recurring_type: e.target.value as 'monthly' | 'yearly' })}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={editingPlan.due_date ?? 1}
                  onChange={(e) => setEditingPlan({ ...editingPlan, due_date: Number(e.target.value) })}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                  placeholder="Due day"
                />
                <input
                  type="date"
                  value={editingPlan.start_date || new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setEditingPlan({ ...editingPlan, start_date: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                />
                <input
                  type="date"
                  value={editingPlan.end_date || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, end_date: e.target.value || null })}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                />
                <label className="flex items-center gap-2 text-sm font-medium text-black">
                  <input
                    type="checkbox"
                    checked={!!editingPlan.is_active}
                    onChange={(e) => setEditingPlan({ ...editingPlan, is_active: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <textarea
                value={editingPlan.description || ''}
                onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                placeholder="Description"
                className="mt-4 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                rows={3}
              />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleSaveEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditingPlanId(null);
                    setEditingPlan(null);
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'add-plan' && (
        <div className="space-y-6">
          <AddSavingsPlanForm onAdd={addPlan} loading={isMigrating} />

          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-indigo-900 mb-3">Backfill Missing Monthly Entries</h3>
            <p className="text-indigo-800 mb-4">
              Generate any missing monthly saving entries from each active plan’s start date through the current month.
            </p>
            <button
              onClick={async () => {
                try {
                  const result = await backfillEntries();
                  alert(result?.message || 'Backfill completed successfully!');
                } catch (err) {
                  alert('Backfill failed. Please try again.');
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Backfill Now
            </button>
          </div>

          {investments.some(inv => inv.is_recurring) && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-blue-900 mb-3">Migrate Legacy Investments</h3>
              <p className="text-blue-800 mb-4">
                You have {investments.filter(inv => inv.is_recurring).length} recurring investment(s) from the old system. 
                Convert them to the new Saving Plans system for better management and historical accuracy.
              </p>
              <button
                onClick={async () => {
                  if (window.confirm('This will convert all recurring investments to saving plans. Continue?')) {
                    try {
                      setIsMigrating(true);
                      await migrateToPlans();
                      alert('Migration completed successfully!');
                    } catch (err) {
                      alert('Migration failed. Please try again.');
                    } finally {
                      setIsMigrating(false);
                    }
                  }
                }}
                disabled={isMigrating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                {isMigrating ? 'Migrating...' : 'Migrate Now'}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'entries' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="text-2xl font-bold text-black">Monthly Saving Entries</h2>
            <div>
              <label className="text-sm font-semibold text-black mr-2">Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={async (e) => {
                  const nextMonth = e.target.value;
                  setSelectedMonth(nextMonth);
                  if (nextMonth) {
                    const [year, month] = nextMonth.split('-').map(Number);
                    await refreshPlansAndEntries(year, month);
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-black"
              />
            </div>
          </div>

          {filteredEntries.length === 0 ? (
            <p className="text-gray-600">No saving entries added for this month yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-black">Date</th>
                    <th className="px-4 py-3 font-semibold text-black">Plan</th>
                    <th className="px-4 py-3 font-semibold text-black">Amount</th>
                    <th className="px-4 py-3 font-semibold text-black">Source</th>
                    <th className="px-4 py-3 font-semibold text-black">Description</th>
                    <th className="px-4 py-3 font-semibold text-black text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="border-t border-gray-200">
                      <td className="px-4 py-3">{new Date(entry.entry_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-semibold text-black">{plans.find((p) => p.id === entry.plan_id)?.name || 'Plan #' + entry.plan_id}</td>
                      <td className="px-4 py-3 font-semibold text-green-700">₹{entry.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 capitalize">{entry.source}</td>
                      <td className="px-4 py-3">{entry.description || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-800 font-semibold"
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
      )}

    </div>
  );
};
