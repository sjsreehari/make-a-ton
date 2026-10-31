import { z } from 'zod';
import { FailureKind } from '@billpilot/shared';

export const simulateFailureSchema = z.object({
  invoiceId: z.string().min(1),
  failureKind: z.nativeEnum(FailureKind),
  failureMessage: z.string().optional(),
});

export type SimulateFailureDto = z.infer<typeof simulateFailureSchema>;
