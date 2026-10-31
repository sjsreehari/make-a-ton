import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CacheService } from '../../common/redis/cache.service';
import { TemplatesService } from './templates.service';
import { EmailGatewayService } from './email-gateway.service';
import { WhatsAppGatewayService } from '../whatsapp/whatsapp-gateway.service';
import { parsePagination, buildMeta } from '../../common/pagination/pagination';
import type { INotificationService } from '@billpilot/shared';
import type { QueryLogsDto } from './notifications.dto';

@Injectable()
export class NotificationService implements INotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly templates: TemplatesService,
    private readonly emailGateway: EmailGatewayService,
    private readonly waGateway: WhatsAppGatewayService,
  ) {}

  /**
   * 11.1 Main entry point for notification delivery with deduplication and delivery logging
   */
  async send(input: {
    channel: 'WHATSAPP' | 'EMAIL';
    template: string;
    to: string;
    data: Record<string, unknown>;
    dedupeKey?: string;
    customerId?: string;
    entity?: string;
    entityId?: string;
  }): Promise<{ queued: boolean; logId: string }> {
    const { channel, template, to, data, dedupeKey, customerId, entity, entityId } = input;

    // 1. Deduplication check
    // Check by dedupeKey in Redis (if specified)
    if (dedupeKey) {
      const existingInCache = await this.cache.get<string>(`dedupe_${dedupeKey}`);
      if (existingInCache) {
        this.logger.warn(`Notification skipped by dedupeKey: ${dedupeKey}`);
        return { queued: false, logId: existingInCache };
      }
    }

    // Check by Prisma unique constraint [template, entity, entityId, channel]
    if (entity && entityId) {
      const existing = await this.prisma.notificationLog.findFirst({
        where: {
          template,
          entity,
          entityId,
          channel: channel as any,
          status: { in: ['SENT', 'QUEUED', 'DELIVERED'] },
        },
      });

      if (existing) {
        this.logger.warn(
          `Notification duplicate suppressed for [${template}, ${entity}, ${entityId}, ${channel}]`,
        );
        return { queued: false, logId: existing.id };
      }
    }

    // 2. Create pending log in database
    let logRecord;
    try {
      logRecord = await this.prisma.notificationLog.create({
        data: {
          channel: channel as any,
          template,
          toAddress: to,
          customerId,
          entity,
          entityId,
          payload: data as any,
          status: 'QUEUED',
          attempts: 1,
        },
      });
    } catch (err: unknown) {
      // If unique constraint collided, return existing
      const existing = await this.prisma.notificationLog.findFirst({
        where: { template, entity, entityId, channel: channel as any },
      });
      if (existing) {
        return { queued: false, logId: existing.id };
      }
      throw err;
    }

    if (dedupeKey) {
      await this.cache.set(`dedupe_${dedupeKey}`, logRecord.id, 86400); // 24 hours
    }

    // 3. Render and deliver notification
    try {
      const rendered = await this.templates.render(template, channel, data);
      let providerMessageId = '';

      if (channel === 'WHATSAPP') {
        const result = await this.waGateway.sendText(to, rendered.body);
        providerMessageId = result.messageId;
      } else {
        const result = await this.emailGateway.sendEmail({
          to,
          subject: rendered.subject || 'BillPilot Notification',
          html: rendered.body,
        });
        providerMessageId = result.messageId;
      }

      // Update log to SENT
      await this.prisma.notificationLog.update({
        where: { id: logRecord.id },
        data: {
          status: 'SENT',
          providerMessageId,
          sentAt: new Date(),
        },
      });

      this.logger.log(`Notification ${logRecord.id} sent successfully via ${channel} to ${to}`);
      return { queued: true, logId: logRecord.id };
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Unknown delivery failure';
      await this.prisma.notificationLog.update({
        where: { id: logRecord.id },
        data: {
          status: 'FAILED',
          error: errorMessage,
        },
      });
      this.logger.error(`Notification ${logRecord.id} failed: ${errorMessage}`);
      return { queued: false, logId: logRecord.id };
    }
  }

  /**
   * 11.11 Delivery log screen queries
   */
  async getLogs(query: QueryLogsDto) {
    const { skip, take } = parsePagination({ page: query.page, limit: query.limit });
    const where: any = {};

    if (query.channel) where.channel = query.channel;
    if (query.status) where.status = query.status;
    if (query.customerId) where.customerId = query.customerId;

    const [data, total] = await Promise.all([
      this.prisma.notificationLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notificationLog.count({ where }),
    ]);

    return {
      data,
      meta: buildMeta(total, { page: query.page, limit: query.limit }),
    };
  }

  /**
   * Retry failed notification
   */
  async retry(id: string) {
    const log = await this.prisma.notificationLog.findUnique({ where: { id } });
    if (!log) throw new Error('Notification log not found');

    const rendered = await this.templates.render(
      log.template,
      log.channel as any,
      (log.payload as Record<string, unknown>) || {},
    );

    let providerMessageId = '';
    try {
      if (log.channel === 'WHATSAPP') {
        const res = await this.waGateway.sendText(log.toAddress, rendered.body);
        providerMessageId = res.messageId;
      } else {
        const res = await this.emailGateway.sendEmail({
          to: log.toAddress,
          subject: rendered.subject || 'BillPilot Notification',
          html: rendered.body,
        });
        providerMessageId = res.messageId;
      }

      await this.prisma.notificationLog.update({
        where: { id: log.id },
        data: {
          status: 'SENT',
          providerMessageId,
          error: null,
          attempts: { increment: 1 },
          sentAt: new Date(),
        },
      });

      return { success: true, message: 'Notification retried successfully' };
    } catch (err: unknown) {
      await this.prisma.notificationLog.update({
        where: { id: log.id },
        data: {
          attempts: { increment: 1 },
          error: (err as Error).message,
        },
      });
      throw err;
    }
  }
}
