import { z } from 'zod';
import { PaymentMethod } from '@billpilot/shared';

export const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  method: z.nativeEnum(PaymentMethod),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  date: z.string().optional(),
  note: z.string().optional(),
  externalRef: z.string().optional(),
});

export type RecordPaymentDto = z.infer<typeof recordPaymentSchema>;
