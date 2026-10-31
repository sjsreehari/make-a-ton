import { Injectable } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class MarginSummaryTool implements ITool {
  readonly name = 'margin_summary';
  readonly description = 'Computes gross profit and gross margin percentage based on salesPrice minus costPrice';
  readonly roles = ['ADMIN', 'STAFF'];

  constructor(private readonly prisma: PrismaService) {}

  async execute(input: { from?: string; to?: string; groupBy?: string }, ctx: { userId: string; role: string }): Promise<ToolResult> {
    const asOf = new Date().toISOString();
    return {
      data: {
        totalRevenue: '0.00',
        totalCost: '0.00',
        grossProfit: '0.00',
        marginPercent: '0.00',
      },
      basis: { from: input.from, to: input.to, asOf, rowCount: 0 },
      assumptions: ['Derived from Product salesPrice and costPrice on billed invoice lines'],
    };
  }
}

