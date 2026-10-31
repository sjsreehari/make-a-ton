import React from 'react';

interface ChartCardProps {
  kind: string;
  series: unknown[];
}

export const ChartCard: React.FC<ChartCardProps> = ({ kind, series }) => {
  return (
    <div className="my-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        {kind} Chart
      </div>
      <div className="h-32 flex items-center justify-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded">
        {series && series.length > 0 ? `${series.length} data points rendered` : 'No chart data'}
      </div>
    </div>
  );
};

