import axios, { AxiosInstance } from 'axios';
import {
  Transaction,
  CreditCard,
  CreditCardPayment,
  SavingsInvestment,
  SavingsComparison,
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
  
  getById: (id: number) =>
    axiosInstance.get<SavingsInvestment>(`/savings/${id}`),
  
  update: (id: number, investment: Omit<SavingsInvestment, 'id' | 'created_at' | 'updated_at'>) =>
    axiosInstance.put<SavingsInvestment>(`/savings/${id}`, investment),
  
  delete: (id: number) =>
    axiosInstance.delete(`/savings/${id}`),
  
  getComparison: () =>
    axiosInstance.get<SavingsComparison>('/savings/comparison/current'),
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
};

// Salary APIs
export const salaryApi = {
  create: (salary: { name: string; amount: number; is_active?: boolean; description?: string }) =>
    axiosInstance.post('/salaries/', salary),
  
  getAll: () =>
    axiosInstance.get('/salaries/'),
  
  getActive: () =>
    axiosInstance.get('/salaries/active'),
  
  getById: (id: number) =>
    axiosInstance.get(`/salaries/${id}`),
  
  update: (id: number, salary: { name?: string; amount?: number; is_active?: boolean; description?: string }) =>
    axiosInstance.put(`/salaries/${id}`, salary),
  
  delete: (id: number) =>
    axiosInstance.delete(`/salaries/${id}`),
  
  processMonthly: () =>
    axiosInstance.post('/salaries/process/monthly'),
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
