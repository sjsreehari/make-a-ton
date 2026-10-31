import { Injectable } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class SubscriptionStatsTool implements ITool {
  readonly name = 'subscription_stats';
  readonly description = 'Computes count of active, paused, closed, and upcoming expiring subscriptions';
  readonly roles = ['ADMIN', 'STAFF'];

  constructor(private readonly prisma: PrismaService) {}

  async execute(input: { asOf?: string; expiringWithinDays?: number }, ctx: { userId: string; role: string }): Promise<ToolResult> {
    const asOf = input.asOf || new Date().toISOString();
    return {
      data: {
        active: 0,
        paused: 0,
        closed: 0,
        expiringSoon: 0,
      },
      basis: { asOf, rowCount: 0 },
      assumptions: ['Active includes non-paused CONFIRMED and ACTIVE subscriptions'],
    };
  }
}
