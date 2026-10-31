import { Injectable, BadRequestException } from '@nestjs/common';
import { MAX_AI_QUERY_RESULTS, AI_STATEMENT_TIMEOUT_MS } from '@billpilot/shared';

const ALLOWLISTED_VIEWS = new Set([
  'v_invoices',
  'v_subscriptions',
  'v_payments',
  'v_customers',
]);

const FORBIDDEN_KEYWORDS = [
  'insert',
  'update',
  'delete',
  'drop',
  'alter',
  'truncate',
  'create',
  'replace',
  'grant',
  'revoke',
  'execute',
  'call',
  'set',
  'show',
  'describe',
  'explain',
  'outfile',
  'dumpfile',
  'load_file',
  'load data',
];

const FORBIDDEN_FUNCTIONS = [
  'sleep',
  'benchmark',
  'user',
  'current_user',
  'version',
  'database',
  'schema',
  'connection_id',
  'system_user',
  'session_user',
  'load_file',
  'pg_',
  'information_schema',
  'performance_schema',
  'mysql.',
  'sys.',
];

@Injectable()
export class SqlValidatorService {
  /**
   * Validates that SQL query strictly conforms to read-only MySQL 8.0 standards
   * against allowed views (v_invoices, v_subscriptions, v_payments, v_customers),
   * enforces single statement execution, injects timeout hints, and caps limits at 200.
   */
  validateAndEnforceLimit(sql: string): string {
    let trimmed = sql.trim();

    // 1. Check for dangerous non-optimizer comments
    // Strip optimizer hint first to inspect any trailing comments
    const withoutOptimizerHint = trimmed.replace(/\/\*\+\s*MAX_EXECUTION_TIME\(\d+\)\s*\*\//i, '');
    if (withoutOptimizerHint.includes('--') || withoutOptimizerHint.includes('/*') || withoutOptimizerHint.includes('*/')) {
      throw new BadRequestException('SQL query must not contain unauthorized comments.');
    }

    // 2. Enforce single statement execution
    const statements = trimmed.split(';').map((s) => s.trim()).filter((s) => s.length > 0);
    if (statements.length > 1) {
      throw new BadRequestException('Only single SQL statements are allowed.');
    }
    if (statements.length === 0) {
      throw new BadRequestException('Empty SQL query.');
    }

    let query = statements[0];
    const lower = query.toLowerCase();

    // 3. Must begin with SELECT or WITH
    if (!lower.startsWith('select') && !lower.startsWith('with')) {
      throw new BadRequestException('Query must be a SELECT or WITH statement.');
    }

    // 4. Reject forbidden mutation & DDL keywords
    for (const kw of FORBIDDEN_KEYWORDS) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(lower)) {
        throw new BadRequestException(`Query contains forbidden keyword: ${kw}`);
      }
    }

    // 5. Reject forbidden diagnostic & injection functions
    for (const fn of FORBIDDEN_FUNCTIONS) {
      const regex = new RegExp(`\\b${fn}`, 'i');
      if (regex.test(lower)) {
        throw new BadRequestException(`Query contains forbidden function or relation: ${fn}`);
      }
    }

    // 6. Enforce that tables referenced in FROM or JOIN are allowed views starting with v_
    const tableRegex = /\b(?:from|join)\s+([`"]?)([a-zA-Z0-9_]+)\1/gi;
    let match: RegExpExecArray | null;
    while ((match = tableRegex.exec(query)) !== null) {
      const tableName = match[2].toLowerCase();
      // Allow CTE subqueries or view names starting with v_
      if (!tableName.startsWith('v_')) {
        // If not a view starting with v_, reject base table access
        throw new BadRequestException(
          `AI query may only reference allowlisted views (v_invoices, v_subscriptions, v_payments, v_customers). Table '${tableName}' is not allowed.`,
        );
      }
      if (!ALLOWLISTED_VIEWS.has(tableName)) {
        throw new BadRequestException(
          `View '${tableName}' is not an authorized AI view. Must be one of: ${Array.from(ALLOWLISTED_VIEWS).join(', ')}`,
        );
      }
    }

    // 7. Inject optimizer timeout hint /*+ MAX_EXECUTION_TIME(3000) */
    const timeoutHint = `/*+ MAX_EXECUTION_TIME(${AI_STATEMENT_TIMEOUT_MS}) */`;
    if (!/MAX_EXECUTION_TIME/i.test(query)) {
      if (/^select\b/i.test(query)) {
        query = query.replace(/^select\b/i, `SELECT ${timeoutHint}`);
      } else if (/^with\b/i.test(query)) {
        query = query.replace(/\bselect\b/i, `SELECT ${timeoutHint}`);
      }
    }

    // 8. Enforce LIMIT <= 200 (MAX_AI_QUERY_RESULTS)
    const limitMatch = query.match(/limit\s+(\d+)/i);
    if (!limitMatch) {
      query = `${query} LIMIT ${MAX_AI_QUERY_RESULTS}`;
    } else {
      const requestedLimit = parseInt(limitMatch[1], 10);
      if (requestedLimit > MAX_AI_QUERY_RESULTS || requestedLimit <= 0) {
        query = query.replace(/limit\s+\d+/i, `LIMIT ${MAX_AI_QUERY_RESULTS}`);
      }
    }

    return query;
  }
}
