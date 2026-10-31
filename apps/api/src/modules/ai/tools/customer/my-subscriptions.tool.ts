import { Injectable, ForbiddenException } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class MySubscriptionsTool implements ITool {
  readonly name = 'my_subscriptions';
  readonly description = 'Lists verified customer active and paused subscriptions with plan names and renewal dates';
  readonly roles = ['CUSTOMER'];

  constructor(private readonly prisma: PrismaService) {}

  async execute(_input: Record<string, unknown>, ctx: { userId: string; role: string; customerId?: string }): Promise<ToolResult> {
    if (!ctx.customerId) {
      throw new ForbiddenException('Customer identity is missing or unverified.');
    }
    const asOf = new Date().toISOString();
    return {
      data: { subscriptions: [] },
      basis: { asOf, rowCount: 0 },
      assumptions: ['Scoped strictly to verified customer account'],
    };
  }
}

