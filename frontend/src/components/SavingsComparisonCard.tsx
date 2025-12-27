import { SavingsComparison } from '../types';

interface SavingsComparisonCardProps {
  comparison: SavingsComparison;
}

export const SavingsComparisonCard = ({ comparison }: SavingsComparisonCardProps) => {
  const isAccountAhead = comparison.cash_savings >= 0;
  const profitLossPositive = comparison.investment_profit_loss >= 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold text-black mb-6">Account & Investment Comparison</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Account Balance */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <h4 className="text-lg font-bold text-black mb-4">Account Balance</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-black font-semibold">Current Balance:</span>
              <span className={`text-xl font-bold ${comparison.account_balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {comparison.account_balance >= 0 ? '+' : ''}₹{comparison.account_balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Investments Summary */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <h4 className="text-lg font-bold text-black mb-4">Investments Summary</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-black font-semibold">Total Invested:</span>
              <span className="text-xl font-bold text-black">₹{comparison.total_invested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black font-semibold">Current Value:</span>
              <span className="text-xl font-bold text-black">₹{comparison.total_current_investment_value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-black font-bold">Profit/Loss:</span>
              <span className={`text-xl font-bold ${profitLossPositive ? 'text-green-700' : 'text-red-700'}`}>
                {profitLossPositive ? '+' : ''}₹{comparison.investment_profit_loss.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Savings */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 mb-6">
        <h4 className="text-lg font-semibold text-black mb-4">Cash Savings (Liquid)</h4>
        <div className="flex justify-between items-center">
          <span className="text-black font-semibold">Account Balance - Total Invested:</span>
          <span className={`text-3xl font-bold ${isAccountAhead ? 'text-green-600' : 'text-red-600'}`}>
            {isAccountAhead ? '+' : ''}₹{comparison.cash_savings.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Status Message */}
      <div className={`p-4 rounded-lg ${isAccountAhead ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
        <p className={`text-center font-semibold ${isAccountAhead ? 'text-green-800' : 'text-orange-800'}`}>
          {isAccountAhead 
            ? `✅ You have ₹${Math.abs(comparison.cash_savings).toLocaleString('en-IN', { maximumFractionDigits: 2 })} in liquid savings after investments.`
            : `⚠️ Your investments (₹${Math.abs(comparison.cash_savings).toLocaleString('en-IN', { maximumFractionDigits: 2 })}) exceed your account balance.`
          }
        </p>
      </div>
    </div>
  );
};
