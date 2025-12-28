import { SalaryManagement } from '../components';

export const SalaryPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-4 text-black">💰 Salary Management</h1>
        <p className="text-gray-600 mb-4">
          Set up your recurring salaries. They will be automatically added as income on the 1st of each month.
        </p>
      </div>

      <SalaryManagement />
    </div>
  );
};
