import { useState } from 'react';
import { CreditCard, Transaction } from '../types';

interface CardTransactionsByCycleProps {
  cards: CreditCard[];
  transactions: Transaction[];
  filterMonth?: number;
  filterYear?: number;
}

interface CardCycleData {
  card: CreditCard;
  cycleTransactions: Transaction[];
  totalAmount: number;
  cycleStart: Date;
  cycleEnd: Date;
}

export const CardTransactionsByCycle = ({
  cards,
  transactions,
  filterMonth,
  filterYear,
}: CardTransactionsByCycleProps) => {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set(cards.map(c => c.id)));

  const toggleCardExpanded = (cardId: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };
  const getCurrentBillingCycle = (card: CreditCard): { startDate: Date; endDate: Date } => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-indexed month
    const currentDay = today.getDate();
    
    // Calculate billing cycle start date (same logic as backend)
    let cycleStartMonth = currentMonth;
    let cycleStartYear = currentYear;
    
    if (currentDay < card.billing_cycle_start) {
      cycleStartMonth -= 1;
      if (cycleStartMonth < 1) {
        cycleStartMonth = 12;
        cycleStartYear -= 1;
      }
    }
    
    const cycleStart = new Date(cycleStartYear, cycleStartMonth - 1, card.billing_cycle_start);
    
    // Calculate billing cycle end date
    let cycleEndMonth = currentMonth;
    let cycleEndYear = currentYear;
    
    if (card.billing_cycle_end < card.billing_cycle_start) {
      // Cycle spans two months
      if (currentDay >= card.billing_cycle_start) {
        cycleEndMonth += 1;
        if (cycleEndMonth > 12) {
          cycleEndMonth = 1;
          cycleEndYear += 1;
        }
      }
    }
    
    const cycleEnd = new Date(cycleEndYear, cycleEndMonth - 1, card.billing_cycle_end);

    return { startDate: cycleStart, endDate: cycleEnd };
  };

  const getPreviousBillingCycle = (card: CreditCard): { startDate: Date; endDate: Date } => {
    const { startDate } = getCurrentBillingCycle(card);
    
    // Go back one month to get previous cycle
    let prevMonth = startDate.getMonth();
    let prevYear = startDate.getFullYear();
    
    prevMonth -= 1;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear -= 1;
    }
    
    const prevCycleStart = new Date(prevYear, prevMonth, card.billing_cycle_start);
    
    // Calculate previous cycle end
    let prevCycleEndMonth = prevMonth;
    let prevCycleEndYear = prevYear;
    
    if (card.billing_cycle_end < card.billing_cycle_start) {
      prevCycleEndMonth += 1;
      if (prevCycleEndMonth > 11) {
        prevCycleEndMonth = 0;
        prevCycleEndYear += 1;
      }
    }
    
    const prevCycleEnd = new Date(prevCycleEndYear, prevCycleEndMonth, card.billing_cycle_end);
    
    return { startDate: prevCycleStart, endDate: prevCycleEnd };
  };

  const getFilteredCyclePeriod = (card: CreditCard): { startDate: Date; endDate: Date } => {
    if (!filterMonth || !filterYear) {
      return getCurrentBillingCycle(card);
    }

    // Calculate billing cycle for the filtered month based on card's cycle configuration
    // Always start from previous month's cycle start day
    let cycleStartMonth = filterMonth - 1;
    let cycleStartYear = filterYear;
    
    if (cycleStartMonth < 1) {
      cycleStartMonth = 12;
      cycleStartYear -= 1;
    }
    
    const cycleStart = new Date(cycleStartYear, cycleStartMonth - 1, card.billing_cycle_start);
    
    // Calculate cycle end date
    let cycleEndMonth = filterMonth;
    let cycleEndYear = filterYear;
    
    // If billing cycle end comes before start (spans to next month)
    if (card.billing_cycle_end < card.billing_cycle_start) {
      cycleEndMonth = filterMonth + 1;
      if (cycleEndMonth > 12) {
        cycleEndMonth = 1;
        cycleEndYear += 1;
      }
    }
    
    const cycleEnd = new Date(cycleEndYear, cycleEndMonth - 1, card.billing_cycle_end);

    return { startDate: cycleStart, endDate: cycleEnd };
  };

  const getCardCycleData = (): CardCycleData[] => {
    return cards.map(card => {
      let { startDate, endDate } = filterMonth && filterYear 
        ? getFilteredCyclePeriod(card) 
        : getCurrentBillingCycle(card);
      
      // Filter transactions for this card within the billing cycle
      let cycleTransactions = transactions.filter(txn => {
        if (txn.credit_card_id !== card.id) return false;
        if (txn.type !== 'expense') return false; // Only show expenses
        
        const txnDate = new Date(txn.date);
        const withinCycle = txnDate >= startDate && txnDate <= endDate;
        return withinCycle;
      });

      // If no transactions in current cycle, try previous cycle
      if (cycleTransactions.length === 0) {
        const { startDate: prevStart, endDate: prevEnd } = getPreviousBillingCycle(card);
        cycleTransactions = transactions.filter(txn => {
          if (txn.credit_card_id !== card.id) return false;
          if (txn.type !== 'expense') return false;
          
          const txnDate = new Date(txn.date);
          const withinCycle = txnDate >= prevStart && txnDate <= prevEnd;
          return withinCycle;
        });
        
        if (cycleTransactions.length > 0) {
          startDate = prevStart;
          endDate = prevEnd;
        }
      }

      const totalAmount = cycleTransactions.reduce((sum, txn) => sum + txn.amount, 0);

      return {
        card,
        cycleTransactions,
        totalAmount,
        cycleStart: startDate,
        cycleEnd: endDate,
      };
    });
  };

  const cardCycleData = getCardCycleData();
  const cardsWithTransactions = cardCycleData.filter(data => data.cycleTransactions.length > 0);

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Transactions by Card Cycle</h2>
      
      {cardsWithTransactions.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">No card transactions in current billing cycle</p>
        </div>
      ) : (
        cardsWithTransactions.map(({ card, cycleTransactions, totalAmount, cycleStart, cycleEnd }) => {
          const isExpanded = expandedCards.has(card.id);
          
          return (
            <div key={card.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => toggleCardExpanded(card.id)}
                className="w-full text-left bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-l-4 border-blue-500 hover:from-blue-100 hover:to-blue-150 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-lg text-blue-600 font-semibold mt-1">
                      {isExpanded ? '▽' : '▷'}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-black">{card.name}</h3>
                      <p className="text-sm text-gray-600">{card.bank_name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Cycle: {cycleStart.toLocaleDateString()} - {cycleEnd.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-blue-600">₹{totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {cycleTransactions.length} transaction{cycleTransactions.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-black">Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-black">Category</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-black">Description</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-black">Payment Method</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-black">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cycleTransactions.map(txn => (
                        <tr key={txn.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3 text-sm text-black">
                            {new Date(txn.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-3 text-sm text-black">
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                              {txn.category}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-700">
                            {txn.description || '-'}
                          </td>
                          <td className="px-6 py-3 text-sm">
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                              {txn.payment_method.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm font-semibold text-right text-red-600">
                            ₹{txn.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
