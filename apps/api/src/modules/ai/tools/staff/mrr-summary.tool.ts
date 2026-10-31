import { Injectable } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { MrrService } from '../../../insights/mrr.service';

@Injectable()
export class MrrSummaryTool implements ITool {
  readonly name = 'mrr_summary';
  readonly description = 'Computes MRR, ARR, new MRR, expansion, contraction, and churned MRR';
  readonly roles = ['ADMIN', 'STAFF'];

  constructor(private readonly mrrService: MrrService) {}

  async execute(input: { asOf?: string }, ctx: { userId: string; role: string }): Promise<ToolResult> {
    const asOf = input.asOf || new Date().toISOString();
    const metrics = await this.mrrService.calculateLiveMetrics();
    return {
      data: {
        mrr: metrics.mrr.toFixed(2),
        arr: metrics.arr.toFixed(2),
        newMrr: metrics.newMrr.toFixed(2),
        expansionMrr: metrics.expansionMrr.toFixed(2),
        contractionMrr: metrics.contractionMrr.toFixed(2),
        churnedMrr: metrics.churnedMrr.toFixed(2),
        activeCount: metrics.activeCount,
      },
      basis: { asOf, rowCount: metrics.activeCount },
      assumptions: ['Normalized to 30-day monthly cadence for annual/weekly subscriptions'],
    };
  }
}

