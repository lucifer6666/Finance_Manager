from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List


class TransactionBase(BaseModel):
    date: date
    amount: float
    type: str  # "income" or "expense"
    category: str
    description: Optional[str] = None
    payment_method: str  # "cash", "card", "upi", "bank"
    credit_card_id: Optional[int] = None


class TransactionCreate(TransactionBase):
    pass


class Transaction(TransactionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CreditCardBase(BaseModel):
    name: str
    bank_name: str
    billing_cycle_start: int
    billing_cycle_end: int
    due_date: int
    credit_limit: float


class CreditCardCreate(CreditCardBase):
    pass


class CreditCard(CreditCardBase):
    id: int
    created_at: datetime
    transactions: List[Transaction] = []

    class Config:
        from_attributes = True


class MonthlySummary(BaseModel):
    month: str  # YYYY-MM format
    total_income: float
    total_expense: float
    savings: float
    top_categories: List[tuple]


class YearlySummary(BaseModel):
    year: int
    total_income: float
    total_expense: float
    savings: float
    monthly_breakdown: List[dict]


class Insight(BaseModel):
    message: str
    severity: str  # "info", "warning", "alert"


class SavingsInvestmentBase(BaseModel):
    name: str
    investment_type: str  # "mutual_fund", "life_insurance", "fixed_deposit", "stock", "crypto", "other"
    purchase_date: date
    initial_amount: float
    current_value: float
    description: Optional[str] = None
    is_recurring: bool = False
    recurring_type: Optional[str] = None  # "monthly" or "yearly"
    recurring_amount: Optional[float] = None


class SavingsInvestmentCreate(SavingsInvestmentBase):
    pass


class SavingsInvestment(SavingsInvestmentBase):
    id: int
    last_recurring_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SavingsComparison(BaseModel):
    account_balance: float  # Current month's income - expense
    total_invested: float  # Total amount initially invested
    total_current_investment_value: float  # Current value of all investments
    investment_profit_loss: float  # Difference between current value and initial amount
    cash_savings: float  # Account balance minus total invested
    difference: float  # Account balance vs total invested comparison



class Analytics(BaseModel):
    monthly_summary: MonthlySummary
    insights: List[Insight]
