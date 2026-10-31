import React from 'react';
import { Download } from 'lucide-react';

interface TableCardProps {
  columns: string[];
  rows: Record<string, unknown>[];
  csvUrl?: string;
}

export const TableCard: React.FC<TableCardProps> = ({ columns, rows }) => {
  const exportCsv = () => {
    if (!rows.length) return;
    const header = columns.join(',');
    const body = rows.map(r => columns.map(c => `"${r[c] ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loop-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!rows || rows.length === 0) return null;

  return (
    <div className="my-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <div className="flex justify-end p-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={exportCsv}
          className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <Download size={13} />
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto max-h-60">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {columns.map(col => (
                <th key={col} className="p-2 border-b border-slate-200 dark:border-slate-700 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-850">
                {columns.map(col => (
                  <td key={col} className="p-2 text-slate-600 dark:text-slate-400">
                    {String(row[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
