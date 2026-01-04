from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import List, Optional
from .. import crud, schemas
from ..database import get_db

router = APIRouter()

PAYMENT_NOT_FOUND = "Payment not found"


@router.post("/", response_model=schemas.CreditCardPayment)
def create_payment(
    payment: schemas.CreditCardPaymentCreate,
    db: Session = Depends(get_db)
):
    """Create a new credit card payment"""
    # Verify credit card exists
    card = crud.get_credit_card(db, payment.credit_card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Credit card not found")
    
    return crud.create_credit_card_payment(db, payment)


@router.get("/", response_model=List[schemas.CreditCardPayment])
def get_payments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all credit card payments with pagination"""
    return crud.get_all_credit_card_payments(db, skip=skip, limit=limit)


@router.get("/card/{card_id}", response_model=List[schemas.CreditCardPayment])
def get_card_payments(
    card_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all payments for a specific credit card"""
    # Verify credit card exists
    card = crud.get_credit_card(db, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Credit card not found")
    
    return crud.get_payments_by_card(db, card_id, skip=skip, limit=limit)


@router.get("/range/", response_model=List[schemas.CreditCardPayment])
def get_payments_by_range(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db)
):
    """Get credit card payments within a date range"""
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date must be before end date")
    
    return crud.get_payments_by_date_range(db, start_date, end_date)


@router.get("/{payment_id}", response_model=schemas.CreditCardPayment)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific payment by ID"""
    db_payment = crud.get_credit_card_payment(db, payment_id)
    if not db_payment:
        raise HTTPException(status_code=404, detail=PAYMENT_NOT_FOUND)
    return db_payment


@router.put("/{payment_id}", response_model=schemas.CreditCardPayment)
def update_payment(
    payment_id: int,
    payment_update: schemas.CreditCardPaymentCreate,
    db: Session = Depends(get_db)
):
    """Update a payment"""
    db_payment = crud.update_credit_card_payment(db, payment_id, payment_update)
    if not db_payment:
        raise HTTPException(status_code=404, detail=PAYMENT_NOT_FOUND)
    return db_payment


@router.delete("/{payment_id}")
def delete_payment(
    payment_id: int,
    db: Session = Depends(get_db)
):
    """Delete a payment"""
    success = crud.delete_credit_card_payment(db, payment_id)
    if not success:
        raise HTTPException(status_code=404, detail=PAYMENT_NOT_FOUND)
    return {"message": "Payment deleted successfully"}
