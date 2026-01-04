# Credit Card Payment Tracking - Usage Examples

## Backend API Examples

### 1. Create a Credit Card Payment

**Request:**
```bash
POST /api/payments/
Content-Type: application/json

{
  "credit_card_id": 1,
  "payment_date": "2024-01-04",
  "amount": 5000.00,
  "payment_method": "bank",
  "description": "Monthly bill payment to HDFC",
  "transaction_id": null
}
```

**Response:**
```json
{
  "id": 1,
  "credit_card_id": 1,
  "payment_date": "2024-01-04",
  "amount": 5000.00,
  "payment_method": "bank",
  "transaction_id": null,
  "description": "Monthly bill payment to HDFC",
  "created_at": "2024-01-04T10:30:00"
}
```

### 2. Get All Payments with Pagination

**Request:**
```bash
GET /api/payments/?skip=0&limit=10
```

**Response:**
```json
[
  {
    "id": 1,
    "credit_card_id": 1,
    "payment_date": "2024-01-04",
    "amount": 5000.00,
    "payment_method": "bank",
    "transaction_id": null,
    "description": "Monthly bill payment",
    "created_at": "2024-01-04T10:30:00"
  },
  {
    "id": 2,
    "credit_card_id": 2,
    "payment_date": "2024-01-03",
    "amount": 3500.00,
    "payment_method": "upi",
    "transaction_id": 15,
    "description": "ICICI card payment via UPI",
    "created_at": "2024-01-03T14:15:00"
  }
]
```

### 3. Get Payments for a Specific Card

**Request:**
```bash
GET /api/payments/card/1?skip=0&limit=10
```

**Response:**
```json
[
  {
    "id": 1,
    "credit_card_id": 1,
    "payment_date": "2024-01-04",
    "amount": 5000.00,
    "payment_method": "bank",
    "transaction_id": null,
    "description": "Monthly bill payment",
    "created_at": "2024-01-04T10:30:00"
  }
]
```

### 4. Get Payments Within Date Range

**Request:**
```bash
GET /api/payments/range/?start_date=2024-01-01&end_date=2024-01-31
```

**Response:**
```json
[
  {
    "id": 1,
    "credit_card_id": 1,
    "payment_date": "2024-01-04",
    "amount": 5000.00,
    "payment_method": "bank",
    "transaction_id": null,
    "description": "Monthly bill payment",
    "created_at": "2024-01-04T10:30:00"
  },
  {
    "id": 2,
    "credit_card_id": 2,
    "payment_date": "2024-01-03",
    "amount": 3500.00,
    "payment_method": "upi",
    "transaction_id": 15,
    "description": "ICICI card payment via UPI",
    "created_at": "2024-01-03T14:15:00"
  }
]
```

### 5. Update a Payment

**Request:**
```bash
PUT /api/payments/1
Content-Type: application/json

{
  "credit_card_id": 1,
  "payment_date": "2024-01-04",
  "amount": 5500.00,
  "payment_method": "bank",
  "description": "Updated: Bill payment - HDFC"
}
```

**Response:**
```json
{
  "id": 1,
  "credit_card_id": 1,
  "payment_date": "2024-01-04",
  "amount": 5500.00,
  "payment_method": "bank",
  "transaction_id": null,
  "description": "Updated: Bill payment - HDFC",
  "created_at": "2024-01-04T10:30:00"
}
```

### 6. Delete a Payment

**Request:**
```bash
DELETE /api/payments/1
```

**Response:**
```json
{
  "message": "Payment deleted successfully"
}
```

## Frontend React Examples

### 1. Using AddPaymentForm Component

```typescript
import { useState } from 'react';
import { AddPaymentForm } from './components';
import { useCreditCards, usePayments } from './hooks';

export const PaymentPage = () => {
  const { cards, loading: cardsLoading } = useCreditCards();
  const { addPayment, loading } = usePayments();

  const handleAddPayment = async (paymentData) => {
    try {
      await addPayment(paymentData);
      // Payment added successfully
    } catch (error) {
      console.error('Failed to add payment:', error);
    }
  };

  return (
    <div>
      <AddPaymentForm 
        cards={cards}
        onAdd={handleAddPayment}
        loading={loading}
      />
    </div>
  );
};
```

### 2. Using AddTransactionForm with Card Payment

```typescript
import { useState } from 'react';
import { AddTransactionForm } from './components';
import { useTransactions, useCreditCards } from './hooks';

export const TransactionPage = () => {
  const { cards } = useCreditCards();
  const { addTransaction } = useTransactions();

  const handleAddTransaction = async (transactionData) => {
    try {
      await addTransaction({
        ...transactionData,
        // If marked as card payment and card selected, it will be tracked
      });
    } catch (error) {
      console.error('Failed to add transaction:', error);
    }
  };

  return (
    <div>
      <AddTransactionForm
        cards={cards}
        onAdd={handleAddTransaction}
      />
    </div>
  );
};
```

### 3. Using TransactionTable with Card Display

```typescript
import { TransactionTable } from './components';
import { useTransactions, useCreditCards } from './hooks';

export const TransactionsView = () => {
  const { transactions } = useTransactions();
  const { cards } = useCreditCards();

  const handleDeleteTransaction = async (id) => {
    // Handle deletion
  };

  return (
    <TransactionTable
      transactions={transactions}
      cards={cards}
      onDelete={handleDeleteTransaction}
    />
  );
};
```

### 4. Using usePayments Hook Directly

```typescript
import { usePayments } from './hooks';
import { useEffect } from 'react';

export const PaymentHistory = ({ cardId }) => {
  const {
    payments,
    loading,
    error,
    fetchPaymentsByCard,
    deletePayment
  } = usePayments();

  useEffect(() => {
    fetchPaymentsByCard(cardId);
  }, [cardId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Payment History for Card {cardId}</h2>
      {payments.map(payment => (
        <div key={payment.id} className="payment-card">
          <p>Date: {payment.payment_date}</p>
          <p>Amount: ₹{payment.amount.toFixed(2)}</p>
          <p>Method: {payment.payment_method}</p>
          <p>Description: {payment.description || 'N/A'}</p>
          <button onClick={() => deletePayment(payment.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
```

### 5. Complete Page Example

```typescript
import { useState, useEffect } from 'react';
import {
  AddPaymentForm,
  AddTransactionForm,
  TransactionTable,
} from './components';
import { useCreditCards, usePayments, useTransactions } from './hooks';

export const CreditCardManagement = () => {
  const { cards, loading: cardsLoading } = useCreditCards();
  const { payments, addPayment, deletePayment } = usePayments();
  const { transactions, addTransaction, deleteTransaction } = useTransactions();

  const handleAddPayment = async (paymentData) => {
    try {
      await addPayment(paymentData);
      alert('Payment recorded successfully!');
    } catch (error) {
      alert('Failed to record payment');
    }
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      await addTransaction(transactionData);
      alert('Transaction added successfully!');
    } catch (error) {
      alert('Failed to add transaction');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column */}
        <div>
          <h2 className="text-3xl font-bold mb-4">Add Payment</h2>
          <AddPaymentForm 
            cards={cards}
            onAdd={handleAddPayment}
            loading={cardsLoading}
          />

          <h2 className="text-3xl font-bold mt-8 mb-4">Add Transaction</h2>
          <AddTransactionForm
            cards={cards}
            onAdd={handleAddTransaction}
          />
        </div>

        {/* Right Column */}
        <div>
          <h2 className="text-3xl font-bold mb-4">Recent Transactions</h2>
          <TransactionTable
            transactions={transactions.slice(0, 20)}
            cards={cards}
            onDelete={deleteTransaction}
          />
        </div>
      </div>

      {/* Payment History Section */}
      <div className="mt-8">
        <h2 className="text-3xl font-bold mb-4">Payment History</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {payments.map(payment => (
            <div key={payment.id} className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-600">
                {new Date(payment.payment_date).toLocaleDateString()}
              </div>
              <div className="text-2xl font-bold text-green-600">
                ₹{payment.amount.toFixed(2)}
              </div>
              <div className="text-sm text-gray-700 mt-2">
                {payment.payment_method.toUpperCase()}
              </div>
              {payment.description && (
                <div className="text-xs text-gray-600 mt-2">
                  {payment.description}
                </div>
              )}
              <button
                onClick={() => deletePayment(payment.id)}
                className="mt-4 w-full bg-red-500 text-white py-1 px-2 rounded text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

## Key Points

1. **Payment Methods**: Support for bank transfer, UPI, cash, and cheque
2. **Optional Description**: Add notes about each payment for reference
3. **Date Tracking**: All payments tracked with creation and payment dates
4. **Card Association**: Every payment linked to a specific credit card
5. **Transaction Linking**: Optionally link payments to transaction records for unified tracking
6. **Flexible Query**: Query by card, date range, or get all payments
7. **Full Audit Trail**: Timestamps on all records for accountability
