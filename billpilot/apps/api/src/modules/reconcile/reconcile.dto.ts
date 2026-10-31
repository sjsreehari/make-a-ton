import { z } from 'zod';

export const uploadStatementSchema = z.object({
  batchId: z.string().optional(),
  rows: z.array(
    z.object({
      txnDate: z.string(),
      amount: z.string(),
      reference: z.string(),
      narration: z.string().optional(),
      counterparty: z.string().optional(),
    }),
  ),
});

export type UploadStatementDto = z.infer<typeof uploadStatementSchema>;
