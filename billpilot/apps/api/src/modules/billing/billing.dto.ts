import { z } from 'zod';
import { runBillingSchema, confirmInvoiceSchema, cancelInvoiceSchema } from '@billpilot/shared';

export { runBillingSchema, confirmInvoiceSchema, cancelInvoiceSchema };
export type RunBillingDto = z.infer<typeof runBillingSchema>;
export type ConfirmInvoiceDto = z.infer<typeof confirmInvoiceSchema>;
export type CancelInvoiceDto = z.infer<typeof cancelInvoiceSchema>;
