import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './redis.constants';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useExisting: RedisService,
    },
    CacheService,
    RedisService,
  ],
  exports: [REDIS_CLIENT, CacheService, RedisService],
})
export class RedisModule {}
