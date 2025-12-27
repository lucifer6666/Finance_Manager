import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlyChartProps {
  data: Array<{
    month: string;
    income: number;
    expense: number;
    savings: number;
  }>;
  title?: string;
}

export const MonthlyChart = ({ data, title = 'Monthly Trends' }: MonthlyChartProps) => {
  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-black">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-black">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
          <Legend />
          <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
          <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} />
          <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
