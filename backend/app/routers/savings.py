from datetime import date
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


@router.get("/plans", response_model=List[schemas.SavingsPlan])
def get_savings_plans(db: Session = Depends(get_db)):
    return crud.get_all_savings_plans(db)


@router.post("/plans", response_model=schemas.SavingsPlan)
def create_savings_plan(
    plan: schemas.SavingsPlanCreate,
    db: Session = Depends(get_db)
):
    return crud.create_savings_plan(db, plan)


@router.get("/plans/{plan_id}", response_model=schemas.SavingsPlan)
def get_savings_plan(
    plan_id: int,
    db: Session = Depends(get_db)
):
    db_plan = crud.get_savings_plan(db, plan_id)
    if not db_plan:
        raise HTTPException(status_code=404, detail="Savings plan not found")
    return db_plan


@router.put("/plans/{plan_id}", response_model=schemas.SavingsPlan)
def update_savings_plan(
    plan_id: int,
    plan_update: schemas.SavingsPlanUpdate,
    db: Session = Depends(get_db)
):
    db_plan = crud.update_savings_plan(db, plan_id, plan_update)
    if not db_plan:
        raise HTTPException(status_code=404, detail="Savings plan not found")
    return db_plan


@router.delete("/plans/{plan_id}")
def delete_savings_plan(
    plan_id: int,
    db: Session = Depends(get_db)
):
    success = crud.delete_savings_plan(db, plan_id)
    if not success:
        raise HTTPException(status_code=404, detail="Savings plan not found")
    return {"message": "Savings plan deactivated successfully"}


@router.get("/entries", response_model=List[schemas.SavingsEntry])
def get_savings_entries(db: Session = Depends(get_db)):
    return crud.get_all_savings_entries(db)


@router.get("/entries/monthly/{year}/{month}", response_model=List[schemas.SavingsEntry])
def get_savings_entries_by_month(
    year: int,
    month: int,
    db: Session = Depends(get_db)
):
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
    return crud.get_savings_entries_by_month(db, year, month)


@router.post("/entries", response_model=schemas.SavingsEntry)
def create_savings_entry(
    entry: schemas.SavingsEntryCreate,
    db: Session = Depends(get_db)
):
    return crud.create_savings_entry(db, entry)


@router.delete("/entries/{entry_id}")
def delete_savings_entry(
    entry_id: int,
    db: Session = Depends(get_db)
):
    success = crud.delete_savings_entry(db, entry_id)
    if not success:
        raise HTTPException(status_code=404, detail="Savings entry not found")
    return {"message": "Savings entry deleted successfully"}


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


@router.post("/plans/process")
def process_due_saving_plans(db: Session = Depends(get_db)):
    """Create savings ledger entries for due plans without altering prior entries."""
    processed_count = crud.process_due_saving_plans(db)
    return {"message": f"Processed {processed_count} saving plan entries"}


@router.post("/plans/backfill")
def backfill_missing_savings_entries(db: Session = Depends(get_db)):
    """Backfill any missing monthly entries for all active saving plans."""
    count = crud.backfill_all_missing_savings_entries(db, date.today())
    return {"message": f"Backfilled {count} missing saving entries"}


@router.post("/startup/check")
def startup_check_investments(db: Session = Depends(get_db)):
    """
    Manually trigger recurring investment auto-entry checks.
    This is automatically called on app startup.
    Useful for manual triggers if needed.
    """
    result = process_auto_recurring_investments(db)
    return result


@router.post("/migrate/legacy-to-plans")
def migrate_legacy_investments(db: Session = Depends(get_db)):
    """
    One-time migration endpoint to convert all recurring SavingsInvestment records
    to the new SavingsPlan + SavingsEntry system.
    
    This converts legacy recurring investments into immutable plan-based entries.
    Original investments are marked as non-recurring after migration.
    """
    result = crud.migrate_recurring_investments_to_plans(db)
    return result