/**
 * Configurable invoice numbering formatter.
 * Supports patterns such as:
 * - INV-{year}-{seq:6} -> INV-2026-000001
 * - INV/{yyyy}/{mm}/{seq:4} -> INV/2026/10/0001
 * - BILL-{yy}-{seq:5} -> BILL-26-00001
 */
export function formatDocumentNumber(
  pattern: string,
  sequence: number,
  date: Date = new Date(),
): string {
  const yyyy = date.getUTCFullYear().toString();
  const yy = yyyy.slice(-2);
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');

  let result = pattern
    .replace(/\{year\}/gi, yyyy)
    .replace(/\{yyyy\}/gi, yyyy)
    .replace(/\{yy\}/gi, yy)
    .replace(/\{month\}/gi, mm)
    .replace(/\{mm\}/gi, mm)
    .replace(/\{day\}/gi, dd)
    .replace(/\{dd\}/gi, dd);

  // Replace {seq:N} or {seq}
  result = result.replace(/\{seq(?::(\d+))?\}/gi, (_, length) => {
    const padLen = length ? parseInt(length, 10) : 6;
    return String(sequence).padStart(padLen, '0');
  });

  return result;
}

export type DerivedInvoiceStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'SENT'
  | 'PARTIAL'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'REVERSED';

export interface InvoiceStatusComputation {
  status: 'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED';
  amountPaid: { isZero: () => boolean; gte: (other: any) => boolean };
  amountDue: { isZero: () => boolean; lte: (other: any) => boolean };
  total: any;
  dueDate: Date;
  sentAt?: Date | null;
  cancelledAt?: Date | null;
  hasReversal?: boolean;
}

/**
 * Derives the contextual display status for an invoice.
 */
export function deriveInvoiceDisplayStatus(
  inv: InvoiceStatusComputation,
  now: Date = new Date(),
): DerivedInvoiceStatus {
  if (inv.status === 'CANCELLED') {
    return inv.hasReversal ? 'REVERSED' : 'CANCELLED';
  }

  if (inv.status === 'PAID' || inv.amountDue.lte(0)) {
    return 'PAID';
  }

  if (inv.status === 'CONFIRMED') {
    if (!inv.amountPaid.isZero() && !inv.amountDue.isZero()) {
      return 'PARTIAL';
    }
    if (new Date(inv.dueDate).getTime() < now.getTime()) {
      return 'OVERDUE';
    }
    if (inv.sentAt) {
      return 'SENT';
    }
    return 'CONFIRMED';
  }

  return 'DRAFT';
}

