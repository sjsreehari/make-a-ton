import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';

export interface TourStep {
  page: string;
  targetId: string;
  title: string;
  text: string;
}

interface TourRunnerProps {
  steps: TourStep[];
  onFinish: () => void;
}

export const TourRunner: React.FC<TourRunnerProps> = ({ steps, onFinish }) => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const step = steps[currentIndex];

  useEffect(() => {
    if (!step) return;

    // Navigate to step's page if not already there
    if (window.location.pathname !== step.page) {
      router.push(step.page);
    }

    // Attempt to locate target element with 10 retries x 200ms
    let retries = 0;
    const interval = setInterval(() => {
      const el = document.querySelector(`[data-tour="${step.targetId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-indigo-500', 'ring-offset-2');
        clearInterval(interval);
      } else {
        retries++;
        if (retries >= 10) {
          clearInterval(interval); // Fallback: display step card in place
        }
      }
    }, 200);

    return () => {
      clearInterval(interval);
      const el = document.querySelector(`[data-tour="${step.targetId}"]`);
      if (el) el.classList.remove('ring-4', 'ring-indigo-500', 'ring-offset-2');
    };
  }, [step, router]);

  if (!step) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-96 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
          Step {currentIndex + 1} of {steps.length}
        </span>
        <button onClick={onFinish} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X size={15} />
        </button>
      </div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{step.title}</h3>
      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 mb-4">{step.text}</p>

      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 text-xs text-slate-500 disabled:opacity-40 hover:underline"
        >
          <ChevronLeft size={14} /> Back
        </button>

        {currentIndex < steps.length - 1 ? (
          <button
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="flex items-center gap-1 px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
          >
            Next <ChevronRight size={14} />
          </button>
        ) : (
          <button
            onClick={onFinish}
            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
          >
            Finish Tour
          </button>
        )}
      </div>
    </div>
  );
};

