import axios, { AxiosInstance } from 'axios';
import {
  Transaction,
  CreditCard,
  CreditCardPayment,
  SavingsInvestment,
  SavingsComparison,
  SavingsPlan,
  SavingsEntry,
  EMI,
  MonthlySummary,
  YearlySummary,
  Insight,
  Analytics,
  CardUtilization,
} from '../types';

// Get API URL from environment or use local IP for WiFi network access
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.17:8000/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Transaction APIs
export const transactionApi = {
  create: (transaction: Omit<Transaction, 'id' | 'created_at'>) =>
    axiosInstance.post<Transaction>('/transactions/', transaction),
  
  getAll: (skip: number = 0, limit: number = 100) =>
    axiosInstance.get<Transaction[]>('/transactions/', { params: { skip, limit } }),
  
  getByMonth: (year: number, month: number) =>
    axiosInstance.get<Transaction[]>(`/transactions/monthly/${year}/${month}`),
  
  getByDateRange: (startDate: string, endDate: string) =>
    axiosInstance.get<Transaction[]>('/transactions/range/', {
      params: { start_date: startDate, end_date: endDate },
    }),
  
  getById: (id: number) =>
    axiosInstance.get<Transaction>(`/transactions/${id}`),
  
  update: (id: number, transaction: Omit<Transaction, 'id' | 'created_at'>) =>
    axiosInstance.put<Transaction>(`/transactions/${id}`, transaction),
  
  delete: (id: number) =>
    axiosInstance.delete(`/transactions/${id}`),
};

// Credit Card APIs
export const creditCardApi = {
  create: (card: Omit<CreditCard, 'id' | 'created_at' | 'transactions'>) =>
    axiosInstance.post<CreditCard>('/cards/', card),
  
  getAll: () =>
    axiosInstance.get<CreditCard[]>('/cards/'),
  
  getById: (id: number) =>
    axiosInstance.get<CreditCard>(`/cards/${id}`),
  
  update: (id: number, card: Omit<CreditCard, 'id' | 'created_at' | 'transactions'>) =>
    axiosInstance.put<CreditCard>(`/cards/${id}`, card),
  
  delete: (id: number) =>
    axiosInstance.delete(`/cards/${id}`),
  
  getUtilization: (id: number) =>
    axiosInstance.get<CardUtilization>(`/cards/${id}/utilization`),
};

// Savings Investment APIs
export const savingsApi = {
  create: (investment: Omit<SavingsInvestment, 'id' | 'created_at' | 'updated_at'>) =>
    axiosInstance.post<SavingsInvestment>('/savings/', investment),
  
  getAll: () =>
    axiosInstance.get<SavingsInvestment[]>('/savings/'),

  getPlans: () =>
    axiosInstance.get<SavingsPlan[]>('/savings/plans'),

  createPlan: (plan: { name: string; investment_type: string; amount: number; recurring_type?: 'monthly' | 'yearly' | null; due_date?: number; start_date?: string; end_date?: string | null; is_active?: boolean; description?: string }) =>
    axiosInstance.post<SavingsPlan>('/savings/plans', plan),

  updatePlan: (id: number, plan: Partial<SavingsPlan>) =>
    axiosInstance.put<SavingsPlan>(`/savings/plans/${id}`, plan),

  backfillEntries: () =>
    axiosInstance.post('/savings/plans/backfill'),

  deletePlan: (id: number) =>
    axiosInstance.delete(`/savings/plans/${id}`),

  getEntries: () =>
    axiosInstance.get<SavingsEntry[]>('/savings/entries'),

  getEntriesByMonth: (year: number, month: number) =>
    axiosInstance.get<SavingsEntry[]>(`/savings/entries/monthly/${year}/${month}`),

  createEntry: (entry: { plan_id: number; amount: number; entry_date: string; description?: string; source?: 'auto' | 'manual' }) =>
    axiosInstance.post<SavingsEntry>('/savings/entries', entry),

  deleteEntry: (id: number) =>
    axiosInstance.delete(`/savings/entries/${id}`),
  
  getById: (id: number) =>
    axiosInstance.get<SavingsInvestment>(`/savings/${id}`),
  
  update: (id: number, investment: Omit<SavingsInvestment, 'id' | 'created_at' | 'updated_at'>) =>
    axiosInstance.put<SavingsInvestment>(`/savings/${id}`, investment),
  
  delete: (id: number) =>
    axiosInstance.delete(`/savings/${id}`),
  
  getComparison: () =>
    axiosInstance.get<SavingsComparison>('/savings/comparison/current'),

  migrateToPlans: () =>
    axiosInstance.post('/savings/migrate/legacy-to-plans'),
};

// Analytics APIs
export const analyticsApi = {
  getMonthly: (year: number, month: number, includeInvestments: boolean = true) =>
    axiosInstance.get<MonthlySummary>(`/analytics/monthly/${year}/${month}`, { params: { include_investments: includeInvestments } }),
  
  getYearly: (year: number) =>
    axiosInstance.get<YearlySummary>(`/analytics/yearly/${year}`),
  
  getInsights: (year: number, month: number) =>
    axiosInstance.get<Insight[]>(`/analytics/insights/${year}/${month}`),
  
  getSpendingTrends: (months: number = 6, year?: number) =>
    axiosInstance.get(`/analytics/trends/spending`, { params: { months, ...(year && { year }) } }),
  
  getCurrentSummary: (includeInvestments: boolean = false) =>
    axiosInstance.get<Analytics>('/analytics/summary/current', { params: { include_investments: includeInvestments } }),
  
  getYearlyCategories: (year: number, includeInvestments: boolean = true) =>
    axiosInstance.get(`/analytics/categories/yearly/${year}`, { params: { include_investments: includeInvestments } }),

  getCategoryBreakdown: (year: number, month: number, category: string) =>
    axiosInstance.get(`/analytics/category/breakdown/${year}/${month}/${encodeURIComponent(category)}`),
};

// Salary APIs
export const salaryApi = {
  create: (salary: { name: string; amount: number; start_date?: string; is_active?: boolean; description?: string }) =>
    axiosInstance.post('/salaries/', salary),
  
  getAll: () =>
    axiosInstance.get('/salaries/'),
  
  getActive: () =>
    axiosInstance.get('/salaries/active'),
  
  getById: (id: number) =>
    axiosInstance.get(`/salaries/${id}`),
  
  update: (id: number, salary: { name?: string; amount?: number; start_date?: string; is_active?: boolean; description?: string }) =>
    axiosInstance.put(`/salaries/${id}`, salary),
  
  delete: (id: number) =>
    axiosInstance.delete(`/salaries/${id}`),
  
  processMonthly: () =>
    axiosInstance.post('/salaries/process/monthly'),
};

// EMI APIs
export const emiApi = {
  create: (emi: { name: string; amount: number; type?: string; category: string; description: string; payment_method?: string; credit_card_id?: number | null; due_date: number; start_date?: string; end_date?: string | null; is_active?: boolean }) =>
    axiosInstance.post('/emi/', emi),

  getAll: () =>
    axiosInstance.get<EMI[]>('/emi/'),

  getActive: () =>
    axiosInstance.get<EMI[]>('/emi/active'),

  getById: (id: number) =>
    axiosInstance.get<EMI>(`/emi/${id}`),

  update: (id: number, emi: { name?: string; amount?: number; type?: string; category?: string; description?: string; payment_method?: string; credit_card_id?: number | null; due_date?: number; start_date?: string; end_date?: string | null; is_active?: boolean }) =>
    axiosInstance.put<EMI>(`/emi/${id}`, emi),

  delete: (id: number) =>
    axiosInstance.delete(`/emi/${id}`),

  processMonthly: () =>
    axiosInstance.post('/emi/process/monthly'),
};

// Credit Card Payment APIs
export const paymentApi = {
  create: (payment: Omit<CreditCardPayment, 'id' | 'created_at'>) =>
    axiosInstance.post<CreditCardPayment>('/payments/', payment),
  
  getAll: (skip: number = 0, limit: number = 100) =>
    axiosInstance.get<CreditCardPayment[]>('/payments/', { params: { skip, limit } }),
  
  getByCard: (cardId: number, skip: number = 0, limit: number = 100) =>
    axiosInstance.get<CreditCardPayment[]>(`/payments/card/${cardId}`, { params: { skip, limit } }),
  
  getByDateRange: (startDate: string, endDate: string) =>
    axiosInstance.get<CreditCardPayment[]>('/payments/range/', {
      params: { start_date: startDate, end_date: endDate },
    }),
  
  getById: (id: number) =>
    axiosInstance.get<CreditCardPayment>(`/payments/${id}`),
  
  update: (id: number, payment: Omit<CreditCardPayment, 'id' | 'created_at'>) =>
    axiosInstance.put<CreditCardPayment>(`/payments/${id}`, payment),
  
  delete: (id: number) =>
    axiosInstance.delete(`/payments/${id}`),
};

export default axiosInstance;
