import { describe, it, expect } from 'vitest';
import { SqlValidatorService } from '../src/modules/ai/guard/sql-validator.service';

describe('SqlValidatorService (MySQL 8.0 & Security Rules)', () => {
  const validator = new SqlValidatorService();

  it('allows safe query on v_invoices and injects optimizer timeout and LIMIT 200', () => {
    const sql = 'SELECT id, number, total FROM v_invoices WHERE effectiveStatus = "OVERDUE"';
    const result = validator.validateAndEnforceLimit(sql);

    expect(result).toContain('/*+ MAX_EXECUTION_TIME(3000) */');
    expect(result).toContain('LIMIT 200');
    expect(result).toContain('v_invoices');
  });

  it('caps user requested limit to 200', () => {
    const sql = 'SELECT * FROM v_customers LIMIT 500';
    const result = validator.validateAndEnforceLimit(sql);

    expect(result).toContain('LIMIT 200');
    expect(result).not.toContain('LIMIT 500');
  });

  it('allows safe query on v_subscriptions and v_payments', () => {
    const sql = 'SELECT s.id, p.amount FROM v_subscriptions s JOIN v_payments p ON p.customerId = s.customerId';
    const result = validator.validateAndEnforceLimit(sql);

    expect(result).toContain('v_subscriptions');
    expect(result).toContain('v_payments');
  });

  it('rejects access to raw base tables', () => {
    expect(() => {
      validator.validateAndEnforceLimit('SELECT * FROM Customer');
    }).toThrow(/AI query may only reference allowlisted views/);

    expect(() => {
      validator.validateAndEnforceLimit('SELECT * FROM Invoice');
    }).toThrow(/AI query may only reference allowlisted views/);
  });

  it('rejects forbidden mutation keywords (INSERT, UPDATE, DELETE, DROP)', () => {
    expect(() => {
      validator.validateAndEnforceLimit('DROP TABLE v_invoices');
    }).toThrow();

    expect(() => {
      validator.validateAndEnforceLimit('DELETE FROM v_invoices WHERE id = 1');
    }).toThrow();

    expect(() => {
      validator.validateAndEnforceLimit('UPDATE v_customers SET name = "hacked"');
    }).toThrow();
  });

  it('rejects dangerous injection functions (SLEEP, BENCHMARK, USER, LOAD_FILE)', () => {
    expect(() => {
      validator.validateAndEnforceLimit('SELECT id, SLEEP(5) FROM v_invoices');
    }).toThrow(/forbidden function/);

    expect(() => {
      validator.validateAndEnforceLimit('SELECT BENCHMARK(1000000, MD5("a")) FROM v_invoices');
    }).toThrow(/forbidden function/);

    expect(() => {
      validator.validateAndEnforceLimit('SELECT USER() FROM v_invoices');
    }).toThrow(/forbidden function/);
  });

  it('rejects multi-statement queries', () => {
    expect(() => {
      validator.validateAndEnforceLimit('SELECT * FROM v_invoices; DROP TABLE Invoice');
    }).toThrow(/Only single SQL statements are allowed/);
  });

  it('rejects unauthorized comments', () => {
    expect(() => {
      validator.validateAndEnforceLimit('SELECT * FROM v_invoices -- comment');
    }).toThrow(/must not contain unauthorized comments/);
  });
});
