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
    get_spending_trends,
    get_spending_trends_by_year,
    get_yearly_category_distribution
)

YEAR_VALIDATION_ERROR = "Year must be between 1900 and 2100"

router = APIRouter()


@router.get("/monthly/{year}/{month}", response_model=schemas.MonthlySummary)
def get_monthly_analytics(
    year: int,
    month: int,
    include_investments: bool = Query(False),
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
    if include_investments:
        categories = [schemas.CategoryExpense(**cat) for cat in summary["top_categories"]]
    else:
        categories = [schemas.CategoryExpense(**cat) for cat in summary["top_categories"] if cat["name"].lower() != "investments"]
    
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
        raise HTTPException(status_code=400, detail=YEAR_VALIDATION_ERROR)
    
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
    year: int = Query(None),
    months: int = Query(6, ge=1, le=24),
    db: Session = Depends(get_db)
):
    """Get spending trends for a specific year or the last N months"""
    if year:
        # Get full year data if year is specified
        trends = get_spending_trends_by_year(db, year)
    else:
        # Get last N months if year is not specified
        trends = get_spending_trends(db, months)
    return trends


@router.get("/categories/yearly/{year}", response_model=dict)
def get_yearly_category_distribution_endpoint(
    year: int,
    include_investments: bool = Query(True),
    db: Session = Depends(get_db)
):
    """Get yearly category distribution with option to include/exclude investments"""
    if year < 1900 or year > 2100:
        raise HTTPException(status_code=400, detail=YEAR_VALIDATION_ERROR)
    
    distribution = get_yearly_category_distribution(db, year, include_investments)
    return distribution


@router.get("/summary/current", response_model=schemas.Analytics)
def get_current_summary(
    include_investments: bool = Query(True),
    db: Session = Depends(get_db)
):
    """Get current month's analytics with insights"""
    now = datetime.now()
    transactions = crud.get_transactions_by_month(db, now.year, now.month)
    summary_data = calculate_monthly_summary(transactions, db, now.year, now.month)
    insights_data = generate_insights(summary_data)
    
    if include_investments:
        top_categories = [schemas.CategoryExpense(**cat) for cat in summary_data["top_categories"]]
    else:
        top_categories = [schemas.CategoryExpense(**cat) for cat in summary_data["top_categories"] if cat["name"].lower() != "investments"]
    
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
