import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { INotificationService, Channel, InvoiceEvent } from '@billpilot/shared';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class NotificationsService implements INotificationService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async send(input: {
    channel: 'WHATSAPP' | 'EMAIL';
    template: string;
    to: string;
    data: Record<string, unknown>;
    dedupeKey?: string;
    customerId?: string;
  }): Promise<{ queued: boolean; logId: string }> {
    const log = await this.prisma.notificationLog.create({
      data: {
        channel: input.channel as any,
        template: input.template,
        toAddress: input.to,
        customerId: input.customerId,
        payload: input.data as any,
        status: 'QUEUED',
      },
    });

    this.logger.log(
      `[${input.channel}] Queued notification with template "${input.template}" to ${input.to}`,
    );

    return { queued: true, logId: log.id };
  }

  @OnEvent('invoice.confirmed')
  async handleInvoiceConfirmed(event: InvoiceEvent) {
    this.logger.log(`WOULD SEND WHATSAPP for invoice ${event.number} (Total: ${event.total})`);

    await this.send({
      channel: 'WHATSAPP',
      template: 'invoice.confirmed',
      to: '+919876543210',
      data: event as unknown as Record<string, unknown>,
      customerId: event.customerId,
    });
  }

  async list(customerId?: string) {
    const where = customerId ? { customerId } : {};
    const logs = await this.prisma.notificationLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return { data: logs };
  }
}
