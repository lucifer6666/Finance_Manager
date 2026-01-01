from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas
from ..database import get_db
from ..utils.analytics import calculate_savings_comparison
from ..utils.auto_increment import process_auto_recurring_investments

router = APIRouter()


@router.post("/", response_model=schemas.SavingsInvestment)
def create_savings_investment(
    investment: schemas.SavingsInvestmentCreate,
    db: Session = Depends(get_db)
):
    """Create a new investment record"""
    return crud.create_savings_investment(db, investment)


@router.get("/comparison/current", response_model=schemas.SavingsComparison)
def get_savings_comparison(db: Session = Depends(get_db)):
    """Get account savings vs investments comparison"""
    return calculate_savings_comparison(db)


@router.get("/", response_model=List[schemas.SavingsInvestment])
def get_savings_investments(db: Session = Depends(get_db)):
    """Get all investments"""
    return crud.get_all_savings_investments(db)


@router.get("/{investment_id}", response_model=schemas.SavingsInvestment)
def get_savings_investment(
    investment_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific investment by ID"""
    db_investment = crud.get_savings_investment(db, investment_id)
    if not db_investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    return db_investment


@router.put("/{investment_id}", response_model=schemas.SavingsInvestment)
def update_savings_investment(
    investment_id: int,
    investment_update: schemas.SavingsInvestmentCreate,
    db: Session = Depends(get_db)
):
    """Update an investment"""
    db_investment = crud.update_savings_investment(db, investment_id, investment_update)
    if not db_investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    return db_investment


@router.delete("/{investment_id}")
def delete_savings_investment(
    investment_id: int,
    db: Session = Depends(get_db)
):
    """Delete an investment"""
    success = crud.delete_savings_investment(db, investment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Investment not found")
    return {"message": "Investment deleted successfully"}


@router.post("/process/recurring")
def process_recurring_investments(db: Session = Depends(get_db)):
    """Process all recurring investments. Should be called daily."""
    processed_count = crud.process_recurring_investments(db)
    return {"message": f"Processed {processed_count} recurring investments"}

@router.post("/startup/check")
def startup_check_investments(db: Session = Depends(get_db)):
    """
    Manually trigger recurring investment auto-entry checks.
    This is automatically called on app startup.
    Useful for manual triggers if needed.
    """
    result = process_auto_recurring_investments(db)
    return result