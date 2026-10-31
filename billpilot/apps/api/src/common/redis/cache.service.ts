import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import * as crypto from 'crypto';
import { REDIS_CLIENT } from './redis.module';

@Injectable()
export class CacheService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const val = await this.redis.get(key);
      if (!val) return null;
      return JSON.parse(val) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // Redis unavailable fallback
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch {
      // Redis unavailable fallback
    }
  }

  async ping(): Promise<boolean> {
    try {
      const res = await this.redis.ping();
      return res === 'PONG';
    } catch {
      return false;
    }
  }

  hashKey(obj: Record<string, unknown>): string {
    return crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex');
  }
}

