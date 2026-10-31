import { z } from 'zod';
import { runBillingSchema, confirmInvoiceSchema, cancelInvoiceSchema } from '@billpilot/shared';

export { runBillingSchema, confirmInvoiceSchema, cancelInvoiceSchema };
export type RunBillingDto = z.infer<typeof runBillingSchema>;
export type ConfirmInvoiceDto = z.infer<typeof confirmInvoiceSchema>;
export type CancelInvoiceDto = z.infer<typeof cancelInvoiceSchema>;

export const bulkActionSchema = z.object({
  action: z.enum(['CONFIRM', 'SEND', 'CANCEL']),
  invoiceIds: z.array(z.string().min(1)).min(1),
  reason: z.string().optional(),
});
export type BulkActionDto = z.infer<typeof bulkActionSchema>;

export const setPatternSchema = z.object({
  pattern: z.string().min(3),
});
export type SetPatternDto = z.infer<typeof setPatternSchema>;
