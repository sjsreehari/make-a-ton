import { BillingPeriod } from '@prisma/client';

/**
 * Calculates days in a given year and month (1-indexed month: 1 = Jan, 12 = Dec)
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Calculates the next billing date based on frequency with robust end-of-month math.
 * Avoids the JavaScript Date overflow bug (e.g., Jan 31 + 1 month becoming Mar 2/3).
 * Preserves anchorDay (e.g. Jan 31 -> Feb 28 -> Mar 31).
 */
export function calculateNextBillingDate(
  currentDate: Date,
  frequency: BillingPeriod,
  anchorDay?: number,
): Date {
  const date = new Date(currentDate);
  const anchor = anchorDay ?? date.getUTCDate();

  switch (frequency) {
    case BillingPeriod.DAILY: {
      const next = new Date(date);
      next.setUTCDate(next.getUTCDate() + 1);
      return next;
    }

    case BillingPeriod.WEEKLY: {
      const next = new Date(date);
      next.setUTCDate(next.getUTCDate() + 7);
      return next;
    }

    case BillingPeriod.MONTHLY: {
      let year = date.getUTCFullYear();
      let month = date.getUTCMonth() + 1; // 0-indexed to 1-indexed

      // Advance one month
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }

      const daysInTargetMonth = getDaysInMonth(year, month);
      const targetDay = Math.min(anchor, daysInTargetMonth);

      return new Date(Date.UTC(year, month - 1, targetDay, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()));
    }

    case BillingPeriod.YEARLY: {
      const year = date.getUTCFullYear() + 1;
      const month = date.getUTCMonth() + 1;
      const daysInTargetMonth = getDaysInMonth(year, month);
      const targetDay = Math.min(anchor, daysInTargetMonth);

      return new Date(Date.UTC(year, month - 1, targetDay, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()));
    }

    default: {
      const next = new Date(date);
      next.setUTCDate(next.getUTCDate() + 30);
      return next;
    }
  }
}

/**
 * Generates a preview list of the next N invoice dates for a subscription.
 */
export function previewNextInvoiceDates(
  startDate: Date,
  frequency: BillingPeriod,
  count = 3,
  fromDate?: Date,
  anchorDay?: number,
): Date[] {
  const dates: Date[] = [];
  let current = fromDate ? new Date(fromDate) : new Date(startDate);
  const effectiveAnchor = anchorDay ?? startDate.getUTCDate();

  for (let i = 0; i < count; i++) {
    current = calculateNextBillingDate(current, frequency, effectiveAnchor);
    dates.push(new Date(current));
  }

  return dates;
}

