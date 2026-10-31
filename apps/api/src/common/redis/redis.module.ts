import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CacheService } from './cache.service';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './redis.constants';

export * from './redis.constants';
export * from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const client = new Redis(config.get<string>('REDIS_URL', 'redis://localhost:6379'), {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
        });
        client.on('error', (err) => {
          // Soft warn to allow running when Redis is not started yet in local dev/tests
          console.warn('[Redis] Connection warning:', err.message);
        });
        return client;
      },
    },
    CacheService,
    RedisService,
  ],
  exports: [REDIS_CLIENT, CacheService, RedisService],
})
export class RedisModule {}
