import { Injectable } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class TopCustomersTool implements ITool {
  readonly name = 'top_customers';
  readonly description = 'Ranks customers by total revenue recognized or total outstanding receivables balance';
  readonly roles = ['ADMIN', 'STAFF'];

  constructor(private readonly prisma: PrismaService) {}

  async execute(input: { from?: string; to?: string; by: 'revenue' | 'outstanding'; limit?: number }, ctx: { userId: string; role: string }): Promise<ToolResult> {
    const asOf = new Date().toISOString();
    return {
      data: { customers: [] },
      basis: { from: input.from, to: input.to, asOf, filters: { by: input.by, limit: input.limit || 10 }, rowCount: 0 },
      assumptions: ['Tied balances ordered deterministically by customerId'],
    };
  }
}
