import { useState, useEffect } from 'react';
import { SavingsInvestment, SavingsComparison } from '../types';
import { savingsApi } from '../api/client';

export const useSavings = () => {
  const [investments, setInvestments] = useState<SavingsInvestment[]>([]);
  const [comparison, setComparison] = useState<SavingsComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [investmentsRes, comparisonRes] = await Promise.all([
          savingsApi.getAll(),
          savingsApi.getComparison(),
        ]);
        setInvestments(investmentsRes.data);
        setComparison(comparisonRes.data);
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
      setInvestments([...investments, response.data]);
      // Refresh comparison
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
      // Get the existing investment to merge with updates
      const existing = investments.find(i => i.id === id);
      if (!existing) throw new Error('Investment not found');
      
      const mergedInvestment = { ...existing, ...investment };
      const response = await savingsApi.update(id, mergedInvestment as Omit<SavingsInvestment, 'id' | 'created_at' | 'updated_at'>);
      setInvestments(investments.map(i => i.id === id ? response.data : i));
      // Refresh comparison
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
      setInvestments(investments.filter(i => i.id !== id));
      // Refresh comparison
      const comparisonRes = await savingsApi.getComparison();
      setComparison(comparisonRes.data);
    } catch (err) {
      setError('Failed to delete investment');
      console.error(err);
      throw err;
    }
  };

  return {
    investments,
    comparison,
    loading,
    error,
    addInvestment,
    updateInvestment,
    deleteInvestment,
  };
};
