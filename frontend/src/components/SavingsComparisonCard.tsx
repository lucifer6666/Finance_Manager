import { SavingsComparison } from '../types';

interface SavingsComparisonCardProps {
  comparison: SavingsComparison;
}

export const SavingsComparisonCard = ({ comparison }: SavingsComparisonCardProps) => {
  const isAccountAhead = comparison.cash_savings >= 0;
  const isInvestmentValuePositive = comparison.investment_profit_loss >= 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-900">Account & Investment Comparison</h3>
        <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold uppercase tracking-wide">
          This month
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-5 rounded-2xl text-white shadow-md">
          <p className="text-sm uppercase tracking-wide text-blue-100">Account Balance</p>
          <p className="mt-4 text-3xl font-extrabold">
            ₹{comparison.account_balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="mt-2 text-sm text-blue-100">Net income minus expenses for this month</p>
        </div>

        <div className="bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-700 p-5 rounded-2xl text-white shadow-md">
          <p className="text-sm uppercase tracking-wide text-violet-100">Plan Contributions</p>
          <p className="mt-4 text-3xl font-extrabold">
            ₹{comparison.total_invested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="mt-2 text-sm text-violet-100">Total from monthly saving-plan entries</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 p-5 rounded-2xl border border-emerald-200">
          <p className="text-sm font-semibold text-emerald-700">Current Value</p>
          <p className="mt-3 text-2xl font-bold text-emerald-900">
            ₹{comparison.total_current_investment_value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-100 p-5 rounded-2xl border border-amber-200">
          <p className="text-sm font-semibold text-amber-700">Profit / Loss</p>
          <p className={`mt-3 text-2xl font-bold ${isInvestmentValuePositive ? 'text-green-700' : 'text-red-700'}`}>
            {isInvestmentValuePositive ? '+' : '-'}₹{Math.abs(comparison.investment_profit_loss).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-sky-100 p-5 rounded-2xl border border-cyan-200">
          <p className="text-sm font-semibold text-cyan-700">Cash Savings</p>
          <p className={`mt-3 text-2xl font-bold ${isAccountAhead ? 'text-green-700' : 'text-red-700'}`}>
            ₹{comparison.cash_savings.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className={`p-5 rounded-2xl border ${isAccountAhead ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
        <p className={`text-center font-semibold ${isAccountAhead ? 'text-green-800' : 'text-orange-800'}`}>
          {isAccountAhead
            ? `✅ You have ₹${Math.abs(comparison.cash_savings).toLocaleString('en-IN', { maximumFractionDigits: 2 })} left after this month's saving-plan contributions.`
            : `⚠️ Your saving-plan contributions are ₹${Math.abs(comparison.cash_savings).toLocaleString('en-IN', { maximumFractionDigits: 2 })} above your current account balance.`}
        </p>
      </div>
    </div>
  );
};
