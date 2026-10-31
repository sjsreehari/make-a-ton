export interface LlmToolCall {
  name: string;
  args: Record<string, unknown>;
}

export interface LlmMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface LlmChatOptions {
  system: string;
  history?: LlmMessage[];
  tools?: unknown[];
  message: string;
}

export interface LlmChatResult {
  text?: string;
  toolCalls?: LlmToolCall[];
}

export interface ILlmClient {
  chat(options: LlmChatOptions): Promise<LlmChatResult>;
}
