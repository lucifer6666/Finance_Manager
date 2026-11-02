from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter()


def _is_spend(t: models.Transaction) -> bool:
    # Credit card bill payments are excluded to avoid double counting the card purchases
    return t.type == "expense" and not t.is_payment


def _validate_range(start, end):
    if start > end:
        raise HTTPException(status_code=400, detail="Start date must be on or before end date")


def _get_event_or_404(db: Session, event_id: int) -> models.Event:
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


def _to_schema(db: Session, event: models.Event) -> schemas.Event:
    rows = db.query(models.Transaction).filter(models.Transaction.event_id == event.id).all()
    return schemas.Event(
        id=event.id,
        name=event.name,
        start_date=event.start_date,
        end_date=event.end_date,
        created_at=event.created_at,
        transaction_count=len(rows),
        total_expense=round(sum(t.amount for t in rows if _is_spend(t)), 2),
    )


@router.post("/", response_model=schemas.Event)
def create_event(event: schemas.EventCreate, db: Session = Depends(get_db)):
    """Create a new event"""
    name = event.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Event name is required")
    _validate_range(event.start_date, event.end_date)
    db_event = models.Event(name=name, start_date=event.start_date, end_date=event.end_date)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return _to_schema(db, db_event)


@router.get("/", response_model=List[schemas.Event])
def get_events(db: Session = Depends(get_db)):
    """List all events (most recent first) with transaction count and total expense"""
    events = db.query(models.Event).order_by(models.Event.start_date.desc(), models.Event.id.desc()).all()
    return [_to_schema(db, e) for e in events]


@router.put("/{event_id}", response_model=schemas.Event)
def update_event(event_id: int, update: schemas.EventUpdate, db: Session = Depends(get_db)):
    """Edit an event's name and/or date range"""
    event = _get_event_or_404(db, event_id)
    if update.name is not None:
        name = update.name.strip()
        if not name:
            raise HTTPException(status_code=400, detail="Event name is required")
        event.name = name
    if update.start_date is not None:
        event.start_date = update.start_date
    if update.end_date is not None:
        event.end_date = update.end_date
    _validate_range(event.start_date, event.end_date)
    db.commit()
    db.refresh(event)
    return _to_schema(db, event)


@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    """Delete an event; its transactions are kept and become unlinked"""
    event = _get_event_or_404(db, event_id)
    db.query(models.Transaction).filter(models.Transaction.event_id == event_id).update(
        {models.Transaction.event_id: None}
    )
    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}


@router.get("/{event_id}/analysis")
def get_event_analysis(event_id: int, db: Session = Depends(get_db)):
    """All transactions linked to the event plus expense analysis"""
    event = _get_event_or_404(db, event_id)
    transactions = (
        db.query(models.Transaction)
        .filter(models.Transaction.event_id == event_id)
        .order_by(models.Transaction.date, models.Transaction.id)
        .all()
    )

    categories = defaultdict(float)
    payment_methods = defaultdict(float)
    daily = defaultdict(float)
    total_expense = 0.0
    total_income = 0.0
    for t in transactions:
        if _is_spend(t):
            total_expense += t.amount
            categories[t.category] += t.amount
            payment_methods[t.payment_method] += t.amount
            daily[t.date.isoformat()] += t.amount
        elif t.type == "income":
            total_income += t.amount

    days = (event.end_date - event.start_date).days + 1
    ranked = lambda m: [
        {"name": k, "amount": round(v, 2)} for k, v in sorted(m.items(), key=lambda kv: kv[1], reverse=True)
    ]

    return {
        "event": {
            "id": event.id,
            "name": event.name,
            "start_date": event.start_date.isoformat(),
            "end_date": event.end_date.isoformat(),
        },
        "total_expense": round(total_expense, 2),
        "total_income": round(total_income, 2),
        "transaction_count": len(transactions),
        "duration_days": days,
        "avg_daily_expense": round(total_expense / days, 2) if days > 0 else 0.0,
        "categories": ranked(categories),
        "payment_methods": ranked(payment_methods),
        "daily": [{"date": d, "amount": round(a, 2)} for d, a in sorted(daily.items())],
        "transactions": [
            {
                "id": t.id,
                "date": t.date.isoformat(),
                "amount": t.amount,
                "type": t.type,
                "category": t.category,
                "description": t.description,
                "payment_method": t.payment_method,
                "is_payment": bool(t.is_payment),
            }
            for t in transactions
        ],
    }
