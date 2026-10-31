import { z } from 'zod';
import { ProductType } from '../enums.js';

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['SOFTWARE', 'SERVICE', 'ADDON', 'SUPPORT']),
  salesPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
  costPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
  notes: z.string().max(1000).optional(),
  taxRuleId: z.string().cuid().optional(),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const createVariantSchema = z.object({
  productId: z.string().cuid(),
  attribute: z.string().min(1).max(100),
  value: z.string().min(1).max(100),
  extraPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
});
export type CreateVariantInput = z.infer<typeof createVariantSchema>;

export const createPlanSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  billingPeriod: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  minQuantity: z.number().int().min(1).default(1),
  availableFrom: z.string().datetime().optional(),
  availableTo: z.string().datetime().optional(),
  autoClose: z.boolean().default(false),
  closable: z.boolean().default(true),
  pausable: z.boolean().default(true),
  renewable: z.boolean().default(true),
});
export type CreatePlanInput = z.infer<typeof createPlanSchema>;

export const createQuotationTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  planId: z.string().cuid(),
  validityDays: z.number().int().min(1).max(365),
  lines: z.array(
    z.object({
      productId: z.string().cuid(),
      variantId: z.string().cuid().optional(),
      quantity: z.number().int().min(1),
    }),
  ),
  paymentTerm: z.enum(['IMMEDIATE', 'NET_7', 'NET_15', 'NET_30', 'NET_60']).default('NET_15'),
});
export type CreateQuotationTemplateInput = z.infer<typeof createQuotationTemplateSchema>;

