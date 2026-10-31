'use client';

import React from 'react';
import { useAssistant } from './hooks/useAssistant';
import { Mascot } from './mascot/Mascot';
import { ChatPanel } from './chat/ChatPanel';
import { TourRunner } from './tour/TourRunner';
import { Highlighter } from './tour/Highlighter';

export const Loop: React.FC = () => {
  const {
    isOpen,
    setIsOpen,
    messages,
    mascotState,
    sendMessage,
    activeTour,
    setActiveTour,
    activeHighlight,
    setActiveHighlight,
  } = useAssistant();

  return (
    <>
      {/* Floating launcher button at bottom-right */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
          title="Talk with Loop"
        >
          <Mascot state={mascotState} />
          <span className="text-xs font-semibold pr-1">Ask Loop</span>
        </button>
      </div>

      {/* Slide-up Chat Panel */}
      <ChatPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        mascotState={mascotState}
        onSend={sendMessage}
      />

      {/* Tour Step Overlay */}
      {activeTour && <TourRunner steps={activeTour} onFinish={() => setActiveTour(null)} />}

      {/* Target Element Spotlight */}
      {activeHighlight && (
        <Highlighter targetId={activeHighlight} onDismiss={() => setActiveHighlight(null)} />
      )}
    </>
  );
};
