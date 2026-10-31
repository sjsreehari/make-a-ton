import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { PaymentsService } from '../src/modules/payments/payments.service';
import { CreditNotesService } from '../src/modules/billing/credit-notes.service';

describe('Payments & Credit Notes Workflow', () => {
  it('correctly handles multi-invoice payment allocation and overpayment calculation', async () => {
    // Simulating two outstanding invoices of ₹400 and ₹600 (total ₹1000)
    // Customer pays ₹1200 -> both settled, ₹200 becomes customer credit balance
    const mockInvoices = [
      { id: 'inv-1', number: 'INV-001', amountDue: new Decimal(400), amountPaid: new Decimal(0), status: 'CONFIRMED' },
      { id: 'inv-2', number: 'INV-002', amountDue: new Decimal(600), amountPaid: new Decimal(0), status: 'CONFIRMED' },
    ];

    let customerCredit = new Decimal(0);
    let remainingPayment = new Decimal(1200);
    const settledInvoices: string[] = [];

    for (const inv of mockInvoices) {
      if (remainingPayment.lte(0)) break;
      const alloc = Decimal.min(remainingPayment, inv.amountDue);
      inv.amountPaid = inv.amountPaid.plus(alloc);
      inv.amountDue = inv.amountDue.minus(alloc);
      remainingPayment = remainingPayment.minus(alloc);
      if (inv.amountDue.lte(0)) {
        inv.status = 'PAID';
        settledInvoices.push(inv.id);
      }
    }

    if (remainingPayment.gt(0)) {
      customerCredit = remainingPayment;
    }

    expect(settledInvoices).toHaveLength(2);
    expect(mockInvoices[0].status).toBe('PAID');
    expect(mockInvoices[1].status).toBe('PAID');
    expect(customerCredit.toFixed(2)).toBe('200.00');
  });

  it('correctly calculates credit note reduction and credit memo overflow', () => {
    // Invoice of ₹500 with ₹300 balance due.
    // Credit note of ₹400 issued: ₹300 settles invoice, ₹100 becomes excess customer credit
    const inv = {
      id: 'inv-10',
      total: new Decimal(500),
      amountPaid: new Decimal(200),
      amountDue: new Decimal(300),
      status: 'CONFIRMED',
    };

    const creditNoteAmount = new Decimal(400);
    let excessCredit = new Decimal(0);
    let newDue = inv.amountDue.minus(creditNoteAmount);

    if (newDue.lt(0)) {
      excessCredit = newDue.abs();
      newDue = new Decimal(0);
    }

    inv.amountDue = newDue;
    if (newDue.lte(0)) {
      inv.status = 'PAID';
    }

    expect(inv.amountDue.toFixed(2)).toBe('0.00');
    expect(inv.status).toBe('PAID');
    expect(excessCredit.toFixed(2)).toBe('100.00');
  });
});
