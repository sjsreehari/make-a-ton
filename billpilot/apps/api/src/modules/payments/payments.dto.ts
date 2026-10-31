import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

export const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  customerId: z.string().min(1),
  method: z.nativeEnum(PaymentMethod),
  amount: z.number().positive(),
  paidAt: z.string().datetime().optional(),
  note: z.string().optional(),
  externalRef: z.string().optional(),
});
export type RecordPaymentDto = z.infer<typeof recordPaymentSchema>;

export const multiInvoicePaymentSchema = z.object({
  customerId: z.string().min(1),
  amount: z.number().positive(),
  method: z.nativeEnum(PaymentMethod),
  paidAt: z.string().datetime().optional(),
  allocations: z
    .array(
      z.object({
        invoiceId: z.string().min(1),
        amount: z.number().positive(),
      }),
    )
    .optional(),
  note: z.string().optional(),
  externalRef: z.string().optional(),
});
export type MultiInvoicePaymentDto = z.infer<typeof multiInvoicePaymentSchema>;

export const refundPaymentSchema = z.object({
  amount: z.number().positive().optional(),
  reason: z.string().min(3),
});
export type RefundPaymentDto = z.infer<typeof refundPaymentSchema>;
