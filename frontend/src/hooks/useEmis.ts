import { useState, useEffect } from 'react';
import { emiApi } from '../api/client';
import { EMI } from '../types';

export const useEmis = () => {
  const [emis, setEmis] = useState<EMI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmis = async () => {
    try {
      setLoading(true);
      const response = await emiApi.getAll();
      setEmis(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch EMIs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmis();
  }, []);

  const addEmi = async (emi: { name: string; amount: number; type?: string; category: string; description: string; payment_method?: string; credit_card_id?: number | null; due_date: number; start_date?: string; end_date?: string | null; is_active?: boolean }) => {
    try {
      setLoading(true);
      const response = await emiApi.create(emi);
      setEmis(prev => [...prev, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      setError('Failed to create EMI');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEmi = async (id: number, updates: { name?: string; amount?: number; type?: string; category?: string; description?: string; payment_method?: string; credit_card_id?: number | null; due_date?: number; start_date?: string; end_date?: string | null; is_active?: boolean }) => {
    try {
      setLoading(true);
      const response = await emiApi.update(id, updates);
      setEmis(prev => prev.map(item => item.id === id ? response.data : item));
      setError(null);
      return response.data;
    } catch (err) {
      setError('Failed to update EMI');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEmi = async (id: number) => {
    try {
      setLoading(true);
      await emiApi.delete(id);
      setEmis(prev => prev.filter(item => item.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete EMI');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    emis,
    loading,
    error,
    fetchEmis,
    addEmi,
    updateEmi,
    deleteEmi,
  };
};
