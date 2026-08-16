import { useState, useEffect } from 'react';
import { SavingsInvestment, SavingsComparison, SavingsPlan, SavingsEntry } from '../types';
import { savingsApi } from '../api/client';

export const useSavings = () => {
  const [investments, setInvestments] = useState<SavingsInvestment[]>([]);
  const [plans, setPlans] = useState<SavingsPlan[]>([]);
  const [entries, setEntries] = useState<SavingsEntry[]>([]);
  const [comparison, setComparison] = useState<SavingsComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    const now = new Date();
    const [investmentsRes, comparisonRes, plansRes, entriesRes] = await Promise.all([
      savingsApi.getAll(),
      savingsApi.getComparison(),
      savingsApi.getPlans(),
      savingsApi.getEntriesByMonth(now.getFullYear(), now.getMonth() + 1),
    ]);

    setInvestments(investmentsRes.data);
    setComparison(comparisonRes.data);
    setPlans(plansRes.data);
    setEntries(entriesRes.data);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await loadDashboardData();
        setError(null);
      } catch (err) {
        setError('Failed to fetch savings data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addInvestment = async (investment: Omit<SavingsInvestment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await savingsApi.create(investment);
      setInvestments(prev => [...prev, response.data]);
      const comparisonRes = await savingsApi.getComparison();
      setComparison(comparisonRes.data);
      return response.data;
    } catch (err) {
      setError('Failed to add investment');
      console.error(err);
      throw err;
    }
  };

  const updateInvestment = async (id: number, investment: Partial<SavingsInvestment>) => {
    try {
      const existing = investments.find(i => i.id === id);
      if (!existing) throw new Error('Investment not found');

      const mergedInvestment = { ...existing, ...investment };
      const response = await savingsApi.update(id, mergedInvestment as Omit<SavingsInvestment, 'id' | 'created_at' | 'updated_at'>);
      setInvestments(prev => prev.map(i => i.id === id ? response.data : i));
      const comparisonRes = await savingsApi.getComparison();
      setComparison(comparisonRes.data);
      return response.data;
    } catch (err) {
      setError('Failed to update investment');
      console.error(err);
      throw err;
    }
  };

  const deleteInvestment = async (id: number) => {
    try {
      await savingsApi.delete(id);
      setInvestments(prev => prev.filter(i => i.id !== id));
      const comparisonRes = await savingsApi.getComparison();
      setComparison(comparisonRes.data);
    } catch (err) {
      setError('Failed to delete investment');
      console.error(err);
      throw err;
    }
  };

  const refreshPlansAndEntries = async (year?: number, month?: number) => {
    const targetYear = year ?? new Date().getFullYear();
    const targetMonth = month ?? new Date().getMonth() + 1;

    try {
      const [plansRes, entriesRes, comparisonRes] = await Promise.all([
        savingsApi.getPlans(),
        savingsApi.getEntriesByMonth(targetYear, targetMonth),
        savingsApi.getComparison(),
      ]);
      setPlans(plansRes.data);
      setEntries(entriesRes.data);
      setComparison(comparisonRes.data);
    } catch (err) {
      console.error('Failed to refresh plans/entries', err);
    }
  };

  const addPlan = async (plan: Omit<SavingsPlan, 'id' | 'created_at' | 'updated_at' | 'last_processed_date'>) => {
    try {
      const response = await savingsApi.createPlan(plan as any);
      setPlans(prev => [...prev, response.data]);
      const comparisonRes = await savingsApi.getComparison();
      setComparison(comparisonRes.data);
      return response.data;
    } catch (err) {
      setError('Failed to create saving plan');
      console.error(err);
      throw err;
    }
  };

  const updatePlan = async (id: number, plan: Partial<SavingsPlan>) => {
    try {
      const response = await savingsApi.updatePlan(id, plan);
      setPlans(prev => prev.map(p => p.id === id ? response.data : p));
      const comparisonRes = await savingsApi.getComparison();
      setComparison(comparisonRes.data);
      return response.data;
    } catch (err) {
      setError('Failed to update saving plan');
      console.error(err);
      throw err;
    }
  };

  const deletePlan = async (id: number) => {
    try {
      await savingsApi.deletePlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
      const comparisonRes = await savingsApi.getComparison();
      setComparison(comparisonRes.data);
    } catch (err) {
      setError('Failed to delete saving plan');
      console.error(err);
      throw err;
    }
  };

  const backfillEntries = async () => {
    try {
      const response = await savingsApi.backfillEntries();
      await loadDashboardData();
      return response.data;
    } catch (err) {
      setError('Failed to backfill saving entries');
      console.error(err);
      throw err;
    }
  };

  const deleteEntry = async (id: number) => {
    try {
      await savingsApi.deleteEntry(id);
      setEntries(prev => prev.filter(entry => entry.id !== id));
      const comparisonRes = await savingsApi.getComparison();
      setComparison(comparisonRes.data);
    } catch (err) {
      setError('Failed to delete saving entry');
      console.error(err);
      throw err;
    }
  };

  const migrateToPlans = async () => {
    try {
      setLoading(true);
      const response = await savingsApi.migrateToPlans();
      // Refresh plans and investments after migration
      await loadDashboardData();
      setError(null);
      return response.data;
    } catch (err) {
      setError('Failed to migrate investments to plans');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    investments,
    plans,
    entries,
    comparison,
    loading,
    error,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addPlan,
    updatePlan,
    deletePlan,
    backfillEntries,
    deleteEntry,
    migrateToPlans,
    refreshPlansAndEntries,
    loadDashboardData,
  };
};
