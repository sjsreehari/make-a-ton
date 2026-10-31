import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import {
  deriveInvoiceDisplayStatus,
  formatDocumentNumber,
} from '../src/modules/billing/invoice-numbering';

describe('InvoiceLifecycle - Status Derivation and Numbering Patterns', () => {
  it('formats customizable number patterns with tokens', () => {
    const fixedDate = new Date(Date.UTC(2026, 9, 31)); // Oct 31, 2026

    expect(formatDocumentNumber('INV-{year}-{seq:6}', 42, fixedDate)).toBe('INV-2026-000042');
    expect(formatDocumentNumber('BILL/{yyyy}/{mm}/{seq:4}', 5, fixedDate)).toBe('BILL/2026/10/0005');
    expect(formatDocumentNumber('{yy}-{seq:3}', 7, fixedDate)).toBe('26-007');
    expect(formatDocumentNumber('CN-{year}-{seq:6}', 1, fixedDate)).toBe('CN-2026-000001');
  });

  it('correctly derives PARTIAL status when invoice has partial payments', () => {
    const status = deriveInvoiceDisplayStatus({
      status: 'CONFIRMED',
      amountPaid: new Decimal(500),
      amountDue: new Decimal(500),
      total: new Decimal(1000),
      dueDate: new Date(Date.now() + 86400000),
    });

    expect(status).toBe('PARTIAL');
  });

  it('correctly derives OVERDUE status when past due date with balance', () => {
    const pastDate = new Date(Date.now() - 5 * 86400000);
    const status = deriveInvoiceDisplayStatus({
      status: 'CONFIRMED',
      amountPaid: new Decimal(0),
      amountDue: new Decimal(1000),
      total: new Decimal(1000),
      dueDate: pastDate,
    });

    expect(status).toBe('OVERDUE');
  });

  it('correctly derives SENT status when confirmed and sentAt timestamp is set', () => {
    const futureDate = new Date(Date.now() + 5 * 86400000);
    const status = deriveInvoiceDisplayStatus({
      status: 'CONFIRMED',
      amountPaid: new Decimal(0),
      amountDue: new Decimal(1000),
      total: new Decimal(1000),
      dueDate: futureDate,
      sentAt: new Date(),
    });

    expect(status).toBe('SENT');
  });

  it('correctly derives PAID and REVERSED statuses', () => {
    const paidStatus = deriveInvoiceDisplayStatus({
      status: 'PAID',
      amountPaid: new Decimal(1000),
      amountDue: new Decimal(0),
      total: new Decimal(1000),
      dueDate: new Date(),
    });
    expect(paidStatus).toBe('PAID');

    const reversedStatus = deriveInvoiceDisplayStatus({
      status: 'CANCELLED',
      amountPaid: new Decimal(0),
      amountDue: new Decimal(0),
      total: new Decimal(1000),
      dueDate: new Date(),
      hasReversal: true,
    });
    expect(reversedStatus).toBe('REVERSED');
  });
});

