import { z } from 'zod';

export const runBillingSchema = z.object({
  asOf: z.string().datetime().optional(),
  dryRun: z.boolean().default(false),
});
export type RunBillingInput = z.infer<typeof runBillingSchema>;

export const confirmInvoiceSchema = z.object({
  invoiceId: z.string().cuid(),
});

export const cancelInvoiceSchema = z.object({
  reason: z.string().min(1).max(500),
});

