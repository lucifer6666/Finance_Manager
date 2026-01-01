"""
Auto-increment operations for salary and recurring investments
Checks and processes auto-increment entries on app startup
"""
from sqlalchemy.orm import Session
from datetime import date, timezone
from dateutil.relativedelta import relativedelta
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


def run_startup_checks(db: Session) -> dict:
    """
    Run all auto-increment checks on app startup.
    
    Returns:
        dict: Combined status from all checks
    """
    salary_status = process_auto_salary_entries(db)
    investment_status = process_auto_recurring_investments(db)
    
    return {
        "salaries": salary_status,
        "investments": investment_status,
        "all_processed": salary_status.get("processed_count", 0) + investment_status.get("processed_count", 0)
    }
