import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { calculateInvoice } from '../src/modules/billing/billing-calculator';

describe('BillingCalculator - Taxes and Discounts Matrix', () => {
  it('calculates single exclusive tax correctly', () => {
    const result = calculateInvoice([
      {
        description: 'Standard Software License',
        quantity: 2,
        unitPrice: '500.00',
        taxes: [
          {
            name: 'GST 18%',
            ratePercent: '18.00',
            isInclusive: false,
          },
        ],
      },
    ]);

    expect(result.subtotal.toFixed(2)).toBe('1000.00');
    expect(result.taxTotal.toFixed(2)).toBe('180.00');
    expect(result.total.toFixed(2)).toBe('1180.00');
    expect(result.taxBreakdown).toHaveLength(1);
    expect(result.taxBreakdown[0].taxAmount.toFixed(2)).toBe('180.00');
  });

  it('calculates dual exclusive taxes per line (e.g. CGST + SGST)', () => {
    const result = calculateInvoice([
      {
        description: 'Cloud Hosting Tier 2',
        quantity: 1,
        unitPrice: '1000.00',
        taxes: [
          { name: 'CGST 9%', ratePercent: '9.00', isInclusive: false },
          { name: 'SGST 9%', ratePercent: '9.00', isInclusive: false },
        ],
      },
    ]);

    expect(result.subtotal.toFixed(2)).toBe('1000.00');
    expect(result.taxTotal.toFixed(2)).toBe('180.00');
    expect(result.total.toFixed(2)).toBe('1180.00');
    expect(result.taxBreakdown).toHaveLength(2);
    expect(result.taxBreakdown[0].taxAmount.toFixed(2)).toBe('90.00');
    expect(result.taxBreakdown[1].taxAmount.toFixed(2)).toBe('90.00');
  });

  it('calculates inclusive tax without distortion or price drift', () => {
    // ₹1180 total including 18% GST -> base = 1000.00, tax = 180.00
    const result = calculateInvoice([
      {
        description: 'All-inclusive Consultation Package',
        quantity: 1,
        unitPrice: '1180.00',
        taxes: [
          { name: 'Inclusive GST 18%', ratePercent: '18.00', isInclusive: true },
        ],
      },
    ]);

    expect(result.subtotal.toFixed(2)).toBe('1000.00');
    expect(result.taxTotal.toFixed(2)).toBe('180.00');
    expect(result.total.toFixed(2)).toBe('1180.00');
  });

  it('applies percentage and fixed line discounts before calculating tax', () => {
    const result = calculateInvoice([
      {
        description: 'Seat License with 20% discount',
        quantity: 2,
        unitPrice: '1000.00', // gross = 2000.00
        discount: { type: 'PERCENTAGE', value: '20.00' }, // disc = 400.00 -> taxable = 1600.00
        taxes: [{ name: 'GST 10%', ratePercent: '10.00', isInclusive: false }], // tax = 160.00
      },
    ]);

    expect(result.lineDiscountTotal.toFixed(2)).toBe('400.00');
    expect(result.subtotal.toFixed(2)).toBe('1600.00');
    expect(result.taxTotal.toFixed(2)).toBe('160.00');
    expect(result.total.toFixed(2)).toBe('1760.00');
  });

  it('combines line discounts, document discount, and dual taxes deterministically', () => {
    const result = calculateInvoice(
      [
        {
          description: 'Product A',
          quantity: 1,
          unitPrice: '100.00',
          discount: { type: 'FIXED', value: '10.00' }, // taxable = 90.00
          taxes: [{ name: 'Tax 10%', ratePercent: '10.00', isInclusive: false }], // 9.00
        },
      ],
      { type: 'FIXED', value: '20.00' }, // Doc discount: 20.00 off 90.00 = 70.00 + 9.00 tax = 79.00
    );

    expect(result.subtotal.toFixed(2)).toBe('90.00');
    expect(result.documentDiscountTotal.toFixed(2)).toBe('20.00');
    expect(result.taxTotal.toFixed(2)).toBe('9.00');
    expect(result.total.toFixed(2)).toBe('79.00');
  });
});
