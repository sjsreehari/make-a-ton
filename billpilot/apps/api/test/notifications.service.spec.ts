import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService } from '../src/modules/notifications/notifications.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let mockPrisma: any;
  let mockCache: any;
  let mockTemplates: any;
  let mockEmailGateway: any;
  let mockWaGateway: any;

  beforeEach(() => {
    mockPrisma = {
      notificationLog: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
    };
    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
    };
    mockTemplates = {
      render: vi.fn().mockResolvedValue({ subject: 'Test Subject', body: 'Test Body' }),
    };
    mockEmailGateway = {
      sendEmail: vi.fn().mockResolvedValue({ messageId: 'email-msg-123' }),
    };
    mockWaGateway = {
      sendText: vi.fn().mockResolvedValue({ success: true, messageId: 'wa-msg-123', provider: 'mock' }),
    };

    service = new NotificationService(
      mockPrisma,
      mockCache,
      mockTemplates,
      mockEmailGateway,
      mockWaGateway,
    );
  });

  it('11.1 should send WhatsApp notification and record delivery log', async () => {
    mockPrisma.notificationLog.create.mockResolvedValue({ id: 'log-1' });

    const result = await service.send({
      channel: 'WHATSAPP',
      template: 'invoice_confirmed',
      to: '+919876543210',
      data: { invoiceNumber: 'INV-001', total: '1500.00' },
      customerId: 'cust-1',
    });

    expect(result.queued).toBe(true);
    expect(result.logId).toBe('log-1');
    expect(mockWaGateway.sendText).toHaveBeenCalledWith('+919876543210', 'Test Body');
    expect(mockPrisma.notificationLog.update).toHaveBeenCalledWith({
      where: { id: 'log-1' },
      data: expect.objectContaining({ status: 'SENT', providerMessageId: 'wa-msg-123' }),
    });
  });

  it('11.1 should deduplicate by dedupeKey and avoid duplicate sends', async () => {
    mockCache.get.mockResolvedValue('existing-log-id');

    const result = await service.send({
      channel: 'WHATSAPP',
      template: 'reminder_d_minus_3',
      to: '+919876543210',
      data: { invoiceNumber: 'INV-001' },
      dedupeKey: 'remind_inv_001_d3',
    });

    expect(result.queued).toBe(false);
    expect(result.logId).toBe('existing-log-id');
    expect(mockWaGateway.sendText).not.toHaveBeenCalled();
  });

  it('11.1 should suppress duplicate sends if matching log already exists for entity', async () => {
    mockPrisma.notificationLog.findFirst.mockResolvedValue({ id: 'existing-db-log' });

    const result = await service.send({
      channel: 'EMAIL',
      template: 'invoice_confirmed',
      to: 'client@example.com',
      data: {},
      entity: 'Invoice',
      entityId: 'inv-123',
    });

    expect(result.queued).toBe(false);
    expect(result.logId).toBe('existing-db-log');
    expect(mockEmailGateway.sendEmail).not.toHaveBeenCalled();
  });
});
