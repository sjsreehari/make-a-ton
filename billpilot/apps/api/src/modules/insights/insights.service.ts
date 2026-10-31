import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class InsightsService {
  constructor(private readonly prisma: PrismaService) {}

  async getFindings() {
    const findings = await this.prisma.leakageFinding.findMany({
      where: { resolvedAt: null },
      orderBy: { amountAtRisk: 'desc' },
    });

    return { data: findings };
  }

  async runScan() {
    return {
      scannedAt: new Date().toISOString(),
      findingsCount: 0,
      totalAtRisk: '0.00',
    };
  }
}
