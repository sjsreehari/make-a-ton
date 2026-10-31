import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export function add(a: Decimal | string | number, b: Decimal | string | number): Decimal {
  return new Decimal(a).plus(new Decimal(b));
}

export function sub(a: Decimal | string | number, b: Decimal | string | number): Decimal {
  return new Decimal(a).minus(new Decimal(b));
}

export function mul(a: Decimal | string | number, b: Decimal | string | number): Decimal {
  return new Decimal(a).times(new Decimal(b));
}

export function div(a: Decimal | string | number, b: Decimal | string | number): Decimal {
  return new Decimal(a).dividedBy(new Decimal(b));
}

export function round2(n: Decimal | string | number): Decimal {
  return new Decimal(n).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function toMoneyString(n: Decimal | string | number): string {
  return round2(n).toFixed(2);
}

export function allocate(amount: Decimal | string | number, ratios: number[]): Decimal[] {
  const total = ratios.reduce((acc, r) => acc + r, 0);
  if (total === 0) return ratios.map(() => new Decimal(0));

  const decAmount = new Decimal(amount);
  let allocatedSum = new Decimal(0);

  const results = ratios.map((ratio) => {
    const part = round2(decAmount.times(ratio).dividedBy(total));
    allocatedSum = allocatedSum.plus(part);
    return part;
  });

  const diff = decAmount.minus(allocatedSum);
  if (!diff.isZero()) {
    results[0] = results[0].plus(diff);
  }

  return results;
}
