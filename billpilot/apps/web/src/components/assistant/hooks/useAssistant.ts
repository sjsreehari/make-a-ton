import { useState, useCallback } from 'react';
import { MascotState } from '../mascot/Mascot';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  basis?: any;
  table?: { columns: string[]; rows: Record<string, unknown>[] };
  chart?: { kind: string; series: unknown[] };
  proposal?: { id: string; title: string; summary: string };
}

export function useAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mascotState, setMascotState] = useState<MascotState>('idle');
  const [activeTour, setActiveTour] = useState<any[] | null>(null);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: content,
    };
    setMessages(prev => [...prev, userMsg]);
    setMascotState('thinking');

    try {
      // Stub: in full implementation this connects to POST /api/v1/ai/chat via SSE
      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: 'I am Loop. How can I help with your billing and finances today?',
      };
      setMessages(prev => [...prev, assistantMsg]);
      setMascotState('idle');
    } catch {
      setMascotState('oops');
    }
  }, []);

  return {
    isOpen,
    setIsOpen,
    messages,
    mascotState,
    sendMessage,
    activeTour,
    setActiveTour,
    activeHighlight,
    setActiveHighlight,
  };
}
