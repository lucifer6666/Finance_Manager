import { useState } from 'react';
import { useTransactions, useCreditCards } from '../hooks';
import { AddTransactionForm, TransactionTable } from '../components';

export const TransactionsPage = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const { transactions, addTransaction, deleteTransaction } = useTransactions(year, month);
  const { cards } = useCreditCards();

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handleAddTransaction = async (transaction: any): Promise<void> => {
    await addTransaction(transaction);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-4 text-black">Transactions</h1>
        
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md mb-6">
          <button
            onClick={handlePrevMonth}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            ← Previous
          </button>
          
          <h2 className="text-2xl font-semibold text-black">{monthName}</h2>
          
          <button
            onClick={handleNextMonth}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Next →
          </button>
        </div>
      </div>

      <AddTransactionForm cards={cards} onAdd={handleAddTransaction} />

      <TransactionTable transactions={transactions} cards={cards} onDelete={deleteTransaction} />
    </div>
  );
};
