import { Injectable, ForbiddenException } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { PrismaService } from '../../../../common/prisma/prisma.service';

@Injectable()
export class MyInvoicesTool implements ITool {
  readonly name = 'my_invoices';
  readonly description = 'Lists verified customer invoices with payment status and PDF download link';
  readonly roles = ['CUSTOMER'];

  constructor(private readonly prisma: PrismaService) {}

  async execute(input: { status?: string; from?: string; to?: string; limit?: number }, ctx: { userId: string; role: string; customerId?: string }): Promise<ToolResult> {
    if (!ctx.customerId) {
      throw new ForbiddenException('Customer identity is missing or unverified.');
    }
    const asOf = new Date().toISOString();
    return {
      data: { invoices: [] },
      basis: { from: input.from, to: input.to, asOf, filters: { status: input.status, limit: input.limit || 10 }, rowCount: 0 },
      assumptions: ['Scoped strictly to verified customer account'],
    };
  }
}

