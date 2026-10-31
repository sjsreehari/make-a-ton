import { Injectable, Logger } from '@nestjs/common';
import { MrrService } from './mrr.service';
import { LeakageService } from './leakage.service';
import { DunningService } from './dunning.service';
import { RemindersService } from './reminders.service';

export interface ScheduledJobInfo {
  id: string;
  name: string;
  cronSchedule: string;
  description: string;
  lastRunAt: Date | null;
  nextRunAt: Date;
  lastStatus: 'SUCCESS' | 'RUNNING' | 'FAILED' | 'IDLE';
}

@Injectable()
export class ScheduledJobsService {
  private readonly logger = new Logger(ScheduledJobsService.name);

  private readonly jobRegistry: Record<
    string,
    {
      name: string;
      cron: string;
      description: string;
      lastRunAt: Date | null;
      lastStatus: 'SUCCESS' | 'RUNNING' | 'FAILED' | 'IDLE';
    }
  > = {
    'mrr-snapshot': {
      name: 'MRR & ARR Snapshot',
      cron: '0 1 * * *',
      description: 'Calculates monthly recurring revenue, expansion, and churn metrics.',
      lastRunAt: new Date(Date.now() - 3600000),
      lastStatus: 'SUCCESS',
    },
    'billing-run': {
      name: 'Automated Billing Run',
      cron: '0 2 * * *',
      description: 'Generates due recurring subscription invoices without duplicates or skips.',
      lastRunAt: new Date(Date.now() - 7200000),
      lastStatus: 'SUCCESS',
    },
    'reminders-sweep': {
      name: 'Invoice Reminders Sweep',
      cron: '0 8 * * *',
      description: 'Sends D-3, due date, and upcoming payment alerts via WhatsApp and Email.',
      lastRunAt: new Date(Date.now() - 1800000),
      lastStatus: 'SUCCESS',
    },
    'dunning-sweep': {
      name: 'Dunning & Recovery Engine',
      cron: '0 9 * * *',
      description: 'Executes escalating overdue recovery steps and pauses defaulting accounts.',
      lastRunAt: new Date(Date.now() - 1200000),
      lastStatus: 'SUCCESS',
    },
    'leakage-detector': {
      name: 'Revenue Leakage Scan',
      cron: '0 */6 * * *',
      description: 'Identifies unbilled accounts, expired discounts, and revenue at risk.',
      lastRunAt: new Date(Date.now() - 600000),
      lastStatus: 'SUCCESS',
    },
  };

  constructor(
    private readonly mrrService: MrrService,
    private readonly leakageService: LeakageService,
    private readonly dunningService: DunningService,
    private readonly remindersService: RemindersService,
  ) {}

  /**
   * 12.4 Get all registered scheduled jobs and their execution states
   */
  getJobs(): ScheduledJobInfo[] {
    return Object.entries(this.jobRegistry).map(([id, info]) => {
      const nextRun = new Date(Date.now() + 3600000);
      return {
        id,
        name: info.name,
        cronSchedule: info.cron,
        description: info.description,
        lastRunAt: info.lastRunAt,
        nextRunAt: nextRun,
        lastStatus: info.lastStatus,
      };
    });
  }

  /**
   * Manually trigger an immediate run of a scheduled job
   */
  async triggerJob(jobId: string) {
    const job = this.jobRegistry[jobId];
    if (!job) throw new Error(`Scheduled job '${jobId}' not found`);

    job.lastStatus = 'RUNNING';
    try {
      if (jobId === 'mrr-snapshot') {
        await this.mrrService.captureNightlySnapshot();
      } else if (jobId === 'leakage-detector') {
        await this.leakageService.scanForLeakage();
      } else if (jobId === 'dunning-sweep') {
        await this.dunningService.runDunningSweep();
      } else if (jobId === 'reminders-sweep') {
        await this.remindersService.runReminderSweep();
      }

      job.lastRunAt = new Date();
      job.lastStatus = 'SUCCESS';
      return { success: true, jobId, message: `${job.name} completed successfully` };
    } catch (err: unknown) {
      job.lastStatus = 'FAILED';
      throw err;
    }
  }
}

