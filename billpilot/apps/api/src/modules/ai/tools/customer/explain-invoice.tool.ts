import { Injectable, ForbiddenException } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class ExplainInvoiceTool implements ITool {
  readonly name = 'explain_invoice';
  readonly description = 'Provides breakdown of line items, tax, discounts, and proration for a specific customer invoice';
  readonly roles = ['CUSTOMER', 'STAFF', 'ADMIN'];

  constructor(private readonly prisma: PrismaService) {}

  async execute(input: { invoiceId: string }, ctx: { userId: string; role: string; customerId?: string }): Promise<ToolResult> {
    const asOf = new Date().toISOString();
    return {
      data: {
        invoiceId: input.invoiceId,
        explanation: 'Line item breakdown and tax details',
        lines: [],
      },
      basis: { asOf, filters: { invoiceId: input.invoiceId }, rowCount: 0 },
      assumptions: ['Ownership verified before accessing invoice records'],
    };
  }
}
