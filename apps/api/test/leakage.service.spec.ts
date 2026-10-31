import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeakageService } from '../src/modules/insights/leakage.service';

describe('LeakageService', () => {
  let service: LeakageService;
  let mockPrisma: any;
  let mockAudit: any;

  beforeEach(() => {
    mockPrisma = {
      subscription: { findMany: vi.fn(), update: vi.fn() },
      discountUsage: { findMany: vi.fn() },
      invoiceLine: { findMany: vi.fn() },
      invoice: { findMany: vi.fn(), update: vi.fn() },
      leakageFinding: { upsert: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    };
    mockAudit = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    service = new LeakageService(mockPrisma, mockAudit);
  });

  it('12.1 should detect NEVER_INVOICED subscriptions and compute amount at risk', async () => {
    mockPrisma.subscription.findMany.mockImplementation((args: any) => {
      if (args.where?.invoices?.none) {
        return Promise.resolve([
          { id: 'sub-lost-1', number: 'SUB-2026-999', plan: { name: 'Growth', price: '4500.00' } },
        ]);
      }
      return Promise.resolve([]);
    });
    mockPrisma.discountUsage.findMany.mockResolvedValue([]);
    mockPrisma.invoiceLine.findMany.mockResolvedValue([]);
    mockPrisma.invoice.findMany.mockResolvedValue([]);

    await service.scanForLeakage();

    expect(mockPrisma.leakageFinding.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          kind_entity_entityId: {
            kind: 'NEVER_INVOICED',
            entity: 'Subscription',
            entityId: 'sub-lost-1',
          },
        },
        create: expect.objectContaining({
          kind: 'NEVER_INVOICED',
          amountAtRisk: '4500.00',
        }),
      }),
    );
  });

  it('12.1 should provide one-click fix for EXPIRED_BUT_ACTIVE subscription', async () => {
    mockPrisma.leakageFinding.findUnique.mockResolvedValue({
      id: 'find-1',
      kind: 'EXPIRED_BUT_ACTIVE',
      entity: 'Subscription',
      entityId: 'sub-expired-1',
      amountAtRisk: '2000.00',
    });

    const result = await service.fixFinding('find-1', 'admin-user');

    expect(result.success).toBe(true);
    expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
      where: { id: 'sub-expired-1' },
      data: expect.objectContaining({ status: 'CLOSED' }),
    });
    expect(mockPrisma.leakageFinding.update).toHaveBeenCalledWith({
      where: { id: 'find-1' },
      data: expect.objectContaining({ resolvedAt: expect.any(Date) }),
    });
  });
});

