import { EMIManagement, SalaryManagement } from '../components';

export const SalaryPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-4 text-black">💰 Salary & EMI Management</h1>
        <p className="text-gray-600 mb-4">
          Set up recurring salaries and fixed-date EMI expenses. They will be automatically added as income or expense entries when due.
        </p>
      </div>

      <SalaryManagement />
      <EMIManagement />
    </div>
  );
};
