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
    const sessionId = typeof window !== 'undefined'
      ? (localStorage.getItem('billpilot_ai_session') || crypto.randomUUID())
      : 'server-session';
    if (typeof window !== 'undefined') localStorage.setItem('billpilot_ai_session', sessionId);
    const assistantId = crypto.randomUUID();
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: content,
    };
    setMessages(prev => [...prev, userMsg]);
    setMascotState('thinking');
    setMessages(prev => [...prev, { id: assistantId, sender: 'assistant', text: '' }]);

    try {
      const token = localStorage.getItem('billpilot_token');
      const response = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ message: content, currentRoute: window.location.pathname, sessionId }),
      });
      if (!response.ok || !response.body) throw new Error(`Assistant request failed (${response.status})`);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      const applyEvent = (raw: string) => {
        const data = raw.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trim()).join('\n');
        if (!data) return;
        try {
          const event = JSON.parse(data);
          if (event.type === 'state') setMascotState(event.value || 'idle');
          setMessages(prev => prev.map(msg => msg.id !== assistantId ? msg : {
            ...msg,
            text: event.type === 'text' ? `${msg.text}${event.delta || ''}` : msg.text,
            basis: event.type === 'basis' ? event.basis : msg.basis,
            table: event.type === 'table' ? { columns: event.columns || [], rows: event.rows || [] } : msg.table,
            chart: event.type === 'chart' ? { kind: event.kind || 'line', series: event.series || [] } : msg.chart,
            proposal: event.type === 'proposal' ? { id: event.id || '', title: event.title || '', summary: event.summary || '' } : msg.proposal,
          }));
          if (event.type === 'ui' && event.action === 'navigate' && typeof event.payload?.path === 'string') window.location.assign(event.payload.path);
        } catch { /* Ignore incomplete or non-JSON SSE frames. */ }
      };
      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const frames = buffer.split('\n\n');
        buffer = frames.pop() || '';
        frames.forEach(applyEvent);
        if (done) break;
      }
      if (buffer.trim()) applyEvent(buffer);
      setMascotState('idle');
    } catch (error) {
      setMessages(prev => prev.map(msg => msg.id === assistantId
        ? { ...msg, text: error instanceof Error ? error.message : 'Could not reach the assistant.' }
        : msg));
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

