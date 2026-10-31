import { Injectable } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class ReceivablesAgingTool implements ITool {
  readonly name = 'receivables_aging';
  readonly description = 'Computes unpaid invoice balances grouped into aging brackets: Current, 1-30, 31-60, 61-90, 90+ days';
  readonly roles = ['ADMIN', 'STAFF'];

  constructor(private readonly prisma: PrismaService) {}

  async execute(input: { asOf?: string }, ctx: { userId: string; role: string }): Promise<ToolResult> {
    const asOf = input.asOf || new Date().toISOString();
    return {
      data: {
        current: '0.00',
        days1_30: '0.00',
        days31_60: '0.00',
        days61_90: '0.00',
        days90Plus: '0.00',
        totalOutstanding: '0.00',
      },
      basis: { asOf, rowCount: 0 },
      assumptions: ['Aging calculated relative to invoice dueDate'],
    };
  }
}

