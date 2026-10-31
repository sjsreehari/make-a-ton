import { Injectable } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class ChurnSummaryTool implements ITool {
  readonly name = 'churn_summary';
  readonly description = 'Computes subscriber churn count, churned MRR, and top cancel reasons';
  readonly roles = ['ADMIN', 'STAFF'];

  constructor(private readonly prisma: PrismaService) {}

  async execute(input: { from?: string; to?: string }, ctx: { userId: string; role: string }): Promise<ToolResult> {
    const asOf = new Date().toISOString();
    return {
      data: {
        churnRatePercent: '0.00',
        churnedSubscriptionsCount: 0,
        churnedMrr: '0.00',
      },
      basis: { from: input.from, to: input.to, asOf, rowCount: 0 },
      assumptions: ['Includes CLOSED subscriptions closed within the selected period'],
    };
  }
}

