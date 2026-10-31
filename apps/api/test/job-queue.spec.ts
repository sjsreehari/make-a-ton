import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { JobQueueService } from '../src/common/jobs/job-queue.service';
import { JobWorkerService } from '../src/common/jobs/job-worker.service';
import { ConfigService } from '@nestjs/config';

describe('JobQueue & JobWorker (MySQL 8.0)', () => {
  let prisma: PrismaClient;
  let queueService: JobQueueService;
  let workerService: JobWorkerService;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

    const config = new ConfigService({
      JOB_POLL_MS: 100,
      JOB_BATCH: 10,
      JOB_CONCURRENCY: 2,
      JOB_LOCK_TIMEOUT_MS: 1000, // 1s for fast stuck job testing
    });

    const mockDiscovery: any = { getProviders: () => [] };
    const mockScanner: any = { getAllMethodNames: () => [] };

    queueService = new JobQueueService(prisma as any);
    workerService = new JobWorkerService(
      prisma as any,
      config,
      mockDiscovery,
      mockScanner,
    );
  });

  afterAll(async () => {
    workerService.stop();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.job.deleteMany({
      where: {
        queue: { in: ['test-queue', 'retry-queue', 'dedupe-queue', 'stuck-queue'] },
      },
    });
  });

  it('enqueues, claims, processes and marks job as DONE', async () => {
    let processedPayload: any = null;

    workerService.registerHandler('test-queue', 'test-job', async (payload) => {
      processedPayload = payload;
      return { success: true };
    });

    const job = await queueService.enqueue('test-queue', 'test-job', { hello: 'world' });
    expect(job).toBeDefined();
    expect(job.status).toBe('PENDING');

    // Run one processing cycle
    const count = await workerService.pollAndProcess();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(processedPayload).toEqual({ hello: 'world' });

    const updated = await queueService.getJob(job.id);
    expect(updated?.status).toBe('DONE');
    expect(updated?.finishedAt).not.toBeNull();
  });

  it('retries with exponential backoff on failure and marks DEAD when maxAttempts reached', async () => {
    workerService.registerHandler('retry-queue', 'fail-job', async () => {
      throw new Error('Something went wrong');
    });

    const job = await queueService.enqueue('retry-queue', 'fail-job', { attempt: 1 }, { maxAttempts: 2 });
    expect(job.attempts).toBe(0);

    // First attempt fails
    await workerService.pollAndProcess();
    let updated = await queueService.getJob(job.id);
    expect(updated?.status).toBe('PENDING');
    expect(updated?.attempts).toBe(1);
    expect(updated?.lastError).toContain('Something went wrong');
    expect(new Date(updated!.runAt).getTime()).toBeGreaterThan(Date.now());

    // Artificially reset runAt to past so it can be claimed for attempt 2
    await prisma.job.update({
      where: { id: job.id },
      data: { runAt: new Date(Date.now() - 1000) },
    });

    // Second attempt fails -> should become DEAD
    await workerService.pollAndProcess();
    updated = await queueService.getJob(job.id);
    expect(updated?.status).toBe('DEAD');
    expect(updated?.attempts).toBe(2);
  });

  it('handles dedupeKey collisions gracefully without inserting duplicate', async () => {
    const dedupeKey = `dedupe-${Date.now()}`;

    const job1 = await queueService.enqueue('dedupe-queue', 'dedupe-job', { v: 1 }, { dedupeKey });
    const job2 = await queueService.enqueue('dedupe-queue', 'dedupe-job', { v: 2 }, { dedupeKey });

    expect(job1.id).toBe(job2.id);

    const count = await prisma.job.count({ where: { dedupeKey } });
    expect(count).toBe(1);

    const updated = await queueService.getJob(job1.id);
    expect((updated?.payload as any)?.v).toBe(2);
  });

  it('recovers stuck jobs exceeding lock timeout', async () => {
    workerService.setLockTimeoutMs(1000);
    const job = await queueService.enqueue('stuck-queue', 'stuck-job', {});

    // Artificially lock job in the past
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: 'RUNNING',
        lockedAt: new Date(Date.now() - 10000), // 10 seconds ago
        lockedBy: 'abandoned-worker',
      },
    });

    const recovered = await workerService.recoverStuckJobs();
    expect(recovered).toBeGreaterThanOrEqual(1);

    const updated = await queueService.getJob(job.id);
    expect(updated?.status).toBe('PENDING');
    expect(updated?.lockedAt).toBeNull();
    expect(updated?.lockedBy).toBeNull();
  });
});
