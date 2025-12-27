import { useState, useEffect } from 'react';
import { Analytics } from '../types';
import { analyticsApi } from '../api/client';

export const useAnalytics = (year: number, month: number) => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await analyticsApi.getCurrentSummary();
        setAnalytics(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch analytics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [year, month]);

  return { analytics, loading, error };
};
