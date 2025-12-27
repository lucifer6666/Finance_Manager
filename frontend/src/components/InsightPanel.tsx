import { Insight } from '../types';

interface InsightPanelProps {
  insights: Insight[];
}

const severityStyles = {
  info: 'bg-blue-100 border-blue-300 text-blue-800',
  warning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  alert: 'bg-red-100 border-red-300 text-red-800',
};

const severityIcons = {
  info: 'ℹ️',
  warning: '⚠️',
  alert: '🚨',
};

export const InsightPanel = ({ insights }: InsightPanelProps) => {
  if (insights.length === 0) {
    return (
      <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-green-800">
        <p>✅ All looks good! Keep up with your finances.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-black">Insights & Recommendations</h3>
      {insights.map((insight, index) => (
        <div
          key={index}
          className={`border-l-4 rounded-lg p-4 ${severityStyles[insight.severity]}`}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">{severityIcons[insight.severity]}</span>
            <p className="flex-1">{insight.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
