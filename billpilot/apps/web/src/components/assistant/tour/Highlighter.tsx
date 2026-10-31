import React, { useEffect } from 'react';

interface HighlighterProps {
  targetId: string | null;
  onDismiss: () => void;
}

export const Highlighter: React.FC<HighlighterProps> = ({ targetId, onDismiss }) => {
  useEffect(() => {
    if (!targetId) return;

    const el = document.querySelector(`[data-tour="${targetId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-indigo-500', 'ring-offset-2', 'transition-all');
    }

    return () => {
      if (el) {
        el.classList.remove('ring-4', 'ring-indigo-500', 'ring-offset-2', 'transition-all');
      }
    };
  }, [targetId]);

  if (!targetId) return null;

  return (
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px] pointer-events-auto cursor-pointer"
      title="Click anywhere to dismiss highlight"
    />
  );
};

