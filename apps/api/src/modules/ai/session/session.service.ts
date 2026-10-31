import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../common/redis/redis.service';

export interface ChatTurn {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  toolCalls?: unknown[];
}

@Injectable()
export class AiSessionService {
  private readonly logger = new Logger(AiSessionService.name);
  private readonly memoryFallback = new Map<string, ChatTurn[]>();

  constructor(private readonly redis: RedisService) {}

  async getSessionHistory(sessionId: string): Promise<ChatTurn[]> {
    try {
      const data = await this.redis.get(`ai:session:${sessionId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return this.memoryFallback.get(sessionId) || [];
    }
  }

  async appendTurn(sessionId: string, turn: ChatTurn): Promise<void> {
    const history = await this.getSessionHistory(sessionId);
    history.push(turn);
    const trimmed = history.slice(-10); // Keep last 10 turns

    try {
      await this.redis.set(`ai:session:${sessionId}`, JSON.stringify(trimmed), 86400); // 24hr TTL
    } catch {
      this.memoryFallback.set(sessionId, trimmed);
    }
  }

  async checkRateLimit(userId: string): Promise<boolean> {
    const key = `ai:ratelimit:${userId}`;
    try {
      const count = await this.redis.incr(key);
      if (count === 1) {
        await this.redis.expire(key, 60);
      }
      return count <= 20; // 20 messages per min per user
    } catch {
      return true; // Graceful fallback
    }
  }
}

