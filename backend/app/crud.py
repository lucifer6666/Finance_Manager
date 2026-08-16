from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime, date, timezone
from dateutil.relativedelta import relativedelta
from calendar import monthrange
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


# Savings plan / entry CRUD operations

def create_savings_plan(db: Session, plan: schemas.SavingsPlanCreate) -> models.SavingsPlan:
    """Create a savings plan (template) without mutating historical entries."""
    plan_data = plan.dict()
    if plan_data.get('start_date') is None:
        plan_data['start_date'] = date.today()
    db_plan = models.SavingsPlan(**plan_data)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan


def get_savings_plan(db: Session, plan_id: int) -> Optional[models.SavingsPlan]:
    return db.query(models.SavingsPlan).filter(models.SavingsPlan.id == plan_id).first()


def get_all_savings_plans(db: Session) -> List[models.SavingsPlan]:
    return db.query(models.SavingsPlan).order_by(models.SavingsPlan.created_at.desc()).all()


def update_savings_plan(db: Session, plan_id: int, plan_update: schemas.SavingsPlanUpdate) -> Optional[models.SavingsPlan]:
    db_plan = get_savings_plan(db, plan_id)
    if db_plan:
        for field, value in plan_update.dict(exclude_unset=True).items():
            setattr(db_plan, field, value)
        db_plan.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_plan)
    return db_plan


def delete_savings_plan(db: Session, plan_id: int) -> bool:
    db_plan = get_savings_plan(db, plan_id)
    if db_plan:
        db_plan.is_active = 0
        db_plan.updated_at = datetime.now(timezone.utc)
        db.commit()
        return True
    return False


def create_savings_entry(db: Session, entry: schemas.SavingsEntryCreate) -> models.SavingsEntry:
    db_entry = models.SavingsEntry(**entry.dict())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


def delete_savings_entry(db: Session, entry_id: int) -> bool:
    db_entry = db.query(models.SavingsEntry).filter(models.SavingsEntry.id == entry_id).first()
    if db_entry:
        db.delete(db_entry)
        db.commit()
        return True
    return False


def get_all_savings_entries(db: Session) -> List[models.SavingsEntry]:
    return db.query(models.SavingsEntry).order_by(models.SavingsEntry.entry_date.desc()).all()


def get_savings_entries_by_month(db: Session, year: int, month: int) -> List[models.SavingsEntry]:
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)
    return db.query(models.SavingsEntry).filter(
        models.SavingsEntry.entry_date >= start_date,
        models.SavingsEntry.entry_date < end_date
    ).order_by(models.SavingsEntry.entry_date.desc()).all()


def _plan_monthly_entry_amount(plan: models.SavingsPlan) -> float:
    if plan.recurring_type == 'yearly':
        return round(plan.amount / 12.0, 2)
    return round(plan.amount, 2)


def backfill_missing_savings_entries(db: Session, plan: models.SavingsPlan, target_date: Optional[date] = None) -> int:
    """Create missing monthly ledger rows from the plan start month onward."""
    if plan.recurring_type not in ('monthly', 'yearly') or not plan.is_active:
        return 0
    if not plan.start_date:
        return 0

    end_date = target_date or date.today()
    if end_date < plan.start_date:
        return 0

    month_cursor = date(plan.start_date.year, plan.start_date.month, 1)
    end_month = date(end_date.year, end_date.month, 1)
    created_count = 0

    while month_cursor <= end_month:
        if plan.end_date and month_cursor > date(plan.end_date.year, plan.end_date.month, 1):
            break

        days_in_month = monthrange(month_cursor.year, month_cursor.month)[1]
        due_day = min(max(1, plan.due_date), days_in_month)
        due_date = date(month_cursor.year, month_cursor.month, due_day)

        if plan.start_date and due_date < plan.start_date:
            if month_cursor.month == 12:
                month_cursor = date(month_cursor.year + 1, 1, 1)
            else:
                month_cursor = date(month_cursor.year, month_cursor.month + 1, 1)
            continue

        if plan.end_date and due_date > plan.end_date:
            break

        existing = db.query(models.SavingsEntry).filter(
            models.SavingsEntry.plan_id == plan.id,
            models.SavingsEntry.entry_date == due_date
        ).first()

        if not existing:
            db.add(models.SavingsEntry(
                plan_id=plan.id,
                amount=_plan_monthly_entry_amount(plan),
                entry_date=due_date,
                description=f"Auto-saved from {plan.name} ({plan.recurring_type})",
                source='auto',
                created_at=datetime.now(timezone.utc)
            ))
            created_count += 1

        if month_cursor.month == 12:
            month_cursor = date(month_cursor.year + 1, 1, 1)
        else:
            month_cursor = date(month_cursor.year, month_cursor.month + 1, 1)

    if created_count > 0:
        db.commit()
        if plan.last_processed_date is None or plan.last_processed_date < end_month:
            plan.last_processed_date = end_month

    return created_count


def backfill_all_missing_savings_entries(db: Session, target_date: Optional[date] = None) -> int:
    """Backfill all active saving plans with missing monthly ledger rows."""
    total_created = 0
    plans = db.query(models.SavingsPlan).filter(models.SavingsPlan.is_active == 1).all()
    for plan in plans:
        total_created += backfill_missing_savings_entries(db, plan, target_date)
    if total_created > 0:
        db.commit()
    return total_created


def process_due_saving_plans(db: Session) -> int:
    """Create immutable savings ledger rows from active saving plans when due.

    Monthly plans add their full monthly amount as-is.
    Yearly plans are split into a monthly equivalent: amount / 12.
    """
    today = date.today()
    processed_count = 0

    plans = db.query(models.SavingsPlan).filter(models.SavingsPlan.is_active == 1).all()
    for plan in plans:
        if plan.start_date and today < plan.start_date:
            continue
        if plan.end_date and today > plan.end_date:
            continue
        if plan.recurring_type not in ('monthly', 'yearly'):
            continue

        processed_count += backfill_missing_savings_entries(db, plan, today)

        current_month_days = 31 if today.month in (1, 3, 5, 7, 8, 10, 12) else 30
        if today.month == 2:
            current_month_days = 29 if (today.year % 4 == 0 and (today.year % 100 != 0 or today.year % 400 == 0)) else 28
        due_day = min(max(1, plan.due_date), current_month_days)
        due_date = date(today.year, today.month, due_day)

        if plan.start_date and due_date < plan.start_date:
            continue
        if plan.end_date and due_date > plan.end_date:
            continue
        if plan.last_processed_date and plan.last_processed_date >= due_date:
            continue

        existing = db.query(models.SavingsEntry).filter(
            models.SavingsEntry.plan_id == plan.id,
            models.SavingsEntry.entry_date == due_date
        ).first()
        if existing:
            plan.last_processed_date = due_date
            continue

        entry_amount = _plan_monthly_entry_amount(plan)

        entry = models.SavingsEntry(
            plan_id=plan.id,
            amount=entry_amount,
            entry_date=due_date,
            description=f"Auto-saved from {plan.name} ({plan.recurring_type})",
            source='auto',
            created_at=datetime.now(timezone.utc)
        )
        db.add(entry)
        plan.last_processed_date = due_date
        processed_count += 1

    if processed_count > 0:
        db.commit()

    return processed_count


def migrate_recurring_investments_to_plans(db: Session) -> dict:
    """
    Convert all recurring SavingsInvestment records to SavingsPlan records.
    This is a one-time migration to adopt the new immutable ledger system.
    
    Returns:
        dict: Migration status with 'migrated_count' and message
    """
    migrated_count = 0
    skipped_count = 0
    
    try:
        # Get all recurring investments
        recurring_investments = db.query(models.SavingsInvestment).filter(
            models.SavingsInvestment.is_recurring == 1
        ).all()
        
        for investment in recurring_investments:
            # Check if a plan already exists for this investment
            existing_plan = db.query(models.SavingsPlan).filter(
                models.SavingsPlan.name == investment.name,
                models.SavingsPlan.is_active == 1
            ).first()

            if existing_plan:
                skipped_count += 1
                continue

            # Create a new plan from this recurring investment
            plan = models.SavingsPlan(
                name=investment.name,
                investment_type=investment.investment_type,
                amount=investment.recurring_amount or investment.initial_amount,
                recurring_type=investment.recurring_type,
                due_date=1,
                start_date=investment.purchase_date or date.today(),
                end_date=None,
                is_active=1,
                description=f"Migrated from legacy investment: {investment.description or ''}" if investment.description else "Migrated from legacy investment",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            db.add(plan)
            db.flush()

            backfill_missing_savings_entries(db, plan, date.today())

            db.delete(investment)
            migrated_count += 1

        if migrated_count > 0 or skipped_count > 0:
            db.commit()

        return {
            "migrated_count": migrated_count,
            "skipped_count": skipped_count,
            "message": f"Successfully migrated {migrated_count} recurring investments to savings plans and removed the legacy records. Skipped {skipped_count} duplicates."
        }
    except Exception as e:
        return {
            "migrated_count": 0,
            "error": str(e),
            "message": f"Error during migration: {str(e)}"
        }


# Salary CRUD operations
def create_salary(db: Session, salary: schemas.SalaryCreate) -> models.Salary:
    """Create a new salary entry"""
    db_salary = models.Salary(**salary.dict())
    db.add(db_salary)
    db.commit()
    db.refresh(db_salary)
    return db_salary


def get_salary(db: Session, salary_id: int) -> Optional[models.Salary]:
    """Get a salary by ID"""
    return db.query(models.Salary).filter(models.Salary.id == salary_id).first()


def get_all_salaries(db: Session) -> List[models.Salary]:
    """Get all salaries"""
    return db.query(models.Salary).all()


def get_active_salaries(db: Session) -> List[models.Salary]:
    """Get all active salaries"""
    return db.query(models.Salary).filter(models.Salary.is_active == 1).all()


def update_salary(db: Session, salary_id: int, salary_update: schemas.SalaryUpdate) -> Optional[models.Salary]:
    """Update a salary"""
    db_salary = db.query(models.Salary).filter(models.Salary.id == salary_id).first()
    if db_salary:
        update_data = salary_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_salary, field, value)
        db_salary.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_salary)
    return db_salary


def delete_salary(db: Session, salary_id: int) -> bool:
    """Delete a salary"""
    db_salary = db.query(models.Salary).filter(models.Salary.id == salary_id).first()
    if db_salary:
        db.delete(db_salary)
        db.commit()
        return True
    return False


def process_monthly_salaries(db: Session) -> int:
    """Process monthly salary auto-entries on the 1st of each month"""
    today = date.today()
    
    # Only process on the 1st of the month
    if today.day != 1:
        return 0
    
    processed_count = 0
    active_salaries = get_active_salaries(db)
    
    for salary in active_salaries:
        # Check if salary was already added today
        if salary.last_added_date != today:
            # Create an income transaction for the salary
            transaction = models.Transaction(
                date=today,
                amount=salary.amount,
                type="income",
                category="Salary",
                description=f"Monthly salary: {salary.name}",
                payment_method="bank",
                created_at=datetime.now(timezone.utc)
            )
            db.add(transaction)
            salary.last_added_date = today
            processed_count += 1
    
    if processed_count > 0:
        db.commit()
    
    return processed_count


# EMI CRUD operations

def create_emi(db: Session, emi: schemas.EMICreate) -> models.EMI:
    """Create a new EMI entry"""
    db_emi = models.EMI(**emi.dict())
    db.add(db_emi)
    db.commit()
    db.refresh(db_emi)
    return db_emi


def get_emi(db: Session, emi_id: int) -> Optional[models.EMI]:
    """Get an EMI by ID"""
    return db.query(models.EMI).filter(models.EMI.id == emi_id).first()


def get_all_emi(db: Session) -> List[models.EMI]:
    """Get all EMI entries"""
    return db.query(models.EMI).all()


def get_active_emi(db: Session) -> List[models.EMI]:
    """Get all active EMIs"""
    return db.query(models.EMI).filter(models.EMI.is_active == 1).all()


def update_emi(db: Session, emi_id: int, emi_update: schemas.EMIUpdate) -> Optional[models.EMI]:
    """Update an EMI"""
    db_emi = db.query(models.EMI).filter(models.EMI.id == emi_id).first()
    if db_emi:
        update_data = emi_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_emi, field, value)
        db_emi.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_emi)
    return db_emi


def delete_emi(db: Session, emi_id: int) -> bool:
    """Delete an EMI"""
    db_emi = db.query(models.EMI).filter(models.EMI.id == emi_id).first()
    if db_emi:
        db.delete(db_emi)
        db.commit()
        return True
    return False


# Credit Card Payment CRUD operations
def create_credit_card_payment(db: Session, payment: schemas.CreditCardPaymentCreate) -> models.CreditCardPayment:
    """Create a new credit card payment"""
    db_payment = models.CreditCardPayment(**payment.dict())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment


def get_credit_card_payment(db: Session, payment_id: int) -> Optional[models.CreditCardPayment]:
    """Get a credit card payment by ID"""
    return db.query(models.CreditCardPayment).filter(models.CreditCardPayment.id == payment_id).first()


def get_all_credit_card_payments(db: Session, skip: int = 0, limit: int = 100) -> List[models.CreditCardPayment]:
    """Get all credit card payments with pagination"""
    return db.query(models.CreditCardPayment).offset(skip).limit(limit).all()


def get_payments_by_card(db: Session, card_id: int, skip: int = 0, limit: int = 100) -> List[models.CreditCardPayment]:
    """Get all payments for a specific credit card"""
    return db.query(models.CreditCardPayment).filter(
        models.CreditCardPayment.credit_card_id == card_id
    ).offset(skip).limit(limit).all()


def get_payments_by_date_range(db: Session, start_date: date, end_date: date) -> List[models.CreditCardPayment]:
    """Get credit card payments within a date range"""
    return db.query(models.CreditCardPayment).filter(
        models.CreditCardPayment.payment_date >= start_date,
        models.CreditCardPayment.payment_date <= end_date
    ).all()


def update_credit_card_payment(db: Session, payment_id: int, payment_update: schemas.CreditCardPaymentCreate) -> Optional[models.CreditCardPayment]:
    """Update a credit card payment"""
    db_payment = get_credit_card_payment(db, payment_id)
    if db_payment:
        for key, value in payment_update.dict().items():
            setattr(db_payment, key, value)
        db.commit()
        db.refresh(db_payment)
    return db_payment


def delete_credit_card_payment(db: Session, payment_id: int) -> bool:
    """Delete a credit card payment"""
    db_payment = get_credit_card_payment(db, payment_id)
    if db_payment:
        db.delete(db_payment)
        db.commit()
        return True
    return False
