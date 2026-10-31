import { Injectable, ConflictException } from '@nestjs/common';
import Decimal from 'decimal.js';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CommonAuditService } from '../../common/audit/audit.service';
import { parsePagination, buildMeta, PaginationParams } from '../../common/pagination/pagination';
import { CreateDiscountDto } from './discounts.dto';

@Injectable()
export class DiscountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: CommonAuditService,
  ) {}

  async findAll(params: PaginationParams) {
    const { skip, take } = parsePagination(params);
    const [discounts, total] = await Promise.all([
      this.prisma.discount.findMany({
        skip,
        take,
        orderBy: { startsAt: 'desc' },
      }),
      this.prisma.discount.count(),
    ]);

    return {
      data: discounts.map((d) => ({
        ...d,
        value: d.value.toFixed(2),
        minPurchaseAmount: d.minPurchaseAmount?.toFixed(2) || null,
      })),
      meta: buildMeta(total, params),
    };
  }

  async create(dto: CreateDiscountDto, actorId: string) {
    const existing = await this.prisma.discount.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`Discount code ${dto.code} already exists`);
    }

    const discount = await this.prisma.discount.create({
      data: {
        code: dto.code,
        name: dto.name,
        type: dto.type as any,
        value: new Decimal(dto.value),
        scope: dto.scope as any,
        productIds: dto.productIds,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        usageLimit: dto.usageLimit,
      },
    });

    await this.audit.log({
      actor: { id: actorId, role: 'ADMIN' },
      entity: 'Discount',
      entityId: discount.id,
      action: 'DISCOUNT_CREATED',
      after: discount,
    });

    return discount;
  }
}

