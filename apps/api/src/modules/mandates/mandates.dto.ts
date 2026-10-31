import { z } from 'zod';
import { PaymentMethod } from '@billpilot/shared';

export const createMandateSchema = z.object({
  customerId: z.string().min(1),
  method: z.nativeEnum(PaymentMethod),
  maxAmount: z.string(),
  frequency: z.string(),
});

export type CreateMandateDto = z.infer<typeof createMandateSchema>;
