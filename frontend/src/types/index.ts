export interface Transaction {
  id: number;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  payment_method: 'upi' | 'cash' | 'card' | 'bank';
  credit_card_id?: number;
  is_payment?: boolean;
  created_at: string;
}

export interface CreditCardPayment {
  id: number;
  credit_card_id: number;
  payment_date: string;
  amount: number;
  payment_method: 'cash' | 'upi' | 'bank' | 'cheque';
  transaction_id?: number;
  description?: string;
  created_at: string;
}

export interface CreditCard {
  id: number;
  name: string;
  bank_name: string;
  billing_cycle_start: number;
  billing_cycle_end: number;
  due_date: number;
  credit_limit: number;
  created_at: string;
  transactions?: Transaction[];
  payments?: CreditCardPayment[];
}

export interface SavingsInvestment {
  id: number;
  name: string;
  investment_type: 'mutual_fund' | 'life_insurance' | 'fixed_deposit' | 'stock' | 'crypto' | 'other';
  purchase_date: string;
  initial_amount: number;
  current_value: number;
  description?: string;
  is_recurring: boolean;
  recurring_type?: 'monthly' | 'yearly' | null;
  recurring_amount?: number | null;
  last_recurring_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavingsComparison {
  account_balance: number;
  total_invested: number;
  total_current_investment_value: number;
  investment_profit_loss: number;
  cash_savings: number;
  difference: number;
}

export interface SavingsPlan {
  id: number;
  name: string;
  investment_type: string;
  amount: number;
  recurring_type?: 'monthly' | 'yearly' | null;
  due_date: number;
  start_date?: string;
  end_date?: string | null;
  is_active: boolean;
  description?: string;
  last_processed_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavingsEntry {
  id: number;
  plan_id: number;
  amount: number;
  entry_date: string;
  description?: string;
  source: 'auto' | 'manual';
  created_at: string;
}

export interface EMI {
  id: number;
  name: string;  // e.g., "Home Loan", "Car EMI"
  amount: number;
  type: string;  // "expense" (or "income" in theory, but should be "expense" for EMI)
  category: string;  // e.g., "EMI", "Loan"
  description: string;  // e.g., "Home Loan EMI"
  payment_method: string;  // "bank", "card", "cash", "upi"
  credit_card_id?: number | null;  // For credit card EMIs
  due_date: number;  // Day of month (1-31)
  start_date?: string;
  end_date?: string | null;
  is_active: boolean;
  last_added_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlySummary {
  month: string;
  total_income: number;
  total_expense: number;
  savings: number;
  investments: number;
  top_categories: Array<[string, number]>;
}

export interface YearlySummary {
  year: number;
  total_income: number;
  total_expense: number;
  savings: number;
  monthly_breakdown: Array<{
    month: string;
    income: number;
    expense: number;
    savings: number;
  }>;
}

export interface Insight {
  message: string;
  severity: 'info' | 'warning' | 'alert';
}

export interface Analytics {
  monthly_summary: MonthlySummary;
  insights: Insight[];
}

export interface CardUtilization {
  card_id: number;
  card_name: string;
  credit_limit: number;
  amount_spent: number;
  utilization_percent: number;
  days_to_due: number;
}

