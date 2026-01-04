#!/usr/bin/env python3
"""
Database initialization script - creates/updates database schema while preserving data
"""
import os
import sys
from sqlalchemy import inspect, Column, String, Float, Date, Integer, text
from datetime import date

db_file = "./finance.db"
DUPLICATE_COLUMN_ERROR = "duplicate column"

# Import database components
from app.database import Base, engine, SessionLocal
from app import models

# Check if database exists
db_exists = os.path.exists(db_file)

if db_exists:
    print(f"✓ Existing database found: {db_file}")
    print("→ Migrating schema while preserving data...")
    
    # Create a session to check existing schema
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    if 'savings_investments' in existing_tables:
        # Check if new columns exist
        existing_columns = [col['name'] for col in inspector.get_columns('savings_investments')]
        new_columns_needed = ['is_recurring', 'recurring_type', 'recurring_amount', 'last_recurring_date']
        
        columns_to_add = [col for col in new_columns_needed if col not in existing_columns]
        
        if columns_to_add:
            print(f"  • Found {len(columns_to_add)} missing columns in savings_investments")
            session = SessionLocal()
            try:
                # Add missing columns
                with engine.begin() as connection:
                    for col_name in columns_to_add:
                        if col_name == 'is_recurring':
                            connection.execute(text(f'ALTER TABLE savings_investments ADD COLUMN {col_name} INTEGER DEFAULT 0'))
                            print(f"    ✓ Added column: {col_name}")
                        elif col_name == 'recurring_type':
                            connection.execute(text(f'ALTER TABLE savings_investments ADD COLUMN {col_name} VARCHAR'))
                            print(f"    ✓ Added column: {col_name}")
                        elif col_name == 'recurring_amount':
                            connection.execute(text(f'ALTER TABLE savings_investments ADD COLUMN {col_name} FLOAT'))
                            print(f"    ✓ Added column: {col_name}")
                        elif col_name == 'last_recurring_date':
                            connection.execute(text(f'ALTER TABLE savings_investments ADD COLUMN {col_name} DATE'))
                            print(f"    ✓ Added column: {col_name}")
                
                print("✓ savings_investments table updated successfully")
            except Exception as e:
                print(f"✗ Error adding columns: {e}")
                # If columns already exist, that's okay
                if DUPLICATE_COLUMN_ERROR in str(e).lower():
                    print("  (Columns already exist - continuing)")
                else:
                    sys.exit(1)
            finally:
                session.close()
        else:
            print("  ✓ All required columns already exist in savings_investments")
    
    # Check salaries table for start_date column
    if 'salaries' in existing_tables:
        existing_columns = [col['name'] for col in inspector.get_columns('salaries')]
        
        if 'start_date' not in existing_columns:
            print("  • Found missing column in salaries: start_date")
            session = SessionLocal()
            try:
                with engine.begin() as connection:
                    # Add start_date as nullable (SQLite limitation with DEFAULT)
                    connection.execute(text('ALTER TABLE salaries ADD COLUMN start_date DATE'))
                    print("    ✓ Added column: start_date")
                print("✓ salaries table updated successfully")
            except Exception as e:
                print(f"✗ Error adding column: {e}")
                if DUPLICATE_COLUMN_ERROR in str(e).lower():
                    print("  (Column already exists - continuing)")
                else:
                    sys.exit(1)
            finally:
                session.close()
        else:
            print("  ✓ start_date column already exists in salaries")
    else:
        print("  • salaries table not found, creating new schema...")
        Base.metadata.create_all(bind=engine)
    
    # Check transactions table for is_payment column
    if 'transactions' in existing_tables:
        existing_columns = [col['name'] for col in inspector.get_columns('transactions')]
        
        if 'is_payment' not in existing_columns:
            print("  • Found missing column in transactions: is_payment")
            session = SessionLocal()
            try:
                with engine.begin() as connection:
                    connection.execute(text('ALTER TABLE transactions ADD COLUMN is_payment INTEGER DEFAULT 0'))
                    print("    ✓ Added column: is_payment")
                print("✓ transactions table updated successfully")
            except Exception as e:
                print(f"✗ Error adding column: {e}")
                if DUPLICATE_COLUMN_ERROR in str(e).lower():
                    print("  (Column already exists - continuing)")
                else:
                    sys.exit(1)
            finally:
                session.close()
        else:
            print("  ✓ is_payment column already exists in transactions")
    
    # Check if credit_card_payments table exists
    if 'credit_card_payments' not in existing_tables:
        print("  • credit_card_payments table not found, creating...")
        try:
            with engine.begin() as connection:
                connection.execute(text('''
                    CREATE TABLE credit_card_payments (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        credit_card_id INTEGER NOT NULL,
                        payment_date DATE NOT NULL,
                        amount FLOAT NOT NULL,
                        payment_method VARCHAR NOT NULL,
                        transaction_id INTEGER,
                        description VARCHAR,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(credit_card_id) REFERENCES credit_cards(id),
                        FOREIGN KEY(transaction_id) REFERENCES transactions(id)
                    )
                '''))
                print("    ✓ Created table: credit_card_payments")
            print("✓ credit_card_payments table created successfully")
        except Exception as e:
            print(f"✗ Error creating credit_card_payments table: {e}")
            if "already exists" in str(e).lower():
                print("  (Table already exists - continuing)")
            else:
                sys.exit(1)
    else:
        print("  ✓ credit_card_payments table already exists")
else:
    print(f"✓ Creating new database: {db_file}")
    # Create all tables with fresh schema
    Base.metadata.create_all(bind=engine)

print("\n✓ Database initialization complete!")
print("\nSchema includes:")
print("  Tables:")
print("  - transactions (with credit card payment tracking)")
print("  - credit_cards")
print("  - credit_card_payments (bill payment records)")
print("  - savings_investments (with recurring investment support)")
print("  - salaries (with auto-entry tracking and start date)")
print("\nTransaction Fields:")
print("  • Basic: id, date, amount, type, category, payment_method")
print("  • Credit Card: credit_card_id, is_payment (for bill payments)")
print("  • Metadata: description, created_at")
print("\nCredit Card Payment Fields:")
print("  • Tracking: id, credit_card_id, payment_date, amount, payment_method")
print("  • Linking: transaction_id (optional reference to transaction)")
print("  • Metadata: description, created_at")
print("\nSavings Investment Fields:")
print("  • Basic: id, name, investment_type, purchase_date")
print("  • Values: initial_amount, current_value")
print("  • Recurring: is_recurring, recurring_type, recurring_amount, last_recurring_date")
print("  • Metadata: description, created_at, updated_at")
print("\nSalary Fields:")
print("  • Basic: id, name, amount, start_date")
print("  • Status: is_active")
print("  • Tracking: last_added_date (for monthly auto-entry)")
print("  • Metadata: description, created_at, updated_at")

