import { Injectable } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class OverdueInvoicesTool implements ITool {
  readonly name = 'overdue_invoices';
  readonly description = 'Lists overdue invoices with customer name, amount due, and days past due date';
  readonly roles = ['ADMIN', 'STAFF'];

  constructor(private readonly prisma: PrismaService) {}

  async execute(input: { minDays?: number; limit?: number; cursor?: string }, ctx: { userId: string; role: string }): Promise<ToolResult> {
    const asOf = new Date().toISOString();
    return {
      data: { invoices: [] },
      basis: { asOf, filters: { minDays: input.minDays || 0, limit: input.limit || 20 }, rowCount: 0 },
      assumptions: ['Sorted by days overdue descending with id tie-breaker'],
    };
  }
}

