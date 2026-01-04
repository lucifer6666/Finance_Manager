from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base


class TransactionType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    CARD = "card"
    UPI = "upi"
    BANK = "bank"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)  # "income" or "expense"
    category = Column(String, nullable=False)
    description = Column(String, nullable=True)
    payment_method = Column(String, nullable=False)  # "cash", "card", "upi", "bank"
    credit_card_id = Column(Integer, ForeignKey("credit_cards.id"), nullable=True)
    is_payment = Column(Integer, default=0, nullable=False)  # 0=regular transaction, 1=credit card payment
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    credit_card = relationship("CreditCard", back_populates="transactions")
    payment_record = relationship("CreditCardPayment", back_populates="transaction", uselist=False)


class CreditCard(Base):
    __tablename__ = "credit_cards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    bank_name = Column(String, nullable=False)
    billing_cycle_start = Column(Integer, nullable=False)  # day of month
    billing_cycle_end = Column(Integer, nullable=False)  # day of month
    due_date = Column(Integer, nullable=False)  # day of month
    credit_limit = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    transactions = relationship("Transaction", back_populates="credit_card")
    payments = relationship("CreditCardPayment", back_populates="credit_card")


class CreditCardPayment(Base):
    __tablename__ = "credit_card_payments"

    id = Column(Integer, primary_key=True, index=True)
    credit_card_id = Column(Integer, ForeignKey("credit_cards.id"), nullable=False)
    payment_date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String, nullable=False)  # "cash", "upi", "bank", "cheque"
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)  # Related transaction if created from transaction
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    credit_card = relationship("CreditCard", back_populates="payments")
    transaction = relationship("Transaction", back_populates="payment_record")


class SavingsInvestment(Base):
    __tablename__ = "savings_investments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # e.g., "HDFC Mutual Fund", "ICICI Life Insurance"
    investment_type = Column(String, nullable=False)  # "mutual_fund", "life_insurance", "fixed_deposit", "stock", "crypto", "other"
    purchase_date = Column(Date, nullable=False)
    initial_amount = Column(Float, nullable=False)  # Amount invested initially
    current_value = Column(Float, nullable=False)  # Current value of investment
    description = Column(String, nullable=True)
    # Recurring investment fields
    is_recurring = Column(Integer, default=0, nullable=False)  # 0=no, 1=yes
    recurring_type = Column(String, nullable=True)  # "monthly", "yearly", or None
    recurring_amount = Column(Float, nullable=True)  # Amount to add each period
    last_recurring_date = Column(Date, nullable=True)  # Last time recurring amount was added
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Salary(Base):
    __tablename__ = "salaries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # e.g., "Primary Salary", "Bonus Salary"
    amount = Column(Float, nullable=False)  # Monthly salary amount
    start_date = Column(Date, nullable=False)  # Date when salary was initialized
    is_active = Column(Integer, default=1, nullable=False)  # 0=inactive, 1=active
    last_added_date = Column(Date, nullable=True)  # Last date salary was auto-added
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
