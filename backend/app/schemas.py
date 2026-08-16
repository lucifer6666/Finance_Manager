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
    is_payment: bool = False  # whether this is a credit card payment


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


class CreditCardPaymentBase(BaseModel):
    credit_card_id: int
    payment_date: date
    amount: float
    payment_method: str  # "cash", "upi", "bank", "cheque"
    transaction_id: Optional[int] = None
    description: Optional[str] = None


class CreditCardPaymentCreate(CreditCardPaymentBase):
    pass


class CreditCardPayment(CreditCardPaymentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CreditCard(CreditCardBase):
    id: int
    created_at: datetime
    transactions: List[Transaction] = []
    payments: List[CreditCardPayment] = []

    class Config:
        from_attributes = True


class CategoryExpense(BaseModel):
    name: str
    amount: float


class MonthlySummary(BaseModel):
    month: str  # YYYY-MM format
    total_income: float
    total_expense: float
    savings: float
    investments: float
    top_categories: List[CategoryExpense]


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


class SavingsPlanBase(BaseModel):
    name: str
    investment_type: str
    amount: float
    recurring_type: Optional[str] = None  # monthly/yearly
    due_date: int = 1
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: bool = True
    description: Optional[str] = None


class SavingsPlanCreate(SavingsPlanBase):
    pass


class SavingsPlanUpdate(BaseModel):
    name: Optional[str] = None
    investment_type: Optional[str] = None
    amount: Optional[float] = None
    recurring_type: Optional[str] = None
    due_date: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None
    description: Optional[str] = None


class SavingsPlan(SavingsPlanBase):
    id: int
    last_processed_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SavingsEntryBase(BaseModel):
    plan_id: int
    amount: float
    entry_date: date
    description: Optional[str] = None
    source: str = "auto"


class SavingsEntryCreate(SavingsEntryBase):
    pass


class SavingsEntry(SavingsEntryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class SavingsComparison(BaseModel):
    account_balance: float  # Current month's income - expense
    total_invested: float  # Total amount initially invested
    total_current_investment_value: float  # Current value of all investments
    investment_profit_loss: float  # Difference between current value and initial amount
    cash_savings: float  # Account balance minus total invested
    difference: float  # Account balance vs total invested comparison


class SalaryBase(BaseModel):
    name: str
    amount: float
    start_date: Optional[date] = None
    is_active: bool = True
    description: Optional[str] = None


class SalaryCreate(SalaryBase):
    pass


class SalaryUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    is_active: Optional[bool] = None
    description: Optional[str] = None


class Salary(SalaryBase):
    id: int
    last_added_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EMIBase(BaseModel):
    name: str  # e.g., "Home Loan", "Car EMI" - for easy tracking
    amount: float
    type: str = "expense"  # Transaction type (should be "expense" for EMI)
    category: str  # e.g., "EMI", "Loan"
    description: str  # e.g., "Home Loan EMI"
    payment_method: str = "bank"  # "bank", "card", "cash", "upi"
    credit_card_id: Optional[int] = None  # For credit card EMIs
    due_date: int  # Day of month (1-31)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: bool = True


class EMICreate(EMIBase):
    pass


class EMIUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    payment_method: Optional[str] = None
    credit_card_id: Optional[int] = None
    due_date: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None


class EMI(EMIBase):
    id: int
    last_added_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Analytics(BaseModel):
    monthly_summary: MonthlySummary
    insights: List[Insight]


class DescriptionBreakdown(BaseModel):
    """Breakdown of a single description"""
    description: str  # Normalized description
    count: int  # Number of transactions
    amount: float  # Total amount


class PaymentMethodBreakdown(BaseModel):
    """Breakdown by payment method"""
    method: str  # Payment method (upi, cash, card, bank, cheque)
    count: int  # Number of transactions
    amount: float  # Total amount


class CardTransaction(BaseModel):
    """Credit card transaction breakdown"""
    cardName: str  # Credit card name
    count: int  # Number of transactions
    amount: float  # Total amount


class CategoryBreakdown(BaseModel):
    """Complete breakdown for a specific category"""
    descriptions: List[DescriptionBreakdown]
    payment_methods: List[PaymentMethodBreakdown]
    card_transactions: List[CardTransaction]
