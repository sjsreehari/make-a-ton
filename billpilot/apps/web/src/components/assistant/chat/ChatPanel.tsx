import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { Mascot, MascotState } from '../mascot/Mascot';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { SuggestionChips } from './SuggestionChips';
import { ChatMessage } from '../hooks/useAssistant';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  mascotState: MascotState;
  onSend: (message: string) => void;
  currentRoute?: string;
  role?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  messages,
  mascotState,
  onSend,
  currentRoute = '/',
  role = 'STAFF',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50 w-96 h-[550px] max-h-[80vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <Mascot state={mascotState} />
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
              Loop <Sparkles size={13} className="text-indigo-500" />
            </h3>
            <span className="text-[10px] text-slate-400">BillPilot Companion</span>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Suggestion Chips */}
      <SuggestionChips currentRoute={currentRoute} role={role} onSelect={onSend} />

      {/* Input */}
      <ChatInput onSend={onSend} disabled={mascotState === 'thinking'} />
    </div>
  );
};
