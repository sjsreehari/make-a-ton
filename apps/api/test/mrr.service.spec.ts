import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MrrService } from '../src/modules/insights/mrr.service';

describe('MrrService', () => {
  let service: MrrService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      subscription: {
        findMany: vi.fn(),
      },
      mrrSnapshot: {
        upsert: vi.fn(),
        findMany: vi.fn(),
      },
    };

    service = new MrrService(mockPrisma);
  });

  it('12.2 should normalize MRR across Monthly, Yearly, and Weekly billing periods', async () => {
    mockPrisma.subscription.findMany.mockImplementation((args: any) => {
      if (args.where?.status === 'ACTIVE') {
        return Promise.resolve([
          // Monthly: 1000/mo -> 1000 MRR
          { startDate: new Date('2026-01-01'), plan: { price: '1000.00', billingPeriod: 'MONTHLY' } },
          // Yearly: 12000/yr -> 1000 MRR
          { startDate: new Date('2026-01-01'), plan: { price: '12000.00', billingPeriod: 'YEARLY' } },
          // Weekly: 100/wk -> 433.33 MRR
          { startDate: new Date('2026-01-01'), plan: { price: '100.00', billingPeriod: 'WEEKLY' } },
        ]);
      }
      return Promise.resolve([]);
    });

    const metrics = await service.calculateLiveMetrics();
    expect(metrics.activeCount).toBe(3);
    // 1000 + 1000 + 433.33 = 2433.33
    expect(metrics.mrr).toBeCloseTo(2433.33, 1);
    expect(metrics.arr).toBeCloseTo(2433.33 * 12, 1);
  });
});

