import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

interface CategoryData {
  name: string;
  amount?: number;
  value?: number;
}

interface CategoryPieChartProps {
  data: Array<[string, number] | CategoryData>;
  title?: string;
  onCategoryClick?: (categoryName: string) => void;
  selectedCategory?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export const CategoryPieChart = ({ 
  data, 
  title = 'Spending by Category',
  onCategoryClick,
  selectedCategory,
}: CategoryPieChartProps) => {
  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-black">No data available</p>
      </div>
    );
  }

  const chartData = data.map((item) => {
    if (Array.isArray(item)) {
      const [name, value] = item;
      return { name, value };
    }
    return { name: item.name, value: item.amount || item.value || 0 };
  });

  const handleClick = (data: any) => {
    if (onCategoryClick) {
      onCategoryClick(data.name);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-black">{title}</h3>
      {onCategoryClick && (
        <p className="text-sm text-gray-600 mb-3 italic">💡 Click on a segment to view details</p>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            onClick={(data) => handleClick(data)}
            cursor={onCategoryClick ? 'pointer' : 'default'}
          >
            {chartData.map((entry, index) => {
              const isSelected = selectedCategory === entry.name;
              const baseColor = COLORS[index % COLORS.length];
              const fillColor = isSelected ? '#000000' : baseColor;
              return (
                <Cell 
                  key={entry.name} 
                  fill={fillColor}
                  opacity={isSelected ? 1 : 0.8}
                />
              );
            })}
          </Pie>
          <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
