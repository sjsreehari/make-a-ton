import { Injectable } from '@nestjs/common';
import { TtlCacheService } from '../cache/ttl-cache.service';

@Injectable()
export class RedisService extends TtlCacheService {
  getClient() {
    return this;
  }
}
