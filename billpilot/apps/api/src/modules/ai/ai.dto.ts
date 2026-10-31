import { z } from 'zod';

export const askAssistantSchema = z.object({
  query: z.string().min(3),
});

export type AskAssistantDto = z.infer<typeof askAssistantSchema>;
