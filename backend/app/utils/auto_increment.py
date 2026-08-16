"""
Auto-increment operations for salary and recurring investments
Checks and processes auto-increment entries on app startup
"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import date, timezone
from dateutil.relativedelta import relativedelta
from calendar import monthrange
from .. import models
from datetime import datetime


def process_auto_salary_entries(db: Session) -> dict:
    """
    Check if active salaries have been added for the current month.
    If not, add them as income transactions.
    
    Returns:
        dict: Status with 'processed_count' and 'message'
    """
    today = date.today()
    processed_count = 0
    skipped_count = 0
    
    try:
        active_salaries = db.query(models.Salary).filter(
            models.Salary.is_active == 1
        ).all()
        
        for salary in active_salaries:
            # Check if salary was already added this month
            if salary.last_added_date is None or salary.last_added_date.month != today.month or salary.last_added_date.year != today.year:
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
            else:
                skipped_count += 1
        
        if processed_count > 0:
            db.commit()
        
        return {
            "processed_count": processed_count,
            "skipped_count": skipped_count,
            "message": f"Salary auto-entries: {processed_count} added, {skipped_count} already exist"
        }
    except Exception as e:
        return {
            "processed_count": 0,
            "error": str(e),
            "message": f"Error processing salary auto-entries: {str(e)}"
        }


def process_auto_recurring_investments(db: Session) -> dict:
    """
    Check if recurring investments are due and process them.
    If last_recurring_date is not set or due date has passed, add the recurring amount.
    
    Returns:
        dict: Status with 'processed_count' and 'message'
    """
    today = date.today()
    processed_count = 0
    skipped_count = 0
    
    try:
        recurring_investments = db.query(models.SavingsInvestment).filter(
            models.SavingsInvestment.is_recurring == 1
        ).all()
        
        for investment in recurring_investments:
            should_process = False
            
            # If last_recurring_date is not set, initialize it
            if investment.last_recurring_date is None:
                investment.last_recurring_date = today
                investment.current_value += investment.recurring_amount if investment.recurring_amount else 0
                processed_count += 1
                continue
            
            # Check if due based on recurring type
            if investment.recurring_type == 'monthly':
                next_date = investment.last_recurring_date + relativedelta(months=1)
                should_process = today >= next_date
            elif investment.recurring_type == 'yearly':
                next_date = investment.last_recurring_date + relativedelta(years=1)
                should_process = today >= next_date
            
            if should_process and investment.recurring_amount:
                investment.current_value += investment.recurring_amount
                investment.last_recurring_date = today
                processed_count += 1
            else:
                skipped_count += 1
        
        if processed_count > 0:
            db.commit()
        
        return {
            "processed_count": processed_count,
            "skipped_count": skipped_count,
            "message": f"Recurring investments: {processed_count} processed, {skipped_count} not due"
        }
    except Exception as e:
        return {
            "processed_count": 0,
            "error": str(e),
            "message": f"Error processing recurring investments: {str(e)}"
        }


def process_auto_emi_entries(db: Session) -> dict:
    """
    Check if active EMIs are due for the current month and add them as expense transactions.
    EMIs repeat on the configured due date between their start and end dates.
    """
    today = date.today()
    processed_count = 0
    skipped_count = 0

    try:
        active_emi = db.query(models.EMI).filter(models.EMI.is_active == 1).all()

        for emi in active_emi:
            if emi.start_date and today < emi.start_date:
                skipped_count += 1
                continue

            if emi.end_date and today > emi.end_date:
                skipped_count += 1
                continue

            if emi.last_added_date is not None and emi.last_added_date.month == today.month and emi.last_added_date.year == today.year:
                skipped_count += 1
                continue

            # Determine the current month's valid due date for this EMI.
            if today.month == 2 and today.year % 4 == 0 and (today.year % 100 != 0 or today.year % 400 == 0):
                days_in_month = 29
            elif today.month == 2:
                days_in_month = 28
            elif today.month in (4, 6, 9, 11):
                days_in_month = 30
            else:
                days_in_month = 31

            due_day = min(emi.due_date, days_in_month)
            emi_due_date = date(today.year, today.month, due_day)

            if today < emi_due_date:
                skipped_count += 1
                continue

            if emi.start_date and emi_due_date < emi.start_date:
                skipped_count += 1
                continue

            if emi.end_date and emi_due_date > emi.end_date:
                skipped_count += 1
                continue

            transaction = models.Transaction(
                date=emi_due_date,
                amount=emi.amount,
                type=emi.type,
                category=emi.category,
                description=emi.description,
                payment_method=emi.payment_method,
                credit_card_id=emi.credit_card_id,
                created_at=datetime.now(timezone.utc)
            )
            db.add(transaction)
            emi.last_added_date = emi_due_date
            processed_count += 1

        if processed_count > 0:
            db.commit()

        return {
            "processed_count": processed_count,
            "skipped_count": skipped_count,
            "message": f"EMI auto-entries: {processed_count} added, {skipped_count} already exist or are not due"
        }
    except Exception as e:
        return {
            "processed_count": 0,
            "error": str(e),
            "message": f"Error processing EMI auto-entries: {str(e)}"
        }


def process_auto_saving_plans(db: Session) -> dict:
    """
    Check if active saving plans are due and create immutable ledger entries for them.
    This prevents mutating historical records when plans change.
    """
    today = date.today()
    processed_count = 0
    skipped_count = 0

    try:
        plans = db.query(models.SavingsPlan).filter(models.SavingsPlan.is_active == 1).all()
        
        for plan in plans:
            if plan.start_date and today < plan.start_date:
                skipped_count += 1
                continue
                
            if plan.end_date and today > plan.end_date:
                skipped_count += 1
                continue
                
            if plan.recurring_type not in ('monthly', 'yearly'):
                skipped_count += 1
                continue

            # Calculate the due date for this plan
            if plan.recurring_type == 'monthly':
                current_month_days = 31 if today.month in (1, 3, 5, 7, 8, 10, 12) else 30
                if today.month == 2:
                    current_month_days = 29 if (today.year % 4 == 0 and (today.year % 100 != 0 or today.year % 400 == 0)) else 28
                due_day = min(max(1, plan.due_date), current_month_days)
                due_date = date(today.year, today.month, due_day)
            elif plan.recurring_type == 'yearly':
                due_day = min(max(1, plan.due_date), 28)
                due_date = date(today.year, today.month, due_day)
            else:
                skipped_count += 1
                continue

            # Check if entry already exists for this due date
            existing_entry = db.query(models.SavingsEntry).filter(
                models.SavingsEntry.plan_id == plan.id,
                models.SavingsEntry.entry_date == due_date
            ).first()

            if existing_entry:
                plan.last_processed_date = due_date
                db.commit()
                skipped_count += 1
                continue

            # Only create entry if we've reached the due date
            if today >= due_date:
                entry_amount = plan.amount
                if plan.recurring_type == 'yearly':
                    entry_amount = round(plan.amount / 12.0, 2)

                entry = models.SavingsEntry(
                    plan_id=plan.id,
                    amount=entry_amount,
                    entry_date=due_date,
                    description=f"Auto-saved: {plan.name}",
                    source='auto',
                    created_at=datetime.now(timezone.utc)
                )
                db.add(entry)
                plan.last_processed_date = due_date
                processed_count += 1
            else:
                skipped_count += 1

        if processed_count > 0:
            db.commit()

        return {
            "processed_count": processed_count,
            "skipped_count": skipped_count,
            "message": f"Saving plans: {processed_count} entries created, {skipped_count} not due or skipped"
        }
    except Exception as e:
        return {
            "processed_count": 0,
            "error": str(e),
            "message": f"Error processing saving plans: {str(e)}"
        }


def migrate_emi_payment_method(db: Session) -> dict:
    """
    Add missing columns to emis table for Transaction field alignment.
    This is a schema migration for backward compatibility.
    
    Returns:
        dict: Migration status
    """
    try:
        # Check if columns exist
        result = db.execute(text("PRAGMA table_info(emis)"))
        columns = {row[1]: row for row in result.fetchall()}
        
        migrations_applied = []
        
        # Add name if missing
        if "name" not in columns:
            db.execute(text("""
                ALTER TABLE emis 
                ADD COLUMN name VARCHAR NOT NULL DEFAULT 'Unknown EMI'
            """))
            migrations_applied.append("name")
        
        # Add payment_method if missing
        if "payment_method" not in columns:
            db.execute(text("""
                ALTER TABLE emis 
                ADD COLUMN payment_method VARCHAR DEFAULT 'bank'
            """))
            migrations_applied.append("payment_method")
        
        # Add category if missing
        if "category" not in columns:
            db.execute(text("""
                ALTER TABLE emis 
                ADD COLUMN category VARCHAR DEFAULT 'EMI'
            """))
            migrations_applied.append("category")
        
        # Add type if missing
        if "type" not in columns:
            db.execute(text("""
                ALTER TABLE emis 
                ADD COLUMN type VARCHAR DEFAULT 'expense'
            """))
            migrations_applied.append("type")
        
        # Add credit_card_id if missing
        if "credit_card_id" not in columns:
            db.execute(text("""
                ALTER TABLE emis 
                ADD COLUMN credit_card_id INTEGER
            """))
            migrations_applied.append("credit_card_id")
        
        # Add updated_at if missing
        if "updated_at" not in columns:
            db.execute(text("""
                ALTER TABLE emis 
                ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            """))
            migrations_applied.append("updated_at")
        
        if migrations_applied:
            db.commit()
            return {
                "status": "migrated",
                "message": f"Added columns to emis table: {', '.join(migrations_applied)}"
            }
        else:
            return {
                "status": "exists",
                "message": "All required columns already exist"
            }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error migrating emis table: {str(e)}"
        }


def run_startup_checks(db: Session) -> dict:
    """
    Run all auto-increment checks on app startup.
    
    Returns:
        dict: Combined status from all checks
    """
    # Run schema migrations first
    migration_status = migrate_emi_payment_method(db)
    
    salary_status = process_auto_salary_entries(db)
    investment_status = process_auto_recurring_investments(db)
    emi_status = process_auto_emi_entries(db)
    savings_plan_status = process_auto_saving_plans(db)
    
    return {
        "salaries": salary_status,
        "investments": investment_status,
        "emis": emi_status,
        "saving_plans": savings_plan_status,
        "all_processed": salary_status.get("processed_count", 0) + investment_status.get("processed_count", 0) + emi_status.get("processed_count", 0) + savings_plan_status.get("processed_count", 0)
    }
