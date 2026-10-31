import React from 'react';

interface SuggestionChipsProps {
  currentRoute: string;
  role: string;
  onSelect: (prompt: string) => void;
}

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({ currentRoute, role, onSelect }) => {
  const getSuggestions = () => {
    if (role === 'CUSTOMER') {
      return ['How much do I owe?', 'Show my active subscriptions', 'Upcoming bills'];
    }

    if (currentRoute.includes('invoice')) {
      return ['Which invoices are overdue?', 'Show aging breakdown', 'How do I run billing?'];
    }
    if (currentRoute.includes('subscription')) {
      return ['How many active subscriptions?', 'Forecast next 3 months', 'How to create a plan?'];
    }

    return ['Revenue this month', 'Current MRR', 'Take me to overdue invoices', 'Show me around'];
  };

  const suggestions = getSuggestions();

  return (
    <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      {suggestions.map(s => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="text-xs px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
        >
          {s}
        </button>
      ))}
    </div>
  );
};

