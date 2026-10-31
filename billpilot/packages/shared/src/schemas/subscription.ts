import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  customerId: z.string().cuid(),
  planId: z.string().cuid(),
  startDate: z.string().datetime(),
  expiryDate: z.string().datetime().optional(),
  paymentTerm: z.enum(['IMMEDIATE', 'NET_7', 'NET_15', 'NET_30', 'NET_60']).default('NET_15'),
  templateId: z.string().cuid().optional(),
  lines: z.array(
    z.object({
      productId: z.string().cuid(),
      variantId: z.string().cuid().optional(),
      description: z.string(),
      quantity: z.number().int().min(1),
      unitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
      taxRuleId: z.string().cuid().optional(),
    }),
  ),
});
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;

export const transitionSubscriptionSchema = z.object({
  status: z.enum(['DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'CLOSED']),
  reason: z.string().optional(),
});

