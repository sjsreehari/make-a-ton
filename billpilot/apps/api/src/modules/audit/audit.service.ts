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
}
