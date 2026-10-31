import React from 'react';

interface BasisProps {
  basis?: {
    from?: string;
    to?: string;
    asOf: string;
    filters?: Record<string, unknown>;
    rowCount: number;
  };
}

export const BasisLine: React.FC<BasisProps> = ({ basis }) => {
  if (!basis) return null;

  return (
    <div className="mt-2 pt-1 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 font-mono flex flex-wrap gap-x-3 gap-y-1">
      <span>Basis: {basis.rowCount} rows</span>
      {basis.from && <span>From: {basis.from.slice(0, 10)}</span>}
      {basis.to && <span>To: {basis.to.slice(0, 10)}</span>}
      <span>As of: {new Date(basis.asOf).toLocaleString()}</span>
    </div>
  );
};
