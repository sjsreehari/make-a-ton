import React from 'react';
import { ChatMessage } from '../hooks/useAssistant';
import { BasisLine } from '../cards/BasisLine';
import { TableCard } from '../cards/TableCard';
import { ChartCard } from '../cards/ChartCard';
import { ProposalCard } from '../cards/ProposalCard';

interface MessageListProps {
  messages: ChatMessage[];
  onConfirmProposal?: (id: string) => Promise<void>;
  onCancelProposal?: (id: string) => Promise<void>;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, onConfirmProposal, onCancelProposal }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.length === 0 && (
        <div className="text-center text-xs text-slate-400 mt-12">
          👋 Hi! I'm <strong>Loop</strong>, your AI companion. Ask me any question about revenue, subscriptions, or guided tours.
        </div>
      )}

      {messages.map(msg => (
        <div
          key={msg.id}
          className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs ${
              msg.sender === 'user'
                ? 'bg-indigo-600 text-white rounded-br-none'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none'
            }`}
          >
            <p className="whitespace-pre-wrap">{msg.text}</p>
            {msg.table && <TableCard columns={msg.table.columns} rows={msg.table.rows} />}
            {msg.chart && <ChartCard kind={msg.chart.kind} series={msg.chart.series} />}
            {msg.proposal && (
              <ProposalCard
                id={msg.proposal.id}
                title={msg.proposal.title}
                summary={msg.proposal.summary}
                onConfirm={onConfirmProposal || (async () => {})}
                onCancel={onCancelProposal || (async () => {})}
              />
            )}
            {msg.basis && <BasisLine basis={msg.basis} />}
          </div>
        </div>
      ))}
    </div>
  );
};

