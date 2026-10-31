import React, { useState } from 'react';
import { AlertCircle, Check, X } from 'lucide-react';

interface ProposalCardProps {
  id: string;
  title: string;
  summary: string;
  onConfirm: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({ id, title, summary, onConfirm, onCancel }) => {
  const [status, setStatus] = useState<'idle' | 'confirming' | 'confirmed' | 'cancelled'>('idle');

  const handleConfirm = async () => {
    setStatus('confirming');
    try {
      await onConfirm(id);
      setStatus('confirmed');
    } catch {
      setStatus('idle');
    }
  };

  const handleCancel = async () => {
    try {
      await onCancel(id);
      setStatus('cancelled');
    } catch {
      setStatus('idle');
    }
  };

  return (
    <div className="my-2 p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 shadow-sm">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-medium text-xs">
        <AlertCircle size={14} />
        <span>Action Proposal</span>
      </div>
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-1">{title}</h4>
      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{summary}</p>

      {status === 'idle' && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleConfirm}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
          >
            <Check size={12} /> Confirm
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium"
          >
            <X size={12} /> Cancel
          </button>
        </div>
      )}

      {status === 'confirmed' && (
        <div className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <Check size={13} /> Action confirmed and executed.
        </div>
      )}

      {status === 'cancelled' && (
        <div className="mt-2 text-xs font-medium text-slate-400 flex items-center gap-1">
          <X size={13} /> Action cancelled.
        </div>
      )}
    </div>
  );
};

