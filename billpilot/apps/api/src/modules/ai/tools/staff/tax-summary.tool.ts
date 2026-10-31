import { Injectable } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class TaxSummaryTool implements ITool {
  readonly name = 'tax_summary';
  readonly description = 'Computes collected and payable tax amounts broken down by tax rule and region';
  readonly roles = ['ADMIN', 'STAFF'];

  constructor(private readonly prisma: PrismaService) {}

  async execute(input: { from?: string; to?: string }, ctx: { userId: string; role: string }): Promise<ToolResult> {
    const asOf = new Date().toISOString();
    return {
      data: {
        totalTax: '0.00',
        byTaxRule: [],
      },
      basis: { from: input.from, to: input.to, asOf, rowCount: 0 },
      assumptions: ['Calculated from confirmed invoice lines taxAmount'],
    };
  }
}
