import { useState, useEffect } from 'react';
import { CreditCard } from '../types';
import { creditCardApi } from '../api/client';

export const useCreditCards = () => {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const response = await creditCardApi.getAll();
        setCards(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch credit cards');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  const addCard = async (card: Omit<CreditCard, 'id' | 'created_at' | 'transactions'>) => {
    try {
      const response = await creditCardApi.create(card);
      setCards([...cards, response.data]);
      return response.data;
    } catch (err) {
      setError('Failed to add credit card');
      console.error(err);
      throw err;
    }
  };

  const updateCard = async (id: number, card: Omit<CreditCard, 'id' | 'created_at' | 'transactions'>) => {
    try {
      const response = await creditCardApi.update(id, card);
      setCards(cards.map(c => c.id === id ? response.data : c));
      return response.data;
    } catch (err) {
      setError('Failed to update credit card');
      console.error(err);
      throw err;
    }
  };

  const deleteCard = async (id: number) => {
    try {
      await creditCardApi.delete(id);
      setCards(cards.filter(c => c.id !== id));
    } catch (err) {
      setError('Failed to delete credit card');
      console.error(err);
      throw err;
    }
  };

  return { cards, loading, error, addCard, updateCard, deleteCard };
};
