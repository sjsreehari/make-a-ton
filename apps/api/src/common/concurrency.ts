import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; delayMs?: number } = {},
): Promise<T> {
  const maxRetries = options.retries ?? 3;
  const delay = options.delayMs ?? 50;

  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      const isDeadlock =
        (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2034') ||
        err?.message?.includes('Deadlock') ||
        err?.message?.includes('P2034') ||
        err?.code === 'ER_LOCK_DEADLOCK';

      if (isDeadlock && attempt <= maxRetries) {
        Logger.warn(
          `[Concurrency] Deadlock/Conflict detected (attempt ${attempt}/${maxRetries}), retrying in ${delay * attempt}ms...`,
          'withRetry',
        );
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        continue;
      }
      throw err;
    }
  }
}
