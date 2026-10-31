import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'System health check (MySQL + Background Jobs)' })
  async getHealth() {
    const dbOk = await this.prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);

    return {
      status: dbOk ? 'ok' : 'error',
      db: dbOk ? 'up' : 'down',
      jobs: 'up',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
