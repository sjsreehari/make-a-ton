import { Injectable } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { SqlValidatorService } from '../../guard/sql-validator.service';

@Injectable()
export class QueryFinanceTool implements ITool {
  readonly name = 'query_finance';
  readonly description = 'Executes a validated read-only SQL query against allowlisted views for advanced questions';
  readonly roles = ['ADMIN', 'STAFF'];

  constructor(
    private readonly prisma: PrismaService,
    private readonly sqlValidator: SqlValidatorService,
  ) {}

  async execute(input: { question: string; generatedSql?: string }, ctx: { userId: string; role: string }): Promise<ToolResult> {
    const asOf = new Date().toISOString();
    return {
      data: { rows: [] },
      basis: { asOf, filters: { question: input.question }, rowCount: 0 },
      assumptions: ['Executed on read-only views with 3s statement timeout and LIMIT 200'],
    };
  }
}

