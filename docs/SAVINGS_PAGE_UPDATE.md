# Savings Page Update - Recurring Investment Display & Edit

## Overview
Updated the Savings & Investments page to display recurring status and allow editing to enable/disable auto-entry for each investment.

## Changes Made

### 1. **SavingsInvestmentTable Component** 
**File**: `frontend/src/components/SavingsInvestmentTable.tsx`

#### New Features:
- **New Column "Recurring"**: Displays recurring status with color-coded badges
  - `None` (gray) - Not recurring
  - `Monthly` (cyan) - Monthly recurring
  - `Yearly` (indigo) - Yearly recurring
  
- **Clickable Status Badge**: Click any recurring badge to edit
- **Inline Edit Mode**: When editing, shows:
  - Checkbox to toggle recurring on/off
  - Dropdown to select "Monthly" or "Yearly" (when recurring is enabled)
  
- **Save/Cancel Buttons**: Replace Delete button during edit mode

#### Key Features:
```tsx
// Color-coded badges for recurring status
const recurringColors: Record<string, string> = {
  monthly: 'bg-cyan-100 text-cyan-800',
  yearly: 'bg-indigo-100 text-indigo-800',
  none: 'bg-gray-100 text-gray-600',
};

// State management for editing
const [editingId, setEditingId] = useState<number | null>(null);
const [editRecurring, setEditRecurring] = useState<{ 
  is_recurring: boolean; 
  recurring_type?: string 
}>();

// Save recurring changes
const handleSaveRecurring = async (id: number) => {
  await onUpdate?.(id, {
    is_recurring: editRecurring.is_recurring ? 1 : 0,
    recurring_type: editRecurring.is_recurring ? editRecurring.recurring_type : null,
  });
};
```

### 2. **SavingsPage Component**
**File**: `frontend/src/pages/SavingsPage.tsx`

#### Updates:
- Added `updateInvestment` to the destructured hooks
- Pass `onUpdate={updateInvestment}` to `SavingsInvestmentTable`
- Pass `loading` state to the table for proper button disable states

```tsx
const { 
  investments, 
  comparison, 
  loading, 
  error, 
  addInvestment, 
  updateInvestment,  // NEW
  deleteInvestment 
} = useSavings();

<SavingsInvestmentTable 
  investments={investments} 
  onDelete={deleteInvestment}
  onUpdate={updateInvestment}  // NEW
  loading={loading}
/>
```

### 3. **useSavings Hook**
**File**: `frontend/src/hooks/useSavings.ts`

#### Updated Method:
- Modified `updateInvestment` to handle partial updates
- Merges existing investment data with update data
- Properly handles the API response
- Refreshes comparison data after update

```typescript
const updateInvestment = async (
  id: number, 
  investment: Partial<SavingsInvestment>
) => {
  // Get existing investment to merge
  const existing = investments.find(i => i.id === id);
  const mergedInvestment = { ...existing, ...investment };
  
  // Send merged data to API
  const response = await savingsApi.update(id, mergedInvestment);
  
  // Update state and refresh comparison
  setInvestments(investments.map(i => 
    i.id === id ? response.data : i
  ));
  const comparisonRes = await savingsApi.getComparison();
  setComparison(comparisonRes.data);
};
```

## User Experience Flow

### Viewing Recurring Status:
1. Open Savings & Investments page
2. Scroll to the "Recurring" column in the investments table
3. See badges showing:
   - `None` - Not recurring
   - `Monthly` - Monthly auto-entry
   - `Yearly` - Yearly auto-entry

### Editing Recurring Settings:
1. Click on any recurring status badge
2. Edit mode activates with:
   - Toggle checkbox for "Recurring"
   - Dropdown to select frequency (Monthly/Yearly)
3. Click "Save" to apply changes
4. Click "Cancel" to discard changes

### Disabling Auto-Entry:
1. Click the recurring status badge
2. Uncheck the "Recurring" checkbox
3. Click "Save"
4. Investment will no longer auto-add amounts

## Backend Integration

### No Backend Changes Required
- Existing CRUD endpoints handle the updates
- Uses `is_recurring` (boolean/integer), `recurring_type` (string) fields
- Auto-increment process on startup respects these settings:
  - If `is_recurring = 0` or `false`, investment won't be processed
  - If `is_recurring = 1` or `true` and `recurring_type` is set, it processes based on schedule

## Data Model (No Changes)
```typescript
interface SavingsInvestment {
  id: number;
  name: string;
  investment_type: string;
  purchase_date: string;
  initial_amount: number;
  current_value: number;
  description?: string;
  is_recurring: boolean;        // Already exists
  recurring_type?: 'monthly' | 'yearly' | null;  // Already exists
  recurring_amount?: number | null;               // Already exists
  last_recurring_date?: string | null;            // Already exists
  created_at: string;
  updated_at: string;
}
```

## Benefits

✅ **Visual Clarity**: Instantly see which investments have auto-entry enabled
✅ **Easy Control**: Click to edit recurring settings directly from the table
✅ **Prevents Unwanted Transactions**: Can disable auto-entry anytime
✅ **Non-Breaking**: No API changes, uses existing backend functionality
✅ **Responsive**: Works on desktop and mobile
✅ **Color-Coded**: Quick visual identification of recurring status
