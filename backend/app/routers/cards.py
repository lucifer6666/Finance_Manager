from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas
from ..database import get_db
from ..utils.analytics import calculate_credit_card_utilization

router = APIRouter()


@router.post("/", response_model=schemas.CreditCard)
def create_credit_card(
    card: schemas.CreditCardCreate,
    db: Session = Depends(get_db)
):
    """Create a new credit card"""
    return crud.create_credit_card(db, card)


@router.get("/", response_model=List[schemas.CreditCard])
def get_credit_cards(db: Session = Depends(get_db)):
    """Get all credit cards"""
    return crud.get_all_credit_cards(db)


@router.get("/{card_id}", response_model=schemas.CreditCard)
def get_credit_card(
    card_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific credit card by ID"""
    db_card = crud.get_credit_card(db, card_id)
    if not db_card:
        raise HTTPException(status_code=404, detail="Credit card not found")
    return db_card


@router.put("/{card_id}", response_model=schemas.CreditCard)
def update_credit_card(
    card_id: int,
    card_update: schemas.CreditCardCreate,
    db: Session = Depends(get_db)
):
    """Update a credit card"""
    db_card = crud.update_credit_card(db, card_id, card_update)
    if not db_card:
        raise HTTPException(status_code=404, detail="Credit card not found")
    return db_card


@router.delete("/{card_id}")
def delete_credit_card(
    card_id: int,
    db: Session = Depends(get_db)
):
    """Delete a credit card"""
    success = crud.delete_credit_card(db, card_id)
    if not success:
        raise HTTPException(status_code=404, detail="Credit card not found")
    return {"message": "Credit card deleted successfully"}


@router.get("/{card_id}/utilization", response_model=dict)
def get_card_utilization(
    card_id: int,
    db: Session = Depends(get_db)
):
    """Get credit card utilization status"""
    utilization = calculate_credit_card_utilization(db, card_id)
    if not utilization:
        raise HTTPException(status_code=404, detail="Credit card not found")
    return utilization
