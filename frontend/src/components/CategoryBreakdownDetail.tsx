import { useState } from 'react';

interface DescriptionBreakdown {
  description: string;
  count: number;
  amount: number;
}

interface PaymentMethodBreakdown {
  method: string;
  count: number;
  amount: number;
}

interface CardTransaction {
  cardName: string;
  count: number;
  amount: number;
}

interface CategoryBreakdownDetailProps {
  categoryName: string;
  descriptions: DescriptionBreakdown[];
  paymentMethods: PaymentMethodBreakdown[];
  cardTransactions?: CardTransaction[];
  onClose?: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('₹', '₹');
};

const formatPaymentMethod = (method: string) => {
  const methods: { [key: string]: string } = {
    'upi': 'UPI',
    'cash': 'Cash',
    'card': 'Card',
    'bank': 'Bank Transfer',
    'cheque': 'Cheque',
  };
  return methods[method] || method;
};

export const CategoryBreakdownDetail = ({
  categoryName,
  descriptions,
  paymentMethods,
  cardTransactions = [],
  onClose,
}: CategoryBreakdownDetailProps) => {
  const [expandDescriptions, setExpandDescriptions] = useState(true);
  const [expandPayments, setExpandPayments] = useState(true);
  const [expandCards, setExpandCards] = useState(true);

  const totalAmount = descriptions.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-400">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">
          📊 {categoryName} - Detailed Breakdown
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-semibold transition"
          >
            ✕ Close
          </button>
        )}
      </div>

      {/* Total Amount */}
      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
        <p className="text-sm text-gray-600">Total Amount</p>
        <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalAmount)}</p>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Description Breakdown */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <button
            onClick={() => setExpandDescriptions(!expandDescriptions)}
            className="w-full text-left mb-4 flex justify-between items-center p-3 bg-indigo-100 hover:bg-indigo-200 rounded transition"
          >
            <h3 className="font-bold text-black">📝 Description Breakdown</h3>
            <span className="text-xl">{expandDescriptions ? '▽' : '▷'}</span>
          </button>

          {expandDescriptions && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {descriptions.length > 0 ? (
                descriptions.map((desc) => (
                  <div
                    key={`desc-${desc.description}`}
                    className="p-3 bg-white border border-gray-200 rounded hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-md font-semibold text-black" title={desc.description}>
                        {desc.description || 'No description'}
                      </p>
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                        {desc.count}x
                      </span>
                    </div>
                    <p className="text-lg font-bold text-indigo-600 mt-1">
                      {formatCurrency(desc.amount)}
                    </p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full"
                        style={{ width: `${(desc.amount / totalAmount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No descriptions found</p>
              )}
            </div>
          )}
        </div>

        {/* Column 2: Payment Method Breakdown */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <button
            onClick={() => setExpandPayments(!expandPayments)}
            className="w-full text-left mb-4 flex justify-between items-center p-3 bg-green-100 hover:bg-green-200 rounded transition"
          >
            <h3 className="font-bold text-black">💳 Payment Methods</h3>
            <span className="text-xl">{expandPayments ? '▽' : '▷'}</span>
          </button>

          {expandPayments && (
            <div className="space-y-2">
              {paymentMethods.length > 0 ? (
                paymentMethods.map((method) => (
                  <div
                    key={`method-${method.method}`}
                    className="p-3 bg-white border border-gray-200 rounded hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold text-black">
                        {formatPaymentMethod(method.method)}
                      </p>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {method.count}x
                      </span>
                    </div>
                    <p className="text-lg font-bold text-green-600 mt-1">
                      {formatCurrency(method.amount)}
                    </p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{ width: `${(method.amount / totalAmount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No payment methods found</p>
              )}
            </div>
          )}
        </div>

        {/* Column 3: Card Transactions (if applicable) */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <button
            onClick={() => setExpandCards(!expandCards)}
            className="w-full text-left mb-4 flex justify-between items-center p-3 bg-purple-100 hover:bg-purple-200 rounded transition"
            disabled={cardTransactions.length === 0}
          >
            <h3 className="font-bold text-black">🏦 Card Transactions</h3>
            <span className="text-xl">{expandCards ? '▽' : '▷'}</span>
          </button>

          {cardTransactions.length > 0 && expandCards && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {cardTransactions.map((card) => (
                <div
                  key={`card-${card.cardName}`}
                  className="p-3 bg-white border border-gray-200 rounded hover:shadow-md transition"
                >
                  <p className="text-sm font-semibold text-black">{card.cardName}</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
                    <span>{card.count} transaction{card.count > 1 ? 's' : ''}</span>
                    <span className="font-bold text-purple-600">{formatCurrency(card.amount)}</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-purple-500 h-1.5 rounded-full"
                      style={{ width: `${(card.amount / totalAmount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {cardTransactions.length === 0 && (
            <p className="text-gray-500 text-sm p-3 text-center">No card transactions for this category</p>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">Total Transactions</p>
            <p className="text-2xl font-bold text-black">
              {descriptions.reduce((sum, d) => sum + d.count, 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">Avg Per Transaction</p>
            <p className="text-2xl font-bold text-black">
              {formatCurrency(totalAmount / Math.max(descriptions.reduce((sum, d) => sum + d.count, 0), 1))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">Payment Methods Count</p>
            <p className="text-2xl font-bold text-black">{paymentMethods.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">Cards Used</p>
            <p className="text-2xl font-bold text-black">{cardTransactions.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
