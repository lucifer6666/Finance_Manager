import { useState } from 'react';
import { useTransactions, useCreditCards } from '../hooks';
import { AddTransactionForm, TransactionTable } from '../components';

export const TransactionsPage = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const { transactions, addTransaction, deleteTransaction } = useTransactions(year, month);
  const { cards } = useCreditCards();

  const handleAddTransaction = async (transaction: any): Promise<void> => {
    await addTransaction(transaction);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-4 text-black">Transactions</h1>
      </div>

      {/* Month and Year Filter */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-4">
          <div>
            <label htmlFor="filterMonth" className="block text-sm font-semibold text-black mb-1">Month</label>
            <select
              id="filterMonth"
              value={month}
              onChange={(e) => setMonth(Number.parseInt(e.target.value))}
              className="px-3 py-2 border rounded-md bg-white text-black"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>
                  {new Date(2024, m - 1).toLocaleDateString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filterYear" className="block text-sm font-semibold text-black mb-1">Year</label>
            <select
              id="filterYear"
              value={year}
              onChange={(e) => setYear(Number.parseInt(e.target.value))}
              className="px-3 py-2 border rounded-md bg-white text-black"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <span className="text-sm text-gray-600">
              Showing {transactions.length} transaction{transactions.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      <AddTransactionForm cards={cards} onAdd={handleAddTransaction} />

      <TransactionTable transactions={transactions} cards={cards} onDelete={deleteTransaction} />
    </div>
  );
};
