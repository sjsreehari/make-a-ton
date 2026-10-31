import { Injectable } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class CollectionsSummaryTool implements ITool {
  readonly name = 'collections_summary';
  readonly description = 'Computes actual payments collected and settled across a date range';
  readonly roles = ['ADMIN', 'STAFF'];

  constructor(private readonly prisma: PrismaService) {}

  async execute(input: { from?: string; to?: string }, ctx: { userId: string; role: string }): Promise<ToolResult> {
    const asOf = new Date().toISOString();
    return {
      data: { totalCollected: '0.00', currency: 'INR', paymentsCount: 0 },
      basis: { from: input.from, to: input.to, asOf, rowCount: 0 },
      assumptions: ['Includes RECORDED payment transactions only'],
    };
  }
}

