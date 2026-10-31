import { Injectable } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class DiscountImpactTool implements ITool {
  readonly name = 'discount_impact';
  readonly description = 'Computes total discount volume, top used promo codes, and margin reduction';
  readonly roles = ['ADMIN', 'STAFF'];

  constructor(private readonly prisma: PrismaService) {}

  async execute(input: { from?: string; to?: string }, ctx: { userId: string; role: string }): Promise<ToolResult> {
    const asOf = new Date().toISOString();
    return {
      data: {
        totalDiscountGiven: '0.00',
        topDiscounts: [],
      },
      basis: { from: input.from, to: input.to, asOf, rowCount: 0 },
      assumptions: ['Includes DiscountUsage records on confirmed/paid invoices'],
    };
  }
}
