#!/usr/bin/env python3
"""
Database initialization script - creates/updates database schema while preserving data
"""
import os
import sys
from sqlalchemy import inspect, Column, String, Float, Date, Integer, text
from datetime import date

db_file = "./finance.db"

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
                if "duplicate column" in str(e).lower():
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
                if "duplicate column" in str(e).lower():
                    print("  (Column already exists - continuing)")
                else:
                    sys.exit(1)
            finally:
                session.close()
        else:
            print("  ✓ start_date column already exists in salaries")
    else:
        print("  • savings_investments table not found, creating new schema...")
        Base.metadata.create_all(bind=engine)
else:
    print(f"✓ Creating new database: {db_file}")
    # Create all tables with fresh schema
    Base.metadata.create_all(bind=engine)

print("\n✓ Database initialization complete!")
print("\nSchema includes:")
print("  Tables:")
print("  - transactions")
print("  - credit_cards")
print("  - savings_investments (with recurring investment support)")
print("  - salaries (with auto-entry tracking and start date)")
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

