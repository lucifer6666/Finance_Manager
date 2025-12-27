import { CreditCard } from '../types';

interface CreditCardSummaryProps {
  cards: CreditCard[];
  utilization?: Record<number, { utilization_percent: number; amount_spent: number }>;
}

export const CreditCardSummary = ({ cards, utilization = {} }: CreditCardSummaryProps) => {
  if (cards.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-black">No credit cards</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cards.map(card => {
        const util = utilization[card.id] || { utilization_percent: 0, amount_spent: 0 };
        const utilizationPercent = util.utilization_percent || 0;
        
        return (
          <div key={card.id} className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{card.name}</h3>
                <p className="text-sm opacity-90">{card.bank_name}</p>
              </div>
              <span className="text-3xl font-bold">💳</span>
            </div>

            <div className="mb-4">
              <p className="text-sm opacity-90 mb-1">Limit</p>
              <p className="text-2xl font-bold">₹{card.credit_limit.toLocaleString()}</p>
            </div>

            {utilizationPercent > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Spent: ₹{util.amount_spent.toFixed(2)}</span>
                  <span>{utilizationPercent.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      utilizationPercent > 70 ? 'bg-red-400' : 'bg-green-400'
                    }`}
                    style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between text-xs opacity-75">
              <span>Cycle: {card.billing_cycle_start}-{card.billing_cycle_end}</span>
              <span>Due: {card.due_date}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
