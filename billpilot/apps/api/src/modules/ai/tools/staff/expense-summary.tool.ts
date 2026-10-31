import { Injectable } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';

@Injectable()
export class ExpenseSummaryTool implements ITool {
  readonly name = 'expense_summary';
  readonly description = 'Computes operational expenses (returns available: false if no Expense table exists)';
  readonly roles = ['ADMIN', 'STAFF'];

  async execute(input: { from?: string; to?: string; groupBy?: string }, ctx: { userId: string; role: string }): Promise<ToolResult> {
    const asOf = new Date().toISOString();
    return {
      data: {
        available: false,
        reason: 'Expense tracking table is not configured in this release.',
      },
      basis: { from: input.from, to: input.to, asOf, rowCount: 0 },
      assumptions: ['No Expense entity found in schema'],
    };
  }
}

