import { z } from 'zod';

// Money is always a string with 2 decimal places in API responses
export const moneyStringSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid monetary amount');

export const currencySchema = z.string().length(3).toUpperCase();

export const moneyInputSchema = z.object({
  amount: moneyStringSchema,
  currency: currencySchema.default('INR'),
});

