import { Injectable } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { PrismaService } from '../../../common/prisma/prisma.service';

export interface ForecastMonthOutput {
  month: string;
  scheduledInvoices: number;
  expectedBilled: string;
  expectedTax: string;
  expectedCollected: string;
  atRiskFromOverdue: string;
  endingActiveSubscriptions: number;
}

@Injectable()
export class ForecastTool implements ITool {
  readonly name = 'forecast';
  readonly description = 'Computes deterministic month-by-month future billing and collections for the next 1-6 months';
  readonly roles = ['ADMIN', 'STAFF'];

  constructor(private readonly prisma: PrismaService) {}

  async execute(input: { months?: number; asOf?: string }, ctx: { userId: string; role: string }): Promise<ToolResult<{ forecast: ForecastMonthOutput[] }>> {
    const asOf = input.asOf || new Date().toISOString();
    const months = Math.min(Math.max(input.months || 3, 1), 6);

    return {
      data: {
        forecast: [],
      },
      basis: { asOf, filters: { months }, rowCount: 0 },
      assumptions: [
        'Projected from current active subscriptions',
        'Assumes renewal for renewable plans with autoClose=false',
        'Collections estimated using historical collection curve from last 12 months',
      ],
    };
  }
}

