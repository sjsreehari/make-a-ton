import { Injectable, BadRequestException } from '@nestjs/common';

const ALLOWLISTED_RELATIONS = new Set([
  'v_invoices',
  'v_subscriptions',
  'v_payments',
  'v_customers',
  'v_mrr_monthly',
  'v_expenses',
]);

const FORBIDDEN_KEYWORDS = [
  'delete',
  'drop',
  'update',
  'insert',
  'alter',
  'truncate',
  'create',
  'grant',
  'revoke',
  'execute',
  'pg_',
  'information_schema',
];

@Injectable()
export class SqlValidatorService {
  validateAndEnforceLimit(sql: string): string {
    const trimmed = sql.trim();

    // Check for comments
    if (trimmed.includes('--') || trimmed.includes('/*') || trimmed.includes('*/')) {
      throw new BadRequestException('SQL query must not contain comments.');
    }

    // Check for semicolons / multiple statements
    const statements = trimmed.split(';').filter(s => s.trim().length > 0);
    if (statements.length > 1) {
      throw new BadRequestException('Only single SQL statements are allowed.');
    }

    const singleQuery = statements[0];
    const lower = singleQuery.toLowerCase();

    // Check starting statement
    if (!lower.startsWith('select') && !lower.startsWith('with')) {
      throw new BadRequestException('Query must be a SELECT or WITH statement.');
    }

    // Check forbidden mutation keywords
    for (const kw of FORBIDDEN_KEYWORDS) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(lower)) {
        throw new BadRequestException(`Query contains forbidden keyword: ${kw}`);
      }
    }

    // Enforce LIMIT 200
    if (!/limit\s+\d+/i.test(singleQuery)) {
      return `${singleQuery} LIMIT 200`;
    }

    return singleQuery.replace(/limit\s+\d+/i, 'LIMIT 200');
  }
}

