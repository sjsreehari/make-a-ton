import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { parsePagination, buildMeta, PaginationParams } from '../../common/pagination/pagination';
import { AuditFilterDto } from './audit.dto';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: PaginationParams & AuditFilterDto) {
    const { skip, take } = parsePagination(params);
    const where: any = {};
    if (params.entity) where.entity = params.entity;
    if (params.entityId) where.entityId = params.entityId;
    if (params.actorId) where.actorId = params.actorId;
    if (params.action) where.action = params.action;
    if (params.startDate || params.endDate) {
      where.at = {};
      if (params.startDate) where.at.gte = new Date(params.startDate);
      if (params.endDate) where.at.lte = new Date(params.endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { at: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      meta: buildMeta(total, params),
    };
  }

  /**
   * Chronological activity timeline for a specific entity (Invoice, Subscription, Payment).
   */
  async getTimeline(entity: string, entityId: string) {
    const entries = await this.prisma.auditLog.findMany({
      where: { entity, entityId },
      orderBy: { at: 'asc' },
    });

    return {
      entity,
      entityId,
      totalEvents: entries.length,
      timeline: entries.map((e) => ({
        id: e.id,
        at: e.at.toISOString(),
        actorId: e.actorId,
        actorRole: e.actorRole,
        action: e.action,
        source: e.requestId?.startsWith('wh_')
          ? 'WEBHOOK'
          : e.requestId?.startsWith('job_')
            ? 'SYSTEM_JOB'
            : e.actorId
              ? 'UI'
              : 'API',
        before: e.before,
        after: e.after,
      })),
    };
  }
}
