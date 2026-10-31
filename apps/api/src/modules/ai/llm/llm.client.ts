import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ILlmClient, LlmChatOptions, LlmChatResult } from './llm.interface';

@Injectable()
export class LlmClient implements ILlmClient {
  private readonly logger = new Logger(LlmClient.name);
  private readonly apiKey: string | undefined;
  private readonly modelName: string;
  private readonly timeoutMs: number;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('GEMINI_API_KEY');
    this.modelName = this.config.get<string>('GEMINI_MODEL', 'gemini-2.5-flash');
    this.timeoutMs = Number(this.config.get<string>('GEMINI_TIMEOUT_MS', '15000'));
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async chat(options: LlmChatOptions): Promise<LlmChatResult> {
    if (!this.isAvailable()) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Stub implementation: wrapped call to @google/genai with retry and timeout logic
    this.logger.log(`Invoking LLM model ${this.modelName} (timeout ${this.timeoutMs}ms)`);

    return {
      text: 'LLM stub response',
      toolCalls: [],
    };
  }
}

