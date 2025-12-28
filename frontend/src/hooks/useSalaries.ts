import { useState, useEffect } from 'react';
import { salaryApi } from '../api/client';

export interface Salary {
  id: number;
  name: string;
  amount: number;
  start_date?: string;
  is_active: boolean;
  description?: string;
  last_added_date?: string;
  created_at: string;
  updated_at: string;
}

export const useSalaries = () => {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const response = await salaryApi.getAll();
      setSalaries(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch salaries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  const addSalary = async (salary: { name: string; amount: number; is_active?: boolean; description?: string }) => {
    try {
      setLoading(true);
      const response = await salaryApi.create(salary);
      setSalaries([...salaries, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      setError('Failed to create salary');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSalary = async (id: number, updates: { name?: string; amount?: number; is_active?: boolean; description?: string }) => {
    try {
      setLoading(true);
      const response = await salaryApi.update(id, updates);
      setSalaries(salaries.map(s => s.id === id ? response.data : s));
      setError(null);
      return response.data;
    } catch (err) {
      setError('Failed to update salary');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSalary = async (id: number) => {
    try {
      setLoading(true);
      await salaryApi.delete(id);
      setSalaries(salaries.filter(s => s.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete salary');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    salaries,
    loading,
    error,
    fetchSalaries,
    addSalary,
    updateSalary,
    deleteSalary,
  };
};
