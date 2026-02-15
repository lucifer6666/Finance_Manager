import { useState } from 'react';

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

interface PaymentMethodsBreakdownProps {
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

export const PaymentMethodsBreakdown = ({
  paymentMethods,
  cardTransactions = [],
  onClose,
}: PaymentMethodsBreakdownProps) => {
  const [expandPayments, setExpandPayments] = useState(true);
  const [expandCards, setExpandCards] = useState(true);

  const totalAmount = paymentMethods.reduce((sum, p) => sum + p.amount, 0);
  const totalCardAmount = cardTransactions.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-2 border-purple-400">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">
          💳 Payment Methods & Card Transactions - Breakdown
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
      <div className="mb-6 p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
        <p className="text-sm text-gray-600">Total Amount</p>
        <p className="text-3xl font-bold text-purple-600">{formatCurrency(totalAmount)}</p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Payment Methods */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <button
            onClick={() => setExpandPayments(!expandPayments)}
            className="w-full text-left mb-4 flex justify-between items-center p-3 bg-purple-100 hover:bg-purple-200 rounded transition"
          >
            <h3 className="font-bold text-black">💰 Payment Methods</h3>
            <span className="text-xl">{expandPayments ? '▽' : '▷'}</span>
          </button>

          {expandPayments && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {paymentMethods.length > 0 ? (
                paymentMethods.map((pm) => (
                  <div
                    key={pm.method}
                    className="flex justify-between items-center p-3 bg-white rounded border border-gray-200 hover:border-purple-300 transition"
                  >
                    <div>
                        <p className="font-semibold text-black">{formatPaymentMethod(pm.method)}</p>
                      <p className="text-xs text-gray-500">{pm.count} transaction{pm.count !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-purple-600">{formatCurrency(pm.amount)}</p>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {pm.count > 0 ? ((pm.amount / totalAmount * 100).toFixed(1)) : 0}%
                        </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No payment method data</p>
              )}
            </div>
          )}
        </div>

        {/* Column 2: Card Transactions */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <button
            onClick={() => setExpandCards(!expandCards)}
            className="w-full text-left mb-4 flex justify-between items-center p-3 bg-blue-100 hover:bg-blue-200 rounded transition"
          >
            <h3 className="font-bold text-black">🏦 Card Transactions</h3>
            <span className="text-xl">{expandCards ? '▽' : '▷'}</span>
          </button>

          {expandCards && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {cardTransactions.length > 0 ? (
                cardTransactions.map((card) => (
                  <div
                    key={card.cardName}
                    className="flex justify-between items-center p-3 bg-white rounded border border-gray-200 hover:border-blue-300 transition"
                  >
                    <div>
                      <p className="font-semibold text-black">{card.cardName}</p>
                      <p className="text-xs text-gray-500">{card.count} transaction{card.count !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-blue-600">{formatCurrency(card.amount)}</p>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {card.count > 0 ? ((card.amount / totalCardAmount * 100).toFixed(1)) : 0}%
                        </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No card transaction data</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {cardTransactions.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div>
            <p className="text-sm text-gray-600">Total Card Spending</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalCardAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Card vs Total Spending</p>
            <p className="text-2xl font-bold text-blue-600">
              {totalAmount > 0 ? ((totalCardAmount / totalAmount) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
