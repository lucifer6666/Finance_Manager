from typing import List, Dict, Tuple, Union
from datetime import date
from sqlalchemy.orm import Session
from .. import models, crud


def calculate_monthly_summary(transactions: List[models.Transaction], db: Session = None, year: int = None, month: int = None) -> Dict:
    """Calculate monthly analytics from transactions, subtracting investments from savings"""
    income = sum(t.amount for t in transactions if t.type == "income")
    expense = sum(t.amount for t in transactions if t.type == "expense")
    
    # Calculate investments for this month
    investments_total = 0
    if db and year and month:
        # Get all savings/investments
        all_investments = db.query(models.SavingsInvestment).all()
        
        for inv in all_investments:
            # Only count investments that are relevant to this month/year
            if inv.is_recurring:
                # For monthly recurring investments, check if investment started before or during this month
                if inv.recurring_type == "monthly":
                    # Only count if investment was started before or during this month
                    if inv.purchase_date.year < year or (inv.purchase_date.year == year and inv.purchase_date.month <= month):
                        investments_total += inv.recurring_amount if inv.recurring_amount else 0
                # For yearly recurring investments, check if it recurs in this year
                elif inv.recurring_type == "yearly":
                    # Check if the last_recurring_date or purchase_date falls in the target year
                    last_date = inv.last_recurring_date or inv.purchase_date
                    if last_date.year == year or (inv.purchase_date.year == year and last_date.year < year):
                        # Calculate how many times this yearly investment occurs in the target month
                        months_since_purchase = (year - inv.purchase_date.year) * 12 + (month - inv.purchase_date.month)
                        if months_since_purchase >= 0:
                            # For yearly recurring, only count once per year (as monthly equivalent)
                            if last_date.year < year or (last_date.year == year and last_date.month <= month):
                                investments_total += (inv.recurring_amount / 12) if inv.recurring_amount else 0
            # For non-recurring investments, only count in the month they were purchased
            elif inv.purchase_date.year == year and inv.purchase_date.month == month:
                investments_total += inv.initial_amount
    
    # Calculate category distribution (expenses + investments)
    category_map = {}
    for t in transactions:
        if t.type == "expense":
            category_map[t.category] = category_map.get(t.category, 0) + t.amount
    
    # Add investments as a category if there are any
    if investments_total > 0:
        category_map["Investments"] = round(investments_total, 2)
    
    # Sort categories by amount (descending)
    top_categories_tuples = sorted(category_map.items(), key=lambda x: x[1], reverse=True)
    
    # Convert tuples to dictionaries for Pydantic compatibility
    top_categories = [{"name": cat[0], "amount": round(cat[1], 2)} for cat in top_categories_tuples]
    
    return {
        "total_income": round(income, 2),
        "total_expense": round(expense, 2),
        "investments": round(investments_total, 2),
        "savings": round(income - expense - investments_total, 2),
        "top_categories": top_categories
    }


def generate_insights(summary: Dict) -> List[Dict]:
    """Generate insights and recommendations based on spending patterns"""
    insights = []
    
    total_income = summary["total_income"]
    total_expense = summary["total_expense"]
    savings = summary["savings"]
    
    # Insight 1: Overspending check
    if total_income > 0:
        expense_ratio = (total_expense / total_income) * 100
        if expense_ratio > 90:
            insights.append({
                "message": "Your expenses are very close to your income. Consider reducing discretionary spending.",
                "severity": "alert"
            })
        elif expense_ratio > 80:
            insights.append({
                "message": "Your expense-to-income ratio is high. Review your spending categories.",
                "severity": "warning"
            })
    
    # Insight 2: Negative savings check
    if savings < 0:
        insights.append({
            "message": "You are spending more than you earn. This is unsustainable long-term.",
            "severity": "alert"
        })
    
    # Insight 3: Low savings rate check
    if total_income > 0:
        savings_ratio = (savings / total_income) * 100
        if savings_ratio < 10 and savings_ratio >= 0:
            insights.append({
                "message": "Your savings rate is below 10%. Try to save at least 10-20% of your income.",
                "severity": "warning"
            })
        elif savings_ratio >= 20:
            insights.append({
                "message": "Great! You're saving 20% or more of your income. Keep it up!",
                "severity": "info"
            })
    
    # Insight 4: Category-based insights
    if summary["top_categories"]:
        top_category = summary["top_categories"][0]
        if total_expense > 0:
            category_ratio = (top_category["amount"] / total_expense) * 100
            if category_ratio > 40:
                insights.append({
                    "message": f"{top_category['name']} accounts for {category_ratio:.1f}% of your expenses. Consider budgeting this category.",
                    "severity": "info"
                })
    
    return insights


def get_yearly_summary(db: Session, year: int) -> Dict:
    """Calculate yearly summary with monthly breakdown"""
    from datetime import datetime
    
    yearly_income = 0
    yearly_expense = 0
    yearly_investments = 0
    monthly_breakdown = []
    
    for month in range(1, 13):
        transactions = crud.get_transactions_by_month(db, year, month)
        monthly_data = calculate_monthly_summary(transactions, db, year, month)
        
        yearly_income += monthly_data["total_income"]
        yearly_expense += monthly_data["total_expense"]
        yearly_investments += monthly_data["investments"]
        
        monthly_breakdown.append({
            "month": f"{year}-{month:02d}",
            "income": monthly_data["total_income"],
            "expense": monthly_data["total_expense"],
            "investments": monthly_data["investments"],
            "savings": monthly_data["savings"]
        })
    
    return {
        "year": year,
        "total_income": round(yearly_income, 2),
        "total_expense": round(yearly_expense, 2),
        "investments": round(yearly_investments, 2),
        "savings": round(yearly_income - yearly_expense - yearly_investments, 2),
        "monthly_breakdown": monthly_breakdown
    }


def get_yearly_category_distribution(db: Session, year: int, include_investments: bool = False) -> Dict:
    """Get yearly category distribution with option to include/exclude investments"""
    category_map = {}
    yearly_investments = 0
    
    for month in range(1, 13):
        transactions = crud.get_transactions_by_month(db, year, month)
        monthly_data = calculate_monthly_summary(transactions, db, year, month)
        
        # Aggregate category expenses
        for category in monthly_data["top_categories"]:
            if category["name"] != "Investments":
                category_map[category["name"]] = category_map.get(category["name"], 0) + category["amount"]
        
        yearly_investments += monthly_data["investments"]
    
    # Add investments as a category if included
    if include_investments and yearly_investments > 0:
        category_map["Investments"] = yearly_investments
    
    # Sort categories by amount (descending)
    top_categories_tuples = sorted(category_map.items(), key=lambda x: x[1], reverse=True)
    
    # Convert tuples to dictionaries
    top_categories = [{"name": cat[0], "amount": round(cat[1], 2)} for cat in top_categories_tuples]
    
    total_expense = sum(cat["amount"] for cat in top_categories if cat["name"] != "Investments")
    
    return {
        "year": year,
        "include_investments": include_investments,
        "top_categories": top_categories,
        "total_expense": round(total_expense, 2),
        "total_investments": round(yearly_investments, 2)
    }


def get_spending_trends(db: Session, months: int = 6) -> List[Dict]:
    """Get spending trends for the last N months"""
    from datetime import datetime, timedelta
    
    trends = []
    current_date = datetime.now().date()
    
    for i in range(months, 0, -1):
        target_date = current_date - timedelta(days=30 * (i - 1))
        transactions = crud.get_transactions_by_month(db, target_date.year, target_date.month)
        summary = calculate_monthly_summary(transactions, db, target_date.year, target_date.month)
        
        trends.append({
            "month": f"{target_date.year}-{target_date.month:02d}",
            "income": summary["total_income"],
            "expense": summary["total_expense"],
            "investments": summary["investments"],
            "savings": summary["savings"]
        })
    
    return trends


def get_spending_trends_by_year(db: Session, year: int) -> List[Dict]:
    """Get spending trends for all 12 months of a specific year"""
    trends = []
    current_month = date.today().month + 1 if date.today().year == year else 13

    for month in range(1, current_month):
        transactions = crud.get_transactions_by_month(db, year, month)
        summary = calculate_monthly_summary(transactions, db, year, month)
        
        trends.append({
            "month": f"{year}-{month:02d}",
            "income": summary["total_income"],
            "expense": summary["total_expense"],
            "investments": summary["investments"],
            "savings": summary["savings"]
        })
    
    return trends


def calculate_credit_card_utilization(db: Session, card_id: int) -> Union[Dict, None]:
    """Calculate credit card utilization percentage"""
    card = crud.get_credit_card(db, card_id)
    if not card:
        return None
    
    # Get transactions for current billing cycle
    current_date = date.today()
    year = current_date.year
    month = current_date.month
    
    # Calculate billing cycle start and end dates
    cycle_start = date(year, month, card.billing_cycle_start)
    if current_date.day < card.billing_cycle_start:
        cycle_start = date(year, month - 1 if month > 1 else year - 1, 
                          card.billing_cycle_start)
    
    # Get end of cycle
    if card.billing_cycle_end < card.billing_cycle_start:
        # Cycle spans two months
        if current_date.day >= card.billing_cycle_start:
            cycle_end = date(year, month + 1 if month < 12 else year + 1, 
                            card.billing_cycle_end)
        else:
            cycle_end = date(year, month, card.billing_cycle_end)
    else:
        cycle_end = date(year, month, card.billing_cycle_end)
    
    # Get card transactions in this cycle
    card_transactions = db.query(models.Transaction).filter(
        models.Transaction.credit_card_id == card_id,
        models.Transaction.date >= cycle_start,
        models.Transaction.date <= cycle_end,
        models.Transaction.type == "expense"
    ).all()
    
    card_spent = sum(t.amount for t in card_transactions)
    utilization_percent = (card_spent / card.credit_limit) * 100 if card.credit_limit > 0 else 0
    
    return {
        "card_id": card_id,
        "card_name": card.name,
        "credit_limit": card.credit_limit,
        "amount_spent": round(card_spent, 2),
        "utilization_percent": round(utilization_percent, 2),
        "days_to_due": (card.due_date - current_date.day) % 30
    }


def calculate_savings_comparison(db: Session) -> Dict:
    """Calculate account savings vs investments comparison"""
    from datetime import datetime, timedelta
    
    now = datetime.now()
    current_month_start = date(now.year, now.month, 1)
    
    # Calculate next month's first day correctly
    if now.month == 12:
        current_month_end = date(now.year + 1, 1, 1)
    else:
        current_month_end = date(now.year, now.month + 1, 1)
    
    current_month_transactions = db.query(models.Transaction).filter(
        models.Transaction.date >= current_month_start,
        models.Transaction.date < current_month_end
    ).all()
    
    # Calculate current month's account balance (savings)
    income = sum(t.amount for t in current_month_transactions if t.type == "income")
    expense = sum(t.amount for t in current_month_transactions if t.type == "expense")
    account_balance = income - expense
    
    # Get all investments
    all_investments = db.query(models.SavingsInvestment).all()
    
    # Calculate investment totals
    total_invested = sum(inv.initial_amount for inv in all_investments)
    total_current_investment_value = sum(inv.current_value for inv in all_investments)
    investment_profit_loss = total_current_investment_value - total_invested
    
    # Calculate cash savings (account balance excluding invested amount)
    cash_savings = account_balance - total_invested
    
    # Difference: account balance vs total invested
    difference = account_balance - total_invested
    
    return {
        "account_balance": round(account_balance, 2),
        "total_invested": round(total_invested, 2),
        "total_current_investment_value": round(total_current_investment_value, 2),
        "investment_profit_loss": round(investment_profit_loss, 2),
        "cash_savings": round(cash_savings, 2),
        "difference": round(difference, 2)
    }

