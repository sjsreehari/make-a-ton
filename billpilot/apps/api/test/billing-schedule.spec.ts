import { describe, it, expect } from 'vitest';
import { BillingPeriod } from '@prisma/client';
import {
  calculateNextBillingDate,
  previewNextInvoiceDates,
  getDaysInMonth,
} from '../src/modules/billing/billing-schedule';

describe('BillingSchedule - Recurring Billing Calculations', () => {
  it('correctly calculates days in month including leap years', () => {
    expect(getDaysInMonth(2026, 1)).toBe(31); // Jan 2026
    expect(getDaysInMonth(2026, 2)).toBe(28); // Feb 2026 (non-leap)
    expect(getDaysInMonth(2024, 2)).toBe(29); // Feb 2024 (leap year)
    expect(getDaysInMonth(2026, 4)).toBe(30); // Apr 2026
  });

  it('handles robust end-of-month math from Jan 31 through May 31', () => {
    const jan31 = new Date(Date.UTC(2026, 0, 31)); // Jan 31, 2026
    const anchorDay = 31;

    // Jan 31 -> Feb 28
    const feb = calculateNextBillingDate(jan31, BillingPeriod.MONTHLY, anchorDay);
    expect(feb.getUTCFullYear()).toBe(2026);
    expect(feb.getUTCMonth()).toBe(1); // Feb
    expect(feb.getUTCDate()).toBe(28);

    // Feb 28 -> Mar 31 (preserves anchor day 31!)
    const mar = calculateNextBillingDate(feb, BillingPeriod.MONTHLY, anchorDay);
    expect(mar.getUTCFullYear()).toBe(2026);
    expect(mar.getUTCMonth()).toBe(2); // Mar
    expect(mar.getUTCDate()).toBe(31);

    // Mar 31 -> Apr 30 (Apr has 30 days)
    const apr = calculateNextBillingDate(mar, BillingPeriod.MONTHLY, anchorDay);
    expect(apr.getUTCFullYear()).toBe(2026);
    expect(apr.getUTCMonth()).toBe(3); // Apr
    expect(apr.getUTCDate()).toBe(30);

    // Apr 30 -> May 31
    const may = calculateNextBillingDate(apr, BillingPeriod.MONTHLY, anchorDay);
    expect(may.getUTCFullYear()).toBe(2026);
    expect(may.getUTCMonth()).toBe(4); // May
    expect(may.getUTCDate()).toBe(31);
  });

  it('handles leap year Feb 29 correctly', () => {
    const jan31Leap = new Date(Date.UTC(2024, 0, 31));
    const febLeap = calculateNextBillingDate(jan31Leap, BillingPeriod.MONTHLY, 31);
    expect(febLeap.getUTCFullYear()).toBe(2024);
    expect(febLeap.getUTCMonth()).toBe(1);
    expect(febLeap.getUTCDate()).toBe(29);
  });

  it('calculates DAILY and WEEKLY billing schedules', () => {
    const base = new Date(Date.UTC(2026, 5, 10)); // June 10, 2026

    const nextDay = calculateNextBillingDate(base, BillingPeriod.DAILY);
    expect(nextDay.getUTCDate()).toBe(11);

    const nextWeek = calculateNextBillingDate(base, BillingPeriod.WEEKLY);
    expect(nextWeek.getUTCDate()).toBe(17);
  });

  it('calculates YEARLY schedules preserving anchor', () => {
    const leapDay = new Date(Date.UTC(2024, 1, 29)); // Feb 29, 2024
    const nextYear = calculateNextBillingDate(leapDay, BillingPeriod.YEARLY, 29);
    expect(nextYear.getUTCFullYear()).toBe(2025);
    expect(nextYear.getUTCMonth()).toBe(1);
    expect(nextYear.getUTCDate()).toBe(28); // Non-leap year capped at Feb 28
  });

  it('previews next 3 scheduled invoice dates accurately', () => {
    const jan31 = new Date(Date.UTC(2026, 0, 31));
    const preview = previewNextInvoiceDates(jan31, BillingPeriod.MONTHLY, 3, undefined, 31);

    expect(preview).toHaveLength(3);
    expect(preview[0].toISOString().substring(0, 10)).toBe('2026-02-28');
    expect(preview[1].toISOString().substring(0, 10)).toBe('2026-03-31');
    expect(preview[2].toISOString().substring(0, 10)).toBe('2026-04-30');
  });
});
