import { Injectable } from '@nestjs/common';
import { TtlCacheService } from '../cache/ttl-cache.service';

@Injectable()
export class CacheService extends TtlCacheService {}
