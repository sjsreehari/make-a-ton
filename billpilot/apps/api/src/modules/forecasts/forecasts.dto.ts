import { z } from 'zod';

export const getForecastSchema = z.object({
  months: z.coerce.number().optional().default(3),
});

export type GetForecastDto = z.infer<typeof getForecastSchema>;
