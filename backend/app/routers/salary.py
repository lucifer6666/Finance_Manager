from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas
from ..database import get_db

router = APIRouter()


@router.post("/", response_model=schemas.Salary)
def create_salary(
    salary: schemas.SalaryCreate,
    db: Session = Depends(get_db)
):
    """Create a new salary entry"""
    return crud.create_salary(db, salary)


@router.get("/", response_model=List[schemas.Salary])
def get_all_salaries(db: Session = Depends(get_db)):
    """Get all salary entries"""
    return crud.get_all_salaries(db)


@router.get("/active", response_model=List[schemas.Salary])
def get_active_salaries(db: Session = Depends(get_db)):
    """Get all active salary entries"""
    return crud.get_active_salaries(db)


@router.get("/{salary_id}", response_model=schemas.Salary)
def get_salary(
    salary_id: int,
    db: Session = Depends(get_db)
):
    """Get a salary by ID"""
    salary = crud.get_salary(db, salary_id)
    if not salary:
        raise HTTPException(status_code=404, detail="Salary not found!")
    return salary


@router.put("/{salary_id}", response_model=schemas.Salary)
def update_salary(
    salary_id: int,
    salary_update: schemas.SalaryUpdate,
    db: Session = Depends(get_db)
):
    """Update a salary entry"""
    salary = crud.update_salary(db, salary_id, salary_update)
    if not salary:
        raise HTTPException(status_code=404, detail="Salary not found")
    return salary


@router.delete("/{salary_id}")
def delete_salary(
    salary_id: int,
    db: Session = Depends(get_db)
):
    """Delete a salary entry"""
    success = crud.delete_salary(db, salary_id)
    if not success:
        raise HTTPException(status_code=404, detail="Salary not found")
    return {"message": "Salary deleted successfully"}


@router.post("/process/monthly")
def process_monthly_salaries(db: Session = Depends(get_db)):
    """Process monthly salary auto-entries (called on 1st of month)"""
    processed_count = crud.process_monthly_salaries(db)
    return {"message": f"Processed {processed_count} salary entries"}
