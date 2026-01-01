# Auto-Increment Features Update

## Overview
The Finance Manager app has been updated to automatically check and process auto-increment entries (salaries and recurring investments) every time the backend is launched.

## What Changed

### 1. **New Auto-Increment Utility Module**
Created: `backend/app/utils/auto_increment.py`

This module contains three main functions:

#### `process_auto_salary_entries(db)`
- **Purpose**: Checks if active salaries have been added for the current month
- **Logic**:
  - Queries all active salaries from the database
  - For each salary, checks if `last_added_date` is in the current month
  - If not found or from a different month, creates an income transaction and updates `last_added_date`
  - Returns status with counts of processed and skipped entries

#### `process_auto_recurring_investments(db)`
- **Purpose**: Checks if recurring investments are due and processes them
- **Logic**:
  - Queries all recurring investments (`is_recurring == 1`)
  - For each investment:
    - If `last_recurring_date` is `null`, initializes it and adds the recurring amount
    - If `last_recurring_date` is set, checks if the next due date has passed based on `recurring_type` (monthly/yearly)
    - When due, adds `recurring_amount` to `current_value` and updates `last_recurring_date`
  - Returns status with counts of processed and skipped entries

#### `run_startup_checks(db)`
- **Purpose**: Orchestrates all startup checks
- **Returns**: Combined status from both salary and investment checks

### 2. **Updated Main App File**
Modified: `backend/app/main.py`

- Imports the auto-increment utility functions
- Calls `run_startup_checks()` during app initialization
- Displays startup check results in the console with clear formatting
- Includes error handling to warn if checks fail

**Console Output Example**:
```
============================================================
AUTO-INCREMENT STARTUP CHECKS
============================================================
✓ Salary entries: Salary auto-entries: 2 added, 1 already exist
✓ Recurring investments: Recurring investments: 1 processed, 0 not due
✓ Total auto-entries processed: 3
============================================================
```

### 3. **New API Endpoints**

#### Salary Router Enhancement
Added: `POST /api/salaries/startup/check`
- Manually triggers salary auto-entry checks
- Automatically called on app startup
- Useful for manual verification if needed
- Returns: `{ "processed_count": int, "skipped_count": int, "message": string }`

#### Savings Router Enhancement
Added: `POST /api/savings/startup/check`
- Manually triggers recurring investment checks
- Automatically called on app startup
- Useful for manual verification if needed
- Returns: `{ "processed_count": int, "skipped_count": int, "message": string }`

## How It Works

### On Backend Startup:
1. ✅ Creates database tables (existing functionality)
2. ✅ **NEW**: Runs startup checks for:
   - Active salaries that haven't been added this month
   - Recurring investments that are due based on their schedule
3. ✅ Displays results to console
4. ✅ Backend is ready to serve API requests

### Logic Flow:

**For Salaries:**
```
For each active salary:
  If last_added_date is NULL or from a different month:
    → Create income transaction for today
    → Update last_added_date to today
    → Count as processed
  Else:
    → Skip (already added this month)
    → Count as skipped
```

**For Recurring Investments:**
```
For each recurring investment:
  If last_recurring_date is NULL:
    → Add recurring_amount to current_value
    → Set last_recurring_date to today
    → Count as processed
  Else if (monthly and 1 month passed) OR (yearly and 1 year passed):
    → Add recurring_amount to current_value
    → Update last_recurring_date to today
    → Count as processed
  Else:
    → Not due yet
    → Count as skipped
```

## Benefits

1. **Automatic Processing**: No manual intervention needed when launching the backend
2. **Data Consistency**: Ensures all due auto-increments are captured
3. **Local App Support**: Perfect for local/offline apps that don't run 24/7
4. **Non-Destructive**: Skips entries that already exist, preventing duplicates
5. **Transparent Feedback**: Console output shows what was processed on startup
6. **Manual Override**: API endpoints available if manual triggers are needed

## Database Schema Usage

### Salary Model (`models.Salary`)
- `last_added_date`: Tracks the last month salary was auto-added
- `is_active`: Controls whether salary should be auto-added (0=inactive, 1=active)
- `start_date`: When the salary was created

### SavingsInvestment Model (`models.SavingsInvestment`)
- `is_recurring`: Enables/disables recurring (0=no, 1=yes)
- `recurring_type`: "monthly" or "yearly"
- `recurring_amount`: Amount to add each period
- `last_recurring_date`: Last date the recurring amount was added
- `current_value`: Updated with recurring amounts when due

## No Breaking Changes
- All existing functionality remains intact
- CRUD operations work as before
- Existing endpoints unchanged
- Database schema not altered (uses existing columns)
