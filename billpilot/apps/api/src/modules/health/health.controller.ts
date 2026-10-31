import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CacheService } from '../../common/redis/cache.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'System health check (PostgreSQL + Redis)' })
  async getHealth() {
    const [dbOk, redisOk] = await Promise.all([
      this.prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
      this.cache.ping(),
    ]);

    const status = dbOk ? (redisOk ? 'ok' : 'degraded') : 'down';

    return {
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: dbOk ? 'healthy' : 'unhealthy',
        redis: redisOk ? 'healthy' : 'unreachable',
      },
      uptime: process.uptime(),
    };
  }
}
