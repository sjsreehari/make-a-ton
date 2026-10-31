import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Actor, IAuditService } from '@billpilot/shared';

@Injectable()
export class CommonAuditService implements IAuditService {
  private readonly logger = new Logger(CommonAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: {
    actor?: Actor;
    entity: string;
    entityId: string;
    action: string;
    before?: unknown;
    after?: unknown;
    requestId?: string;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: entry.actor?.id,
          actorRole: entry.actor?.role as any,
          entity: entry.entity,
          entityId: entry.entityId,
          action: entry.action,
          before: entry.before ? (entry.before as any) : undefined,
          after: entry.after ? (entry.after as any) : undefined,
          requestId: entry.requestId,
        },
      });
    } catch (err: unknown) {
      this.logger.error(`Audit logging failed: ${(err as Error).message}`);
    }
  }
}

