# Credit Card Bill Payment Tracking Feature

## Overview
This document describes the new credit card bill payment tracking feature added to the Finance Manager application. This feature allows users to track payments made against their credit cards and view which card a transaction is associated with.

## Features Added

### 1. Backend Changes

#### Database Models (`models.py`)
- **CreditCardPayment Model**: New table to store credit card bill payments
  - `id`: Primary key
  - `credit_card_id`: Foreign key reference to credit card
  - `payment_date`: Date of the payment
  - `amount`: Payment amount
  - `payment_method`: Method used (cash, upi, bank, cheque)
  - `transaction_id`: Optional reference to a transaction record
  - `description`: Optional notes about the payment
  - `created_at`: Timestamp

- **Transaction Model Updates**:
  - Added `is_payment` field to flag transactions as credit card payments
  - Added relationship to `CreditCardPayment`

- **CreditCard Model Updates**:
  - Added relationship to multiple `CreditCardPayment` records

#### Schemas (`schemas.py`)
- **CreditCardPaymentBase**: Base schema for payment data
- **CreditCardPaymentCreate**: Schema for creating new payments
- **CreditCardPayment**: Full schema with ID and timestamp
- **Transaction Schema Update**: Added `is_payment` boolean field
- **CreditCard Schema Update**: Added `payments` relationship

#### CRUD Operations (`crud.py`)
New functions for credit card payment management:
- `create_credit_card_payment()`: Create a new payment record
- `get_credit_card_payment()`: Retrieve a payment by ID
- `get_all_credit_card_payments()`: Get all payments with pagination
- `get_payments_by_card()`: Get payments for a specific card
- `get_payments_by_date_range()`: Get payments within a date range
- `update_credit_card_payment()`: Update a payment record
- `delete_credit_card_payment()`: Delete a payment record

#### API Routes (`routers/payments.py`)
New router with the following endpoints:
- `POST /api/payments/` - Create a new payment
- `GET /api/payments/` - Get all payments
- `GET /api/payments/card/{card_id}` - Get payments for a specific card
- `GET /api/payments/range/` - Get payments within a date range
- `GET /api/payments/{payment_id}` - Get a specific payment
- `PUT /api/payments/{payment_id}` - Update a payment
- `DELETE /api/payments/{payment_id}` - Delete a payment

### 2. Frontend Changes

#### Types (`types/index.ts`)
- **CreditCardPayment Interface**: Type definition for payment records
  - `id`: number
  - `credit_card_id`: number
  - `payment_date`: string
  - `amount`: number
  - `payment_method`: 'cash' | 'upi' | 'bank' | 'cheque'
  - `transaction_id?`: number
  - `description?`: string
  - `created_at`: string

- **Transaction Interface Update**: Added `is_payment` optional field
- **CreditCard Interface Update**: Added `payments` optional field

#### Hooks (`hooks/usePayments.ts`)
New custom hook for payment management:
```typescript
const {
  payments,           // Current payments array
  loading,            // Loading state
  error,              // Error message
  fetchPayments,      // Fetch all payments
  fetchPaymentsByCard,// Fetch payments for a card
  addPayment,         // Create new payment
  deletePayment,      // Delete a payment
  updatePayment       // Update a payment
} = usePayments();
```

#### Components

**AddPaymentForm.tsx**
- Form to add new credit card bill payments
- Fields:
  - Credit card selection (dropdown)
  - Payment date
  - Amount
  - Payment method (bank, UPI, cash, cheque)
  - Description
- Handles form submission and resets after successful addition

**Updated AddTransactionForm.tsx**
- Added credit card selection when payment method is "Card"
- Added "Mark as Card Payment" checkbox to flag transactions as payments
- Shows card selection dropdown only when "Card" payment method is selected
- Passes `cards` prop with list of available credit cards

**Updated TransactionTable.tsx**
- Added new "Card" column showing which card the payment was made from
- Displays card name in a blue badge when payment method is "card"
- Enhanced with `cards` prop for mapping card IDs to names
- Helper function `getCardName()` to safely retrieve card information

## Usage

### Adding a Credit Card Payment
1. Navigate to the Credit Cards page or relevant section
2. Use the AddPaymentForm component to record a payment
3. Select the credit card being paid
4. Enter payment date, amount, and payment method
5. Optionally add a description

### Viewing Transactions with Card Information
1. View the transactions list
2. The "Card" column shows which card was used for card payments
3. Non-card transactions show "-" in the card column

### Recording Card Payments as Transactions
1. Add a transaction using AddTransactionForm
2. Select "Card" as the payment method
3. Select the credit card
4. Check "Mark as Card Payment" if it's a bill payment (optional)
5. The transaction will be recorded and linked to the payment

## Database Migration Notes
- New table: `credit_card_payments`
- New column in `transactions`: `is_payment` (default: 0)
- New relationship columns added appropriately

## API Integration
The frontend automatically includes the new payment endpoints through the `usePayments` hook, which handles:
- API communication via the `apiClient`
- Loading and error state management
- Data synchronization with the backend

## Benefits
1. **Payment Tracking**: Keep detailed records of all credit card bill payments
2. **Card Association**: See which card each payment was made from
3. **Payment History**: View payment dates, amounts, and methods
4. **Flexible Recording**: Option to record payments as separate records or within transactions
5. **Complete Financial Picture**: Better tracking of cash flow and credit card management
