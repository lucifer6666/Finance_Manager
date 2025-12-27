from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from typing import List, Optional


# Transaction CRUD operations
def create_transaction(db: Session, transaction: schemas.TransactionCreate) -> models.Transaction:
    """Create a new transaction"""
    db_transaction = models.Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def get_transaction(db: Session, transaction_id: int) -> Optional[models.Transaction]:
    """Get a transaction by ID"""
    return db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()


def get_all_transactions(db: Session, skip: int = 0, limit: int = 100) -> List[models.Transaction]:
    """Get all transactions with pagination"""
    return db.query(models.Transaction).offset(skip).limit(limit).all()


def get_transactions_by_month(db: Session, year: int, month: int) -> List[models.Transaction]:
    """Get transactions for a specific month"""
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)
    
    return db.query(models.Transaction).filter(
        models.Transaction.date >= start_date,
        models.Transaction.date < end_date
    ).all()


def get_transactions_by_date_range(db: Session, start_date: date, end_date: date) -> List[models.Transaction]:
    """Get transactions within a date range"""
    return db.query(models.Transaction).filter(
        models.Transaction.date >= start_date,
        models.Transaction.date <= end_date
    ).all()


def update_transaction(db: Session, transaction_id: int, transaction_update: schemas.TransactionCreate) -> Optional[models.Transaction]:
    """Update a transaction"""
    db_transaction = get_transaction(db, transaction_id)
    if db_transaction:
        for key, value in transaction_update.dict().items():
            setattr(db_transaction, key, value)
        db.commit()
        db.refresh(db_transaction)
    return db_transaction


def delete_transaction(db: Session, transaction_id: int) -> bool:
    """Delete a transaction"""
    db_transaction = get_transaction(db, transaction_id)
    if db_transaction:
        db.delete(db_transaction)
        db.commit()
        return True
    return False


# Credit Card CRUD operations
def create_credit_card(db: Session, card: schemas.CreditCardCreate) -> models.CreditCard:
    """Create a new credit card"""
    db_card = models.CreditCard(**card.dict())
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card


def get_credit_card(db: Session, card_id: int) -> Optional[models.CreditCard]:
    """Get a credit card by ID"""
    return db.query(models.CreditCard).filter(models.CreditCard.id == card_id).first()


def get_all_credit_cards(db: Session) -> List[models.CreditCard]:
    """Get all credit cards"""
    return db.query(models.CreditCard).all()


def update_credit_card(db: Session, card_id: int, card_update: schemas.CreditCardCreate) -> Optional[models.CreditCard]:
    """Update a credit card"""
    db_card = get_credit_card(db, card_id)
    if db_card:
        for key, value in card_update.dict().items():
            setattr(db_card, key, value)
        db.commit()
        db.refresh(db_card)
    return db_card


def delete_credit_card(db: Session, card_id: int) -> bool:
    """Delete a credit card"""
    db_card = get_credit_card(db, card_id)
    if db_card:
        db.delete(db_card)
        db.commit()
        return True
    return False


# Savings Investment CRUD operations
def create_savings_investment(db: Session, investment: schemas.SavingsInvestmentCreate) -> models.SavingsInvestment:
    """Create a new savings investment"""
    from datetime import date
    
    investment_data = investment.dict()
    # Set last_recurring_date to today if recurring
    if investment_data.get('is_recurring'):
        investment_data['last_recurring_date'] = date.today()
    
    db_investment = models.SavingsInvestment(**investment_data)
    db.add(db_investment)
    db.commit()
    db.refresh(db_investment)
    return db_investment


def get_savings_investment(db: Session, investment_id: int) -> Optional[models.SavingsInvestment]:
    """Get a savings investment by ID"""
    return db.query(models.SavingsInvestment).filter(models.SavingsInvestment.id == investment_id).first()


def get_all_savings_investments(db: Session) -> List[models.SavingsInvestment]:
    """Get all savings investments"""
    return db.query(models.SavingsInvestment).all()


def update_savings_investment(db: Session, investment_id: int, investment_update: schemas.SavingsInvestmentCreate) -> Optional[models.SavingsInvestment]:
    """Update a savings investment"""
    db_investment = get_savings_investment(db, investment_id)
    if db_investment:
        update_data = investment_update.dict()
        for key, value in update_data.items():
            setattr(db_investment, key, value)
        db.commit()
        db.refresh(db_investment)
    return db_investment


def delete_savings_investment(db: Session, investment_id: int) -> bool:
    """Delete a savings investment"""
    db_investment = get_savings_investment(db, investment_id)
    if db_investment:
        db.delete(db_investment)
        db.commit()
        return True
    return False


def process_recurring_investments(db: Session) -> int:
    """Process recurring investments and update their current_value. Called daily."""
    from datetime import date, timedelta
    from dateutil.relativedelta import relativedelta
    
    today = date.today()
    processed_count = 0
    
    recurring_investments = db.query(models.SavingsInvestment).filter(
        models.SavingsInvestment.is_recurring == 1
    ).all()
    
    for investment in recurring_investments:
        if not investment.last_recurring_date:
            investment.last_recurring_date = today
            continue
        
        should_process = False
        
        if investment.recurring_type == 'monthly':
            next_date = investment.last_recurring_date + relativedelta(months=1)
            should_process = today >= next_date
        elif investment.recurring_type == 'yearly':
            next_date = investment.last_recurring_date + relativedelta(years=1)
            should_process = today >= next_date
        
        if should_process and investment.recurring_amount:
            # Add recurring amount to current value
            investment.current_value += investment.recurring_amount
            investment.last_recurring_date = today
            processed_count += 1
    
    if processed_count > 0:
        db.commit()
    
    return processed_count

