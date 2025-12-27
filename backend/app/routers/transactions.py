from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import List, Optional
from .. import crud, schemas
from ..database import get_db

router = APIRouter()


@router.post("/", response_model=schemas.Transaction)
def create_transaction(
    transaction: schemas.TransactionCreate,
    db: Session = Depends(get_db)
):
    """Create a new transaction"""
    return crud.create_transaction(db, transaction)


@router.get("/", response_model=List[schemas.Transaction])
def get_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all transactions with pagination"""
    return crud.get_all_transactions(db, skip=skip, limit=limit)


@router.get("/monthly/{year}/{month}", response_model=List[schemas.Transaction])
def get_transactions_by_month(
    year: int,
    month: int,
    db: Session = Depends(get_db)
):
    """Get transactions for a specific month (YYYY/MM)"""
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
    if year < 1900 or year > 2100:
        raise HTTPException(status_code=400, detail="Year must be between 1900 and 2100")
    
    return crud.get_transactions_by_month(db, year, month)


@router.get("/range/", response_model=List[schemas.Transaction])
def get_transactions_by_range(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db)
):
    """Get transactions within a date range"""
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date must be before end date")
    
    return crud.get_transactions_by_date_range(db, start_date, end_date)


@router.get("/{transaction_id}", response_model=schemas.Transaction)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific transaction by ID"""
    db_transaction = crud.get_transaction(db, transaction_id)
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_transaction


@router.put("/{transaction_id}", response_model=schemas.Transaction)
def update_transaction(
    transaction_id: int,
    transaction_update: schemas.TransactionCreate,
    db: Session = Depends(get_db)
):
    """Update a transaction"""
    db_transaction = crud.update_transaction(db, transaction_id, transaction_update)
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_transaction


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db)
):
    """Delete a transaction"""
    success = crud.delete_transaction(db, transaction_id)
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction deleted successfully"}
