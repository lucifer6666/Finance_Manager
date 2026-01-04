import { useState, useCallback } from 'react';
import { CreditCardPayment } from '../types';
import { paymentApi } from '../api/client';

export const usePayments = () => {
  const [payments, setPayments] = useState<CreditCardPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentApi.getAll();
      setPayments(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPaymentsByCard = useCallback(async (cardId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentApi.getByCard(cardId);
      setPayments(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, []);

  const addPayment = useCallback(async (paymentData: Omit<CreditCardPayment, 'id' | 'created_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentApi.create(paymentData);
      setPayments(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add payment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePayment = useCallback(async (paymentId: number) => {
    setLoading(true);
    setError(null);
    try {
      await paymentApi.delete(paymentId);
      setPayments(prev => prev.filter(p => p.id !== paymentId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete payment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePayment = useCallback(async (paymentId: number, paymentData: Omit<CreditCardPayment, 'id' | 'created_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentApi.update(paymentId, paymentData);
      setPayments(prev => prev.map(p => p.id === paymentId ? response.data : p));
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update payment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    payments,
    loading,
    error,
    fetchPayments,
    fetchPaymentsByCard,
    addPayment,
    deletePayment,
    updatePayment,
  };
};
