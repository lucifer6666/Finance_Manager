import { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { transactionApi } from '../api/client';

export const useTransactions = (year: number, month: number) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await transactionApi.getByMonth(year, month);
        setTransactions(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch transactions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [year, month]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>) => {
    try {
      const response = await transactionApi.create(transaction);
      setTransactions([...transactions, response.data]);
      return response.data;
    } catch (err) {
      setError('Failed to add transaction');
      console.error(err);
      throw err;
    }
  };

  const updateTransaction = async (id: number, transaction: Omit<Transaction, 'id' | 'created_at'>) => {
    try {
      const response = await transactionApi.update(id, transaction);
      setTransactions(transactions.map(t => t.id === id ? response.data : t));
      return response.data;
    } catch (err) {
      setError('Failed to update transaction');
      console.error(err);
      throw err;
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      await transactionApi.delete(id);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete transaction');
      console.error(err);
      throw err;
    }
  };

  return { transactions, loading, error, addTransaction, updateTransaction, deleteTransaction };
};
