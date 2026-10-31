import { z } from 'zod';

export const recordPaymentSchema = z.object({
  invoiceId: z.string().cuid(),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CARD', 'CHEQUE', 'RAZORPAY', 'OTHER']),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  date: z.string().datetime(),
  note: z.string().max(500).optional(),
  externalRef: z.string().max(200).optional(),
});
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

