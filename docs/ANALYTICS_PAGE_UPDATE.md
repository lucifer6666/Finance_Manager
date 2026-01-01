# Analytics Page Update - Year-Based Calculations & Recurring Investment Handling

## Overview
Updated the Analytics page to calculate data for the selected year only and properly handle recurring investments by splitting their contributions across the year.

## Key Changes

### 1. **Backend: Enhanced Investment Calculation**
**File**: `backend/app/utils/analytics.py` - `calculate_monthly_summary()`

#### Updated Logic:
- **Monthly Recurring Investments**: Only counted if started before or during the current month
  ```python
  if inv.recurring_type == "monthly":
    if inv.purchase_date.year < year or (inv.purchase_date.year == year and inv.purchase_date.month <= month):
      investments_total += inv.recurring_amount
  ```

- **Yearly Recurring Investments**: Divided by 12 and counted once per year (as monthly equivalent)
  ```python
  elif inv.recurring_type == "yearly":
    # Only count once per year, spread as monthly equivalent
    if months_since_purchase >= 0:
      investments_total += (inv.recurring_amount / 12)
  ```

- **Non-Recurring Investments**: Only counted in the month they were purchased
  ```python
  elif inv.purchase_date.year == year and inv.purchase_date.month == month:
    investments_total += inv.initial_amount
  ```

### 2. **Backend: New Year-Based Trends Function**
**File**: `backend/app/utils/analytics.py` - NEW `get_spending_trends_by_year()`

```python
def get_spending_trends_by_year(db: Session, year: int) -> List[Dict]:
    """Get spending trends for all 12 months of a specific year"""
    trends = []
    
    for month in range(1, 13):
        transactions = crud.get_transactions_by_month(db, year, month)
        summary = calculate_monthly_summary(transactions, db, year, month)
        
        trends.append({
            "month": f"{year}-{month:02d}",
            "income": summary["total_income"],
            "expense": summary["total_expense"],
            "investments": summary["investments"],
            "savings": summary["savings"]
        })
    
    return trends
```

### 3. **Backend: Updated Analytics Router**
**File**: `backend/app/routers/analytics.py` - Updated `/trends/spending` endpoint

```python
@router.get("/trends/spending", response_model=List[dict])
def get_spending_trends_endpoint(
    year: int = Query(None),
    months: int = Query(6, ge=1, le=24),
    db: Session = Depends(get_db)
):
    """Get spending trends for a specific year or the last N months"""
    if year:
        # Get full year data if year is specified
        trends = get_spending_trends_by_year(db, year)
    else:
        # Get last N months if year is not specified
        trends = get_spending_trends(db, months)
    return trends
```

#### Features:
- Optional `year` query parameter
- If `year` is provided: fetches all 12 months for that year
- If `year` is null: fetches last N months (default behavior)

### 4. **Frontend: Updated API Client**
**File**: `frontend/src/api/client.ts` - Updated `getSpendingTrends()`

```typescript
getSpendingTrends: (months: number = 6, year?: number) =>
  axiosInstance.get(`/analytics/trends/spending`, { 
    params: { months, ...(year && { year }) } 
  }),
```

#### Changes:
- Accepts optional `year` parameter
- Conditionally includes year in request if provided
- Maintains backward compatibility (works without year parameter)

### 5. **Frontend: Updated Analytics Page**
**File**: `frontend/src/pages/AnalyticsPage.tsx` - Updated `useEffect` for trends

```tsx
useEffect(() => {
  const fetchTrends = async () => {
    setLoading(true);
    try {
      const response = await analyticsApi.getSpendingTrends(12, year);
      setSpendingTrends(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  if (viewMode === 'trends') {
    fetchTrends();
  }
}, [viewMode, year]);  // Added year to dependency array
```

#### Changes:
- Passes `year` parameter to `getSpendingTrends()`
- Added `year` to the dependency array
- Fetches data whenever year changes
- Displays full year data (12 months) for the selected year

## How It Works

### Investment Calculation Flow:

1. **User selects a year** on Analytics page
2. **Frontend calls** `analyticsApi.getSpendingTrends(12, year)`
3. **Backend receives** year parameter
4. **For each month (1-12) in the year:**
   - Get all transactions for that month
   - Calculate investments for that month:
     - **Recurring Monthly**: Check if investment started ≤ this month, add full amount
     - **Recurring Yearly**: Check if investment started in or before this year, add (amount ÷ 12)
     - **Non-Recurring**: Only add in the month purchased
   - Calculate income, expense, savings
5. **Return data** for all 12 months of the selected year

### Example Scenarios:

#### Scenario 1: Monthly Recurring Investment
- Investment: ₹1,000 monthly starting March 2025
- 2025 Calculation:
  - Jan-Feb: ₹0 (not started yet)
  - Mar-Dec: ₹1,000 each month
  - Total 2025: ₹10,000

#### Scenario 2: Yearly Recurring Investment
- Investment: ₹12,000 yearly starting Jan 2025
- 2025 Calculation:
  - Jan-Dec: ₹12,000 ÷ 12 = ₹1,000 each month
  - Total 2025: ₹12,000

#### Scenario 3: Non-Recurring Investment
- Investment: ₹50,000 on May 15, 2025
- 2025 Calculation:
  - Jan-Apr: ₹0
  - May: ₹50,000
  - Jun-Dec: ₹0
  - Total 2025: ₹50,000

## Data Flow Diagram

```
AnalyticsPage
    ↓
Select Year (2025)
    ↓
Click "Spending Trends"
    ↓
analyticsApi.getSpendingTrends(12, 2025)
    ↓
Backend: /trends/spending?year=2025
    ↓
get_spending_trends_by_year(db, 2025)
    ↓
Loop: For month in 1..12:
  - Get transactions for 2025-month
  - calculate_monthly_summary() with year-month context
    - Check each investment's relevance to 2025-month
    - Split recurring investments appropriately
    - Return monthly totals
    ↓
Return [Jan 2025, Feb 2025, ..., Dec 2025]
    ↓
Frontend: Display in chart and table
```

## Benefits

✅ **Year-Based Analysis**: See complete picture for any year, not just last 12 months
✅ **Proper Recurring Handling**: Investments are split correctly across the year
✅ **Accurate Calculations**: Monthly equivalents for yearly investments prevent skewing
✅ **Flexible**: Can still use last-N-months view by omitting year parameter
✅ **Backward Compatible**: Existing code still works without year parameter
✅ **Real Data**: Shows actual investment patterns for selected year

## No Breaking Changes

- Existing API endpoints unchanged
- Frontend remains compatible
- Default behavior (without year) preserved
- All features additive

## Testing Scenarios

1. **Test Year Selection**: Change year and verify chart updates with correct months
2. **Test Recurring Monthly**: Add investment starting mid-year, verify it appears only from that month
3. **Test Recurring Yearly**: Add yearly investment, verify it's divided into monthly equivalents
4. **Test Non-Recurring**: Add investment, verify it appears only in its purchase month
5. **Test Multiple Years**: Compare 2024 vs 2025 data to ensure year-specific calculations
