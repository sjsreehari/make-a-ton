import Decimal from 'decimal.js';

export interface TaxRuleInput {
  id?: string;
  name: string;
  ratePercent: Decimal | string | number;
  isInclusive?: boolean;
}

export interface DiscountInput {
  type: 'FIXED' | 'PERCENTAGE';
  value: Decimal | string | number;
}

export interface LineItemInput {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: Decimal | string | number;
  discount?: DiscountInput;
  taxes?: TaxRuleInput[];
  kind?: string;
}

export interface CalculatedLineTax {
  name: string;
  ratePercent: Decimal;
  taxAmount: Decimal;
  isInclusive: boolean;
}

export interface CalculatedLine {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: Decimal;
  lineGross: Decimal;
  discountAmount: Decimal;
  taxableAmount: Decimal;
  lineSubtotal: Decimal;
  taxes: CalculatedLineTax[];
  taxAmount: Decimal;
  lineTotal: Decimal;
  kind: string;
}

export interface TaxBreakdownEntry {
  name: string;
  ratePercent: Decimal;
  taxableAmount: Decimal;
  taxAmount: Decimal;
  isInclusive: boolean;
}

export interface CalculationResult {
  lines: CalculatedLine[];
  subtotal: Decimal;
  lineDiscountTotal: Decimal;
  documentDiscountTotal: Decimal;
  discountTotal: Decimal;
  taxBreakdown: TaxBreakdownEntry[];
  taxTotal: Decimal;
  total: Decimal;
}

/**
 * Deterministically rounds decimal values to 2 decimal places using HALF_UP.
 */
export function roundMoney(amount: Decimal | string | number): Decimal {
  return new Decimal(amount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

/**
 * Calculates complete line-item and document totals.
 *
 * ORDER OF OPERATIONS:
 * 1. Line gross = unitPrice * quantity
 * 2. Line discount = fixed or percentage applied to gross
 * 3. Line taxable amount = line gross - line discount
 * 4. Line taxes (up to 2 tax rules):
 *    - Exclusive: tax = taxable * (rate / 100), added to line total
 *    - Inclusive: base = taxable / (1 + sum(rates)/100), tax = taxable - base
 * 5. Document subtotal = sum of line subtotals
 * 6. Document discount = fixed or percentage applied to document subtotal
 * 7. Document tax breakdown and total aggregated deterministically with HALF_UP rounding
 * 8. Grand total = subtotal - document discount + exclusive tax total
 */
export function calculateInvoice(
  linesInput: LineItemInput[],
  documentDiscount?: DiscountInput,
): CalculationResult {
  const calculatedLines: CalculatedLine[] = [];
  const taxMap = new Map<string, TaxBreakdownEntry>();

  let grossSubtotal = new Decimal(0);
  let lineDiscountTotal = new Decimal(0);
  let totalExclusiveTax = new Decimal(0);
  let totalInclusiveTax = new Decimal(0);

  for (const line of linesInput) {
    const qty = new Decimal(line.quantity);
    const unitPrice = roundMoney(line.unitPrice);
    const lineGross = roundMoney(qty.times(unitPrice));

    // 1. Line discount
    let discountAmount = new Decimal(0);
    if (line.discount) {
      const discVal = new Decimal(line.discount.value);
      if (line.discount.type === 'PERCENTAGE') {
        discountAmount = roundMoney(lineGross.times(discVal).dividedBy(100));
      } else {
        discountAmount = roundMoney(Decimal.min(lineGross, discVal));
      }
    }
    lineDiscountTotal = lineDiscountTotal.plus(discountAmount);

    const taxableAmount = Decimal.max(0, lineGross.minus(discountAmount));

    // 2. Line taxes (up to 2 rules per line)
    const taxes = (line.taxes || []).slice(0, 2);
    const lineTaxes: CalculatedLineTax[] = [];
    let lineTaxTotal = new Decimal(0);
    let lineSubtotal = taxableAmount;
    let lineTotal = taxableAmount;

    const inclusiveTaxes = taxes.filter((t) => t.isInclusive);
    const exclusiveTaxes = taxes.filter((t) => !t.isInclusive);

    if (inclusiveTaxes.length > 0) {
      // Calculate inclusive tax portion
      const combinedRate = inclusiveTaxes.reduce(
        (sum, t) => sum.plus(new Decimal(t.ratePercent)),
        new Decimal(0),
      );
      const preTaxAmount = roundMoney(
        taxableAmount.dividedBy(new Decimal(1).plus(combinedRate.dividedBy(100))),
      );
      const totalIncTax = taxableAmount.minus(preTaxAmount);

      for (const t of inclusiveTaxes) {
        const rate = new Decimal(t.ratePercent);
        const taxShare = combinedRate.isZero()
          ? new Decimal(0)
          : roundMoney(totalIncTax.times(rate.dividedBy(combinedRate)));

        lineTaxes.push({
          name: t.name,
          ratePercent: rate,
          taxAmount: taxShare,
          isInclusive: true,
        });

        lineTaxTotal = lineTaxTotal.plus(taxShare);
        totalInclusiveTax = totalInclusiveTax.plus(taxShare);

        // Aggregate to breakdown
        const key = `${t.name}_${rate.toFixed(2)}_inc`;
        const entry = taxMap.get(key) || {
          name: t.name,
          ratePercent: rate,
          taxableAmount: new Decimal(0),
          taxAmount: new Decimal(0),
          isInclusive: true,
        };
        entry.taxableAmount = entry.taxableAmount.plus(preTaxAmount);
        entry.taxAmount = entry.taxAmount.plus(taxShare);
        taxMap.set(key, entry);
      }

      lineSubtotal = preTaxAmount;
      lineTotal = taxableAmount; // Inclusive tax is already inside the line total
    }

    if (exclusiveTaxes.length > 0) {
      for (const t of exclusiveTaxes) {
        const rate = new Decimal(t.ratePercent);
        const taxAmount = roundMoney(taxableAmount.times(rate).dividedBy(100));

        lineTaxes.push({
          name: t.name,
          ratePercent: rate,
          taxAmount,
          isInclusive: false,
        });

        lineTaxTotal = lineTaxTotal.plus(taxAmount);
        totalExclusiveTax = totalExclusiveTax.plus(taxAmount);

        // Aggregate to breakdown
        const key = `${t.name}_${rate.toFixed(2)}_exc`;
        const entry = taxMap.get(key) || {
          name: t.name,
          ratePercent: rate,
          taxableAmount: new Decimal(0),
          taxAmount: new Decimal(0),
          isInclusive: false,
        };
        entry.taxableAmount = entry.taxableAmount.plus(taxableAmount);
        entry.taxAmount = entry.taxAmount.plus(taxAmount);
        taxMap.set(key, entry);
      }

      lineTotal = lineSubtotal.plus(lineTaxTotal);
    }

    grossSubtotal = grossSubtotal.plus(lineSubtotal);

    calculatedLines.push({
      productId: line.productId,
      description: line.description,
      quantity: line.quantity,
      unitPrice,
      lineGross,
      discountAmount,
      taxableAmount,
      lineSubtotal,
      taxes: lineTaxes,
      taxAmount: lineTaxTotal,
      lineTotal,
      kind: line.kind || 'RECURRING',
    });
  }

  // 3. Document level discount
  let documentDiscountTotal = new Decimal(0);
  if (documentDiscount) {
    const discVal = new Decimal(documentDiscount.value);
    if (documentDiscount.type === 'PERCENTAGE') {
      documentDiscountTotal = roundMoney(grossSubtotal.times(discVal).dividedBy(100));
    } else {
      documentDiscountTotal = roundMoney(Decimal.min(grossSubtotal, discVal));
    }
  }

  const subtotal = roundMoney(grossSubtotal);
  const totalTax = roundMoney(totalExclusiveTax.plus(totalInclusiveTax));
  const linesTotal = calculatedLines.reduce((sum, l) => sum.plus(l.lineTotal), new Decimal(0));
  const finalTotal = roundMoney(
    Decimal.max(0, linesTotal.minus(documentDiscountTotal)),
  );

  return {
    lines: calculatedLines,
    subtotal,
    lineDiscountTotal: roundMoney(lineDiscountTotal),
    documentDiscountTotal: roundMoney(documentDiscountTotal),
    discountTotal: roundMoney(lineDiscountTotal.plus(documentDiscountTotal)),
    taxBreakdown: Array.from(taxMap.values()),
    taxTotal: totalTax,
    total: finalTotal,
  };
}
