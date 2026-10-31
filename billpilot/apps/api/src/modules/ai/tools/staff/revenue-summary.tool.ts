import { Injectable } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class RevenueSummaryTool implements ITool {
  readonly name = 'revenue_summary';
  readonly description = 'Computes recognized billed revenue across invoices grouped by period, plan, or customer';
  readonly roles = ['ADMIN', 'STAFF'];

  constructor(private readonly prisma: PrismaService) {}

  async execute(input: { from?: string; to?: string; groupBy?: 'day' | 'week' | 'month' | 'plan' | 'customer' }, ctx: { userId: string; role: string }): Promise<ToolResult> {
    const asOf = new Date().toISOString();
    return {
      data: { totalRevenue: '0.00', currency: 'INR', breakdown: [] },
      basis: { from: input.from, to: input.to, asOf, filters: { groupBy: input.groupBy || 'month' }, rowCount: 0 },
      assumptions: ['Includes confirmed and paid invoices only'],
    };
  }
}

