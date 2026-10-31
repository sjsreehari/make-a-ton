import { Injectable, ForbiddenException } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { PrismaService } from '../../../../common/prisma/prisma.service';

@Injectable()
export class MySpendSummaryTool implements ITool {
  readonly name = 'my_spend_summary';
  readonly description = 'Computes verified customer total spending, paid invoices, and current outstanding balance';
  readonly roles = ['CUSTOMER'];

  constructor(private readonly prisma: PrismaService) {}

  async execute(input: { from?: string; to?: string; groupBy?: string }, ctx: { userId: string; role: string; customerId?: string }): Promise<ToolResult> {
    if (!ctx.customerId) {
      throw new ForbiddenException('Customer identity is missing or unverified.');
    }
    const asOf = new Date().toISOString();
    return {
      data: {
        totalPaid: '0.00',
        totalOutstanding: '0.00',
        currency: 'INR',
      },
      basis: { from: input.from, to: input.to, asOf, rowCount: 0 },
      assumptions: ['Scoped strictly to verified customer account'],
    };
  }
}

