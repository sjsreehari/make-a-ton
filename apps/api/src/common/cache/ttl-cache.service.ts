import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

interface CacheEntry {
  value: any;
  expiresAt: number | null; // epoch ms
}

@Injectable()
export class TtlCacheService {
  private readonly logger = new Logger(TtlCacheService.name);
  private readonly store = new Map<string, CacheEntry>();

  constructor() {
    // Run periodic sweep every 60s
    if (typeof setInterval !== 'undefined') {
      const timer = setInterval(() => this.sweep(), 60000);
      if (timer.unref) timer.unref();
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async delByPrefix(prefix: string): Promise<number> {
    let deleted = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        deleted++;
      }
    }
    return deleted;
  }

  async incr(key: string): Promise<number> {
    const entry = this.store.get(key);
    let val = 0;
    if (entry && (entry.expiresAt === null || Date.now() <= entry.expiresAt)) {
      val = typeof entry.value === 'number' ? entry.value : parseInt(entry.value, 10) || 0;
    }
    val += 1;
    this.store.set(key, {
      value: val,
      expiresAt: entry?.expiresAt ?? null,
    });
    return val;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return 0;
    entry.expiresAt = Date.now() + seconds * 1000;
    return 1;
  }

  async ping(): Promise<boolean> {
    return true;
  }

  hashKey(obj: Record<string, unknown>): string {
    return crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex');
  }

  sweep(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt !== null && now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  clear(): void {
    this.store.clear();
  }
}
