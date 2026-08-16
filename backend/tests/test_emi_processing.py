from datetime import date

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.database import Base
from backend.app import models
from backend.app.utils.auto_increment import process_auto_emi_entries


def test_process_auto_emi_entries_creates_expense_transaction_for_due_date():
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    emi = models.EMI(
        name='Car Loan',
        amount=15000,
        start_date=date(2026, 1, 5),
        end_date=date(2026, 12, 5),
        due_date=5,
        is_active=True,
        description='Monthly EMI'
    )
    db.add(emi)
    db.commit()
    db.refresh(emi)

    result = process_auto_emi_entries(db)

    assert result['processed_count'] == 1
    assert result['message'].startswith('EMI auto-entries')
    assert db.query(models.Transaction).count() == 1
    txn = db.query(models.Transaction).first()
    assert txn.type == 'expense'
    assert txn.category == 'EMI'
    assert txn.description == 'EMI: Car Loan'
    assert txn.amount == 15000
    assert txn.date == date(2026, 1, 5)

    db.close()
