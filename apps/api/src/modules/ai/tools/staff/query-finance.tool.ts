import { Injectable, Logger } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { SqlValidatorService } from '../../guard/sql-validator.service';

@Injectable()
export class QueryFinanceTool implements ITool {
  private readonly logger = new Logger(QueryFinanceTool.name);
  readonly name = 'query_finance';
  readonly description = 'Executes a validated read-only SQL query against allowlisted views for advanced questions';
  readonly roles = ['ADMIN', 'STAFF'];

  constructor(
    private readonly prisma: PrismaService,
    private readonly sqlValidator: SqlValidatorService,
  ) {}

  async execute(input: { question: string; generatedSql?: string }, ctx: { userId: string; role: string }): Promise<ToolResult> {
    const asOf = new Date().toISOString();
    let rows: any[] = [];
    let executedSql = input.generatedSql;

    if (executedSql) {
      try {
        const validated = this.sqlValidator.validateAndEnforceLimit(executedSql);
        executedSql = validated;
        rows = (await this.prisma.$queryRawUnsafe(validated)) as any[];

        // Log AI query execution
        await this.prisma.aiQueryLog.create({
          data: {
            userId: ctx.userId,
            question: input.question,
            generatedSql: executedSql,
            success: true,
          },
        }).catch(() => {});
      } catch (err: any) {
        this.logger.warn(`AI SQL query failed: ${err.message}`);
        await this.prisma.aiQueryLog.create({
          data: {
            userId: ctx.userId,
            question: input.question,
            generatedSql: executedSql,
            success: false,
            error: err.message,
          },
        }).catch(() => {});

        throw err;
      }
    }

    return {
      data: { rows },
      basis: { asOf, filters: { question: input.question, sql: executedSql }, rowCount: rows.length },
      assumptions: ['Executed on read-only views with 3s statement timeout and LIMIT 200'],
    };
  }
}
