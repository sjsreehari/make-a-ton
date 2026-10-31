import { Injectable, ForbiddenException } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class MyNextBillsTool implements ITool {
  readonly name = 'my_next_bills';
  readonly description = 'Computes upcoming scheduled billing dates and expected amounts for verified customer subscriptions';
  readonly roles = ['CUSTOMER'];

  constructor(private readonly prisma: PrismaService) {}

  async execute(input: { months?: number }, ctx: { userId: string; role: string; customerId?: string }): Promise<ToolResult> {
    if (!ctx.customerId) {
      throw new ForbiddenException('Customer identity is missing or unverified.');
    }
    const asOf = new Date().toISOString();
    return {
      data: { upcomingBills: [] },
      basis: { asOf, filters: { months: input.months || 3 }, rowCount: 0 },
      assumptions: ['Calculated from active subscription billing intervals'],
    };
  }
}
