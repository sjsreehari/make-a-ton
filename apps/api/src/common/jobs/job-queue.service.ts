import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface EnqueueOptions {
  runAt?: Date;
  dedupeKey?: string;
  maxAttempts?: number;
}

@Injectable()
export class JobQueueService {
  private readonly logger = new Logger(JobQueueService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Enqueue a job into the MySQL Job table.
   * If dedupeKey collides, either return the existing pending/running job or update payload.
   */
  async enqueue(
    queue: string,
    type: string,
    payload: any,
    opts?: EnqueueOptions,
  ) {
    const runAt = opts?.runAt ?? new Date();
    const maxAttempts = opts?.maxAttempts ?? 5;
    const dedupeKey = opts?.dedupeKey;

    try {
      if (dedupeKey) {
        const existing = await this.prisma.job.findUnique({
          where: { dedupeKey },
        });

        if (existing) {
          if (existing.status === 'PENDING') {
            return await this.prisma.job.update({
              where: { id: existing.id },
              data: {
                payload: payload as Prisma.InputJsonValue,
                runAt,
                maxAttempts,
              },
            });
          }
          // If already running, done, or dead, return existing job
          return existing;
        }
      }

      return await this.prisma.job.create({
        data: {
          queue,
          type,
          payload: payload as Prisma.InputJsonValue,
          status: 'PENDING',
          runAt,
          maxAttempts,
          dedupeKey,
        },
      });
    } catch (err: any) {
      if (err.code === 'P2002' && dedupeKey) {
        const job = await this.prisma.job.findUnique({
          where: { dedupeKey },
        });
        if (job) return job;
      }
      this.logger.error(`Failed to enqueue job [${queue}/${type}]: ${err.message}`, err.stack);
      throw err;
    }
  }

  async getJob(id: string) {
    return this.prisma.job.findUnique({ where: { id } });
  }
}
