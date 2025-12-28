from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import crud, schemas
from ..database import get_db
from ..utils.analytics import (
    calculate_monthly_summary,
    generate_insights,
    get_yearly_summary,
    get_spending_trends
)

router = APIRouter()


@router.get("/monthly/{year}/{month}", response_model=schemas.MonthlySummary)
def get_monthly_analytics(
    year: int,
    month: int,
    db: Session = Depends(get_db)
):
    """Get monthly analytics for a specific month"""
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
    if year < 1900 or year > 2100:
        raise HTTPException(status_code=400, detail="Year must be between 1910 and 2100")
    
    transactions = crud.get_transactions_by_month(db, year, month)
    summary = calculate_monthly_summary(transactions, db, year, month)
    
    # Convert top_categories list of dicts to list of CategoryExpense objects
    categories = [schemas.CategoryExpense(**cat) for cat in summary["top_categories"]]
    
    return schemas.MonthlySummary(
        month=f"{year}-{month:02d}",
        total_income=summary["total_income"],
        total_expense=summary["total_expense"],
        savings=summary["savings"],
        investments=summary["investments"],
        top_categories=categories
    )


@router.get("/yearly/{year}", response_model=schemas.YearlySummary)
def get_yearly_analytics(
    year: int,
    db: Session = Depends(get_db)
):
    """Get yearly analytics for a specific year"""
    if year < 1900 or year > 2100:
        raise HTTPException(status_code=400, detail="Year must be between 1900 and 2100")
    
    summary = get_yearly_summary(db, year)
    
    return schemas.YearlySummary(
        year=summary["year"],
        total_income=summary["total_income"],
        total_expense=summary["total_expense"],
        savings=summary["savings"],
        monthly_breakdown=summary["monthly_breakdown"]
    )


@router.get("/insights/{year}/{month}", response_model=List[schemas.Insight])
def get_insights(
    year: int,
    month: int,
    db: Session = Depends(get_db)
):
    """Get insights and recommendations for a specific month"""
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
    if year < 1900 or year > 2100:
        raise HTTPException(status_code=400, detail="Year must be between 1900 and 2100")
    
    transactions = crud.get_transactions_by_month(db, year, month)
    summary = calculate_monthly_summary(transactions, db, year, month)
    insights_list = generate_insights(summary)
    
    return [schemas.Insight(**insight) for insight in insights_list]


@router.get("/trends/spending", response_model=List[dict])
def get_spending_trends_endpoint(
    months: int = Query(6, ge=1, le=24),
    db: Session = Depends(get_db)
):
    """Get spending trends for the last N months"""
    trends = get_spending_trends(db, months)
    return trends


@router.get("/summary/current", response_model=schemas.Analytics)
def get_current_summary(db: Session = Depends(get_db)):
    """Get current month's analytics with insights"""
    now = datetime.now()
    transactions = crud.get_transactions_by_month(db, now.year, now.month)
    summary_data = calculate_monthly_summary(transactions, db, now.year, now.month)
    insights_data = generate_insights(summary_data)
    
    top_categories = [schemas.CategoryExpense(**cat) for cat in summary_data["top_categories"]]
    
    monthly_summary = schemas.MonthlySummary(
        month=f"{now.year}-{now.month:02d}",
        total_income=summary_data["total_income"],
        total_expense=summary_data["total_expense"],
        savings=summary_data["savings"],
        investments=summary_data.get("investments", 0.0),
        top_categories=top_categories
    )
    
    insights = [schemas.Insight(**insight) for insight in insights_data]
    
    return schemas.Analytics(
        monthly_summary=monthly_summary,
        insights=insights
    )
