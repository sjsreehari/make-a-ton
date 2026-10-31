import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CommonAuditService } from '../../common/audit/audit.service';
import { CreateTaxRuleDto } from './tax.dto';

@Injectable()
export class TaxService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: CommonAuditService,
  ) {}

  async findAll() {
    const rules = await this.prisma.taxRule.findMany({
      orderBy: { ratePercent: 'asc' },
    });

    return {
      data: rules.map((r) => ({
        id: r.id,
        name: r.name,
        ratePercent: r.ratePercent.toFixed(2),
        region: r.region,
        isInclusive: r.isInclusive,
        isActive: r.isActive,
      })),
    };
  }

  async create(dto: CreateTaxRuleDto, actorId: string) {
    const rule = await this.prisma.taxRule.create({
      data: {
        name: dto.name,
        ratePercent: new Decimal(dto.ratePercent),
        region: dto.region,
        isInclusive: dto.isInclusive,
      },
    });

    await this.audit.log({
      actor: { id: actorId, role: 'ADMIN' },
      entity: 'TaxRule',
      entityId: rule.id,
      action: 'TAX_RULE_CREATED',
      after: rule,
    });

    return rule;
  }
}

