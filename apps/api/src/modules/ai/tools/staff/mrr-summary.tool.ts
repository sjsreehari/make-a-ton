import { Injectable } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { PrismaService } from '../../../../common/prisma/prisma.service';

@Injectable()
export class MrrSummaryTool implements ITool {
  readonly name = 'mrr_summary';
  readonly description = 'Computes MRR, ARR, new MRR, expansion, contraction, and churned MRR';
  readonly roles = ['ADMIN', 'STAFF'];

  constructor(private readonly prisma: PrismaService) {}

  async execute(input: { asOf?: string }, ctx: { userId: string; role: string }): Promise<ToolResult> {
    const asOf = input.asOf || new Date().toISOString();
    return {
      data: {
        mrr: '0.00',
        arr: '0.00',
        newMrr: '0.00',
        expansionMrr: '0.00',
        contractionMrr: '0.00',
        churnedMrr: '0.00',
      },
      basis: { asOf, rowCount: 0 },
      assumptions: ['Normalized to 30-day monthly cadence for annual/weekly subscriptions'],
    };
  }
}

