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
    this.modelName = this.config.get<string>('GEMINI_MODEL', 'gemini-3.8-flash');
    this.timeoutMs = Number(this.config.get<string>('GEMINI_TIMEOUT_MS', '45000'));
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async chat(options: LlmChatOptions): Promise<LlmChatResult> {
    if (!this.isAvailable()) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const contents = [
        ...(options.history || []).map((item) => ({
          role: item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.content }],
        })),
        { role: 'user', parts: [{ text: options.message }] },
      ];
      let response: Response | undefined;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.modelName)}:generateContent?key=${encodeURIComponent(this.apiKey!)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: options.system }] },
              contents,
              generationConfig: { responseMimeType: 'application/json' },
            }),
            signal: controller.signal,
          },
        );
        if (response.ok) break;
        if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 2) {
          const detail = await response.text();
          this.logger.error(`Gemini request failed (${response.status}): ${detail.slice(0, 500)}`);
          throw new Error(`Gemini request failed (${response.status})`);
        }
        await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
      }
      if (!response?.ok) throw new Error('Gemini request failed');
      const payload = await response.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
      if (!text) throw new Error('Gemini returned an empty response');
      return { text, toolCalls: [] };
    } finally {
      clearTimeout(timeout);
    }
  }
}

