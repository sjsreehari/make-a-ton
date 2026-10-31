import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WhatsAppBotService } from '../src/modules/whatsapp/whatsapp-bot.service';

describe('WhatsAppBotService', () => {
  let bot: WhatsAppBotService;
  let mockPrisma: any;
  let mockPhoneService: any;
  let mockWaGateway: any;
  let mockAudit: any;

  beforeEach(() => {
    mockPrisma = {
      user: { findFirst: vi.fn() },
      customer: { findUnique: vi.fn() },
      whatsAppSession: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
      invoice: { findMany: vi.fn(), findFirst: vi.fn() },
      subscription: { findFirst: vi.fn(), update: vi.fn() },
      paymentLink: { findFirst: vi.fn() },
    };
    mockPhoneService = {
      normalize: vi.fn((p) => p),
    };
    mockWaGateway = {
      sendText: vi.fn().mockResolvedValue({ success: true, messageId: 'wa-123' }),
    };
    mockAudit = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    bot = new WhatsAppBotService(mockPrisma, mockPhoneService, mockWaGateway, mockAudit);
  });

  it('11.8 should reply with generic response to unknown / unverified phone without revealing data', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const result = await bot.handleInbound({
      from: '+919999999999',
      body: 'balance',
    });

    expect(result.action).toBe('UNVERIFIED_GENERIC_REPLY');
    expect(mockWaGateway.sendText).toHaveBeenCalledWith(
      '+919999999999',
      expect.stringContaining('not linked to an active customer account'),
    );
  });

  it('11.8 should answer BALANCE command for verified customer', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'u-1',
      customer: { id: 'c-1', name: 'Acme Corp', creditBalance: 0 },
    });
    mockPrisma.whatsAppSession.findUnique.mockResolvedValue({ id: 's-1', context: {} });
    mockPrisma.invoice.findMany.mockResolvedValue([
      { number: 'INV-101', amountDue: '2500.00', dueDate: new Date() },
    ]);
    mockPrisma.customer.findUnique.mockResolvedValue({ creditBalance: 0 });

    const result = await bot.handleInbound({
      from: '+919876543210',
      body: 'balance',
    });

    expect(result.action).toBe('BALANCE');
    expect(mockWaGateway.sendText).toHaveBeenCalledWith(
      '+919876543210',
      expect.stringContaining('Total Outstanding Due: *₹2500.00*'),
    );
  });

  it('11.8 should require YES confirmation before pausing subscription', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'u-1',
      customer: { id: 'c-1', name: 'Acme Corp' },
    });
    mockPrisma.whatsAppSession.findUnique.mockResolvedValue({ id: 's-1', context: {} });
    mockPrisma.subscription.findFirst.mockResolvedValue({
      id: 'sub-1',
      number: 'SUB-2026-001',
      plan: { name: 'Pro Plan', pausable: true },
    });

    // Customer sends "pause"
    const step1 = await bot.handleInbound({ from: '+919876543210', body: 'pause' });
    expect(step1.action).toBe('PROMPT_PAUSE');
    expect(mockPrisma.whatsAppSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          context: expect.objectContaining({ pendingAction: 'PAUSE' }),
        }),
      }),
    );

    // Customer sends "YES" to confirm
    mockPrisma.whatsAppSession.findUnique.mockResolvedValue({
      id: 's-1',
      context: { pendingAction: 'PAUSE', subscriptionId: 'sub-1', subscriptionNumber: 'SUB-2026-001' },
    });

    const step2 = await bot.handleInbound({ from: '+919876543210', body: 'YES' });
    expect(step2.action).toBe('CONFIRMED_PAUSE');
    expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
      where: { id: 'sub-1' },
      data: expect.objectContaining({ isPaused: true }),
    });
  });
});
