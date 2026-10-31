import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CacheService } from '../../common/redis/cache.service';
import { ReportFilterDto } from './reports.dto';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async getDashboardSummary(filters: ReportFilterDto) {
    const cacheKey = `report:dashboard:${this.cache.hashKey(filters as Record<string, unknown>)}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    const subWhere: any = {};
    if (filters.planId) subWhere.planId = filters.planId;
    if (filters.customerId) subWhere.customerId = filters.customerId;

    const [activeSubscriptions, confirmedSubscriptions, paidInvoices, dueInvoices] =
      await Promise.all([
        this.prisma.subscription.count({
          where: { ...subWhere, status: 'ACTIVE', isPaused: false },
        }),
        this.prisma.subscription.count({
          where: { ...subWhere, status: 'CONFIRMED' },
        }),
        this.prisma.invoice.aggregate({
          where: { status: 'PAID' },
          _sum: { amountPaid: true },
        }),
        this.prisma.invoice.aggregate({
          where: {
            status: { in: ['DRAFT', 'CONFIRMED'] },
          },
          _sum: { amountDue: true },
          _count: { id: true },
        }),
      ]);

    const now = new Date();
    const overdueCount = await this.prisma.invoice.count({
      where: {
        status: 'CONFIRMED',
        dueDate: { lt: now },
      },
    });

    const summary = {
      activeSubscriptions,
      confirmedSubscriptions,
      revenueCollected: (paidInvoices._sum.amountPaid || new Decimal(0)).toFixed(2),
      amountOwed: (dueInvoices._sum.amountDue || new Decimal(0)).toFixed(2),
      overdueCount,
      totalUnpaidInvoices: dueInvoices._count.id,
      generatedAt: now.toISOString(),
    };

    await this.cache.set(cacheKey, summary, 60);

    return { ...summary, fromCache: false };
  }
}
