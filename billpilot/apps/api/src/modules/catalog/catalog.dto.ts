import { z } from 'zod';
import {
  createProductSchema,
  createVariantSchema,
  createPlanSchema,
  createQuotationTemplateSchema,
} from '@billpilot/shared';

export {
  createProductSchema,
  createVariantSchema,
  createPlanSchema,
  createQuotationTemplateSchema,
};

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type CreateVariantDto = z.infer<typeof createVariantSchema>;
export type CreatePlanDto = z.infer<typeof createPlanSchema>;
export type CreateQuotationTemplateDto = z.infer<typeof createQuotationTemplateSchema>;
