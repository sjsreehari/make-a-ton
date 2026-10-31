import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { Job, Prisma } from '@prisma/client';
import { JOB_HANDLER_METADATA, JobHandlerMetadata } from './job-handler.decorator';

export type JobHandlerFn = (payload: any, job: Job) => Promise<any> | any;

@Injectable()
export class JobWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobWorkerService.name);
  private readonly workerId = `worker-${process.pid}-${Math.random().toString(36).slice(2, 8)}`;
  private readonly handlers = new Map<string, JobHandlerFn>();

  private pollIntervalMs = 1000;
  private batchSize = 10;
  private concurrency = 5;
  private lockTimeoutMs = 300000; // 5 minutes

  private isRunning = false;
  private pollTimer: NodeJS.Timeout | null = null;
  private sweepTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly discovery: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
  ) {
    this.pollIntervalMs = Number(this.config.get('JOB_POLL_MS') || 1000);
    this.batchSize = Number(this.config.get('JOB_BATCH') || 10);
    this.concurrency = Number(this.config.get('JOB_CONCURRENCY') || 5);
    this.lockTimeoutMs = Number(this.config.get('JOB_LOCK_TIMEOUT_MS') || 300000);
  }

  async onModuleInit() {
    this.discoverHandlers();
    this.start();
  }

  async onModuleDestroy() {
    this.stop();
  }

  setLockTimeoutMs(ms: number) {
    this.lockTimeoutMs = ms;
  }

  registerHandler(queue: string, type: string, fn: JobHandlerFn) {
    const key = `${queue}:${type}`;
    this.handlers.set(key, fn);
    this.logger.log(`Registered job handler for [${key}]`);
  }

  private discoverHandlers() {
    const providers = this.discovery.getProviders();
    for (const wrapper of providers) {
      const { instance } = wrapper;
      if (!instance || typeof instance !== 'object') continue;

      const prototype = Object.getPrototypeOf(instance);
      if (!prototype) continue;

      const methodNames = this.metadataScanner.getAllMethodNames(prototype);
      for (const methodName of methodNames) {
        const methodRef = instance[methodName];
        if (typeof methodRef !== 'function') continue;

        const metadata = Reflect.getMetadata(
          JOB_HANDLER_METADATA,
          methodRef,
        ) as JobHandlerMetadata | undefined;

        if (metadata) {
          this.registerHandler(metadata.queue, metadata.type, methodRef.bind(instance));
        }
      }
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.logger.log(`Starting JobWorker [${this.workerId}] (poll=${this.pollIntervalMs}ms, batch=${this.batchSize}, concurrency=${this.concurrency})`);

    // Main poll loop
    this.pollTimer = setInterval(() => {
      this.pollAndProcess().catch((err) => {
        this.logger.error(`Error in job worker poll loop: ${err.message}`, err.stack);
      });
    }, this.pollIntervalMs);
    if (this.pollTimer.unref) this.pollTimer.unref();

    // Stuck jobs recovery loop (every 60s)
    this.sweepTimer = setInterval(() => {
      this.recoverStuckJobs().catch((err) => {
        this.logger.error(`Error recovering stuck jobs: ${err.message}`, err.stack);
      });
    }, 60000);
    if (this.sweepTimer.unref) this.sweepTimer.unref();
  }

  stop() {
    this.isRunning = false;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.sweepTimer) {
      clearInterval(this.sweepTimer);
      this.sweepTimer = null;
    }
    this.logger.log(`Stopped JobWorker [${this.workerId}]`);
  }

  /**
   * Atomically claims available jobs using MySQL 8 `SELECT ... FOR UPDATE SKIP LOCKED`
   */
  async claimJobs(limit = this.batchSize): Promise<Job[]> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Lock and select pending jobs whose runAt has passed
      const rows = await tx.$queryRaw<{ id: string }[]>(Prisma.sql`
        SELECT \`id\` FROM \`Job\`
        WHERE \`status\` = 'PENDING' AND \`runAt\` <= NOW(3)
        ORDER BY \`runAt\` ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED;
      `);

      if (!rows || rows.length === 0) {
        return [];
      }

      const ids = rows.map((r) => r.id);
      const now = new Date();

      // 2. Mark as RUNNING and locked
      await tx.job.updateMany({
        where: { id: { in: ids } },
        data: {
          status: 'RUNNING',
          lockedAt: now,
          lockedBy: this.workerId,
        },
      });

      return tx.job.findMany({
        where: { id: { in: ids } },
      });
    });
  }

  /**
   * Run one cycle of job processing
   */
  async pollAndProcess(): Promise<number> {
    if (this.isProcessing) return 0;
    this.isProcessing = true;

    try {
      const jobs = await this.claimJobs(this.batchSize);
      if (jobs.length === 0) return 0;

      // Process with concurrency limit
      const jobQueue = [...jobs];
      const workerPool = Array.from(
        { length: Math.min(this.concurrency, jobQueue.length) },
        async () => {
          while (jobQueue.length > 0) {
            const job = jobQueue.shift();
            if (job) {
              await this.processJob(job);
            }
          }
        },
      );

      await Promise.all(workerPool);
      return jobs.length;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single claimed job
   */
  async processJob(job: Job): Promise<void> {
    const specificKey = `${job.queue}:${job.type}`;
    const wildcardKey = `${job.queue}:*`;
    const handler = this.handlers.get(specificKey) || this.handlers.get(wildcardKey);

    try {
      if (handler) {
        await handler(job.payload, job);
      } else {
        this.logger.debug(`No handler registered for [${specificKey}]. Marked as DONE.`);
      }

      await this.prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'DONE',
          finishedAt: new Date(),
          lockedAt: null,
          lockedBy: null,
          lastError: null,
        },
      });
    } catch (err: any) {
      const nextAttempts = job.attempts + 1;
      const isDead = nextAttempts >= job.maxAttempts;
      // Exponential backoff: 2^attempts * 10 seconds
      const backoffMs = Math.pow(2, nextAttempts) * 10000;
      const nextRunAt = new Date(Date.now() + backoffMs);

      this.logger.warn(
        `Job [${specificKey}] id=${job.id} failed (attempt ${nextAttempts}/${job.maxAttempts}): ${err.message}`,
      );

      await this.prisma.job.update({
        where: { id: job.id },
        data: {
          attempts: nextAttempts,
          status: isDead ? 'DEAD' : 'PENDING',
          runAt: isDead ? job.runAt : nextRunAt,
          lockedAt: null,
          lockedBy: null,
          lastError: err?.message || String(err),
        },
      });
    }
  }

  /**
   * Periodic recovery of stuck jobs (running longer than lock timeout)
   */
  async recoverStuckJobs(): Promise<number> {
    const threshold = new Date(Date.now() - this.lockTimeoutMs);
    const result = await this.prisma.job.updateMany({
      where: {
        status: 'RUNNING',
        lockedAt: { lt: threshold },
      },
      data: {
        status: 'PENDING',
        lockedAt: null,
        lockedBy: null,
      },
    });

    if (result.count > 0) {
      this.logger.warn(`Recovered ${result.count} stuck jobs that exceeded ${this.lockTimeoutMs}ms lock`);
    }
    return result.count;
  }
}
