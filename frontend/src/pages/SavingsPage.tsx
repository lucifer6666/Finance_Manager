import { useSavings } from '../hooks';
import { AddSavingsForm, SavingsInvestmentTable, SavingsComparisonCard } from '../components';

export const SavingsPage = () => {
  const { investments, comparison, loading, error, addInvestment, updateInvestment, deleteInvestment } = useSavings();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-700 font-semibold">Loading investments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-semibold mb-2">Error Loading Data</p>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-gray-900">Savings & Investments</h1>

      {/* Comparison Card */}
      {comparison && <SavingsComparisonCard comparison={comparison} />}

      {/* Add Form */}
      <AddSavingsForm onAdd={addInvestment} />

      {/* Investments Table */}
      <SavingsInvestmentTable 
        investments={investments} 
        onDelete={deleteInvestment}
        onUpdate={updateInvestment}
        loading={loading}
      />
    </div>
  );
};
