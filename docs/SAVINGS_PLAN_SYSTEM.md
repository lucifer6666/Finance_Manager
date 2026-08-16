# Savings Plan System - Implementation Guide

## Overview

The savings system has been redesigned to separate **saving plans** (configuration) from **saving entries** (immutable ledger). This prevents historical data from being mutated when plans are updated.

## Architecture

### Two-Table Model

#### 1. **SavingsPlan** (Configuration)
- Stores the template for recurring savings
- Can be updated/edited without affecting prior entries
- Fields:
  - `name`: Plan name (e.g., "Emergency Fund")
  - `investment_type`: Category (e.g., "mutual_fund", "fixed_deposit")
  - `amount`: Amount to save per cycle
  - `recurring_type`: 'monthly' or 'yearly'
  - `due_date`: Day of month (1-31) when saving is due
  - `start_date`: When the plan becomes active
  - `end_date`: When the plan stops (optional)
  - `is_active`: Enable/disable without deletion
  - `last_processed_date`: Internal tracking of last run

#### 2. **SavingsEntry** (Immutable Ledger)
- Records actual saved amounts on specific dates
- Created automatically when a plan is due
- Never mutated after creation
- Fields:
  - `plan_id`: Link to the originating plan
  - `amount`: Actual amount saved
  - `entry_date`: Date the saving was recorded
  - `source`: 'auto' or 'manual'
  - `description`: Auto-generated or user notes

## Data Flow

### Startup Auto-Processing

When the app starts (`backend/app/main.py`):

1. **Salaries** → Creates income transactions for the current month
2. **Recurring Investments** → Updates investment values
3. **EMI Entries** → Creates expense transactions
4. **Saving Plans** → Creates new SavingsEntry records for due plans

**Function**: `process_auto_saving_plans()` in [backend/app/utils/auto_increment.py](backend/app/utils/auto_increment.py#L186)

```python
# Pseudocode
For each active SavingsPlan:
  - Skip if before start_date or after end_date
  - Calculate due_date based on recurring_type and due_date field
  - Check if entry already exists for due_date
  - If due_date <= today AND no entry exists → create SavingsEntry
  - Update plan.last_processed_date
```

### API Endpoints

#### Plan Management
- `POST /api/savings/plans` - Create a new plan
- `GET /api/savings/plans` - List all plans
- `GET /api/savings/plans/{id}` - Get plan details
- `PUT /api/savings/plans/{id}` - Update plan (only affects future entries)
- `DELETE /api/savings/plans/{id}` - Deactivate plan

#### Entry Viewing
- `GET /api/savings/entries` - All entries across all months
- `GET /api/savings/entries/monthly/{year}/{month}` - Entries for specific month
- `POST /api/savings/entries` - Manual entry creation

#### Processing
- `POST /api/savings/plans/process` - Manually trigger due-date processing
- `POST /api/savings/process/recurring` - Process recurring investments (legacy)

## Frontend Integration

### Savings Page Tabs

#### Tab 1: Saving Plans
- Lists all configured plans
- Shows name, type, amount, schedule, due date, status
- Use Case: Configure and manage which plans are active

#### Tab 2: Monthly Entries
- Month picker to select target month
- Shows all saved entries for that month
- Columns: Date, Plan Name, Amount, Source, Description
- Use Case: Review actual savings history by month

#### Tab 3: Legacy Investments
- Original investment tracking UI (backward compatible)
- For non-recurring or one-time investments
- Use Case: Track non-automated savings vehicles

## Example Workflow

### Step 1: Create a Saving Plan
```json
POST /api/savings/plans
{
  "name": "Emergency Fund",
  "investment_type": "fixed_deposit",
  "amount": 10000,
  "recurring_type": "monthly",
  "due_date": 1,
  "start_date": "2025-01-01",
  "is_active": true
}
```

### Step 2: App Startup (auto-processing)
- On Jan 1: Creates SavingsEntry(amount=10000, entry_date=2025-01-01)
- On Feb 1: Creates SavingsEntry(amount=10000, entry_date=2025-02-01)
- (Continues monthly)

### Step 3: Update Plan (does NOT affect past entries)
```json
PUT /api/savings/plans/1
{
  "amount": 15000  // Only future entries use new amount
}
```

- On Mar 1: Creates SavingsEntry(amount=15000, entry_date=2025-03-01)
- Previous entries (Jan, Feb) remain at 10000

### Step 4: View Monthly Entries
```
GET /api/savings/entries/monthly/2025/3
→ Returns all 3 entries (10k + 10k + 15k)
```

## Key Design Benefits

✅ **Historical Accuracy**: Past entries are never modified  
✅ **Plan Flexibility**: Edit plans without affecting historical data  
✅ **Audit Trail**: Every entry has a creation timestamp and source  
✅ **Automatic Processing**: Runs on startup and can be triggered manually  
✅ **Backward Compatible**: Legacy investment table still available  

## Migration from Old System

The system is designed to coexist with the legacy `SavingsInvestment` table:

- Old investments still work (one-time recordings)
- New recurring savings use the plan/entry system
- `SavingsComparison` (analytics) uses both tables
- No data loss during transition

## Testing the Flow

### Manual Test via API

```bash
# 1. Create a plan
curl -X POST http://localhost:8000/api/savings/plans \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","investment_type":"mutual_fund","amount":5000,"recurring_type":"monthly","due_date":15}'

# 2. Trigger processing
curl -X POST http://localhost:8000/api/savings/plans/process

# 3. View entries for this month
curl http://localhost:8000/api/savings/entries/monthly/2025/8

# 4. Update the plan
curl -X PUT http://localhost:8000/api/savings/plans/1 \
  -H "Content-Type: application/json" \
  -d '{"amount":6000}'

# 5. Verify old entries unchanged, future use new amount
curl http://localhost:8000/api/savings/entries/monthly/2025/9
```

## Related Documentation

- [EMI Tracking System](CREDIT_CARD_PAYMENTS.md)
- [Auto-Increment Architecture](AUTO_INCREMENT_UPDATE.md)
- [Analytics & Comparisons](ANALYTICS_PAGE_UPDATE.md)
