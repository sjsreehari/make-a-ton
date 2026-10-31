import { z } from 'zod';

export const ChatRequestSchema = z.object({
  message: z.string().min(1),
  currentRoute: z.string().default('/'),
  sessionId: z.string().min(1),
});

export type ChatRequestDto = z.infer<typeof ChatRequestSchema>;

export type MascotState = 'listening' | 'thinking' | 'talking' | 'idle' | 'happy' | 'oops';

export interface SseEvent {
  type: 'state' | 'text' | 'ui' | 'table' | 'chart' | 'basis' | 'proposal' | 'done';
  value?: MascotState;
  delta?: string;
  action?: 'navigate' | 'highlight' | 'tour';
  payload?: Record<string, unknown>;
  columns?: string[];
  rows?: Record<string, unknown>[];
  csvUrl?: string;
  kind?: string;
  series?: unknown[];
  id?: string;
  title?: string;
  summary?: string;
  basis?: Record<string, unknown>;
}
