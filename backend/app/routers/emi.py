from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas
from ..database import get_db
from ..utils.auto_increment import process_auto_emi_entries

router = APIRouter()


@router.post("/", response_model=schemas.EMI)
def create_emi(
    emi: schemas.EMICreate,
    db: Session = Depends(get_db)
):
    """Create a new EMI entry"""
    return crud.create_emi(db, emi)


@router.get("/", response_model=List[schemas.EMI])
def get_all_emi(db: Session = Depends(get_db)):
    """Get all EMI entries"""
    return crud.get_all_emi(db)


@router.get("/active", response_model=List[schemas.EMI])
def get_active_emi(db: Session = Depends(get_db)):
    """Get active EMI entries"""
    return crud.get_active_emi(db)


@router.get("/{emi_id}", response_model=schemas.EMI)
def get_emi(
    emi_id: int,
    db: Session = Depends(get_db)
):
    """Get an EMI by ID"""
    db_emi = crud.get_emi(db, emi_id)
    if not db_emi:
        raise HTTPException(status_code=404, detail="EMI not found")
    return db_emi


@router.put("/{emi_id}", response_model=schemas.EMI)
def update_emi(
    emi_id: int,
    emi_update: schemas.EMIUpdate,
    db: Session = Depends(get_db)
):
    """Update an EMI"""
    db_emi = crud.update_emi(db, emi_id, emi_update)
    if not db_emi:
        raise HTTPException(status_code=404, detail="EMI not found")
    return db_emi


@router.delete("/{emi_id}")
def delete_emi(
    emi_id: int,
    db: Session = Depends(get_db)
):
    """Delete an EMI"""
    success = crud.delete_emi(db, emi_id)
    if not success:
        raise HTTPException(status_code=404, detail="EMI not found")
    return {"message": "EMI deleted successfully"}


@router.post("/process/monthly")
def process_monthly_emi(db: Session = Depends(get_db)):
    """Process all due EMI entries for the current month."""
    processed_count = crud.get_active_emi(db)
    return {"message": f"Checked {len(processed_count)} active EMIs"}


@router.post("/startup/check")
def startup_check_emi(db: Session = Depends(get_db)):
    """Manually run EMI auto-entry checks."""
    result = process_auto_emi_entries(db)
    return result
