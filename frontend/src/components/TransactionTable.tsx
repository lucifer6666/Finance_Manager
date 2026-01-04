import { Transaction, CreditCard } from '../types';

interface TransactionTableProps {
  transactions: Transaction[];
  cards?: CreditCard[];
  onDelete?: (id: number) => Promise<void>;
  loading?: boolean;
}

export const TransactionTable = ({ transactions, cards = [], onDelete, loading = false }: TransactionTableProps) => {
  const cardMap = new Map(cards.map(card => [card.id, card]));

  const getCardName = (cardId?: number) => {
    if (!cardId) return '-';
    const card = cardMap.get(cardId);
    return card ? card.name : '-';
  };

  const handleDelete = async (id: number) => {
    if (globalThis.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await onDelete?.(id);
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-black">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-black">Date</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-black">Description</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-black">Category</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-black">Type</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-black">Card</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-black">Amount</th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-black">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.id} className="border-b hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-black">{new Date(transaction.date).toLocaleDateString()}</td>
              <td className="px-6 py-4 text-sm text-black">{transaction.description || '-'}</td>
              <td className="px-6 py-4 text-sm text-black">{transaction.category}</td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {transaction.type.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-black">
                {transaction.payment_method === 'card' ? (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                    {getCardName(transaction.credit_card_id)}
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td className={`px-6 py-4 text-sm font-semibold text-right ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => handleDelete(transaction.id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
