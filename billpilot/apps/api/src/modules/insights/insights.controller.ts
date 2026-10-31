import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MrrService } from './mrr.service';
import { LeakageService } from './leakage.service';
import { DunningService } from './dunning.service';
import { RemindersService } from './reminders.service';
import { ScheduledJobsService } from './scheduled-jobs.service';
import type { JwtPayload } from '../../common/guards/roles.guard';

@ApiTags('Insights & Automation')
@ApiBearerAuth()
@Controller('insights')
export class InsightsController {
  constructor(
    private readonly mrrService: MrrService,
    private readonly leakageService: LeakageService,
    private readonly dunningService: DunningService,
    private readonly remindersService: RemindersService,
    private readonly jobsService: ScheduledJobsService,
  ) {}

  // --- MRR / ARR ---
  @Get('mrr')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '12.2 Get live MRR, ARR, and revenue movement metrics' })
  async getMrr() {
    return this.mrrService.calculateLiveMetrics();
  }

  @Get('mrr/trend')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '12.2 Get MRR trend chart history snapshots' })
  async getMrrTrend() {
    return this.mrrService.getTrendHistory();
  }

  // --- Leakage Detector ---
  @Get('leakage')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '12.1 Get revenue leakage detector findings and ₹ at risk' })
  async getLeakage() {
    return this.leakageService.getOverview();
  }

  @Post('leakage/scan')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '12.1 Trigger a full revenue leakage scan' })
  async triggerLeakageScan() {
    await this.leakageService.scanForLeakage();
    return this.leakageService.getOverview();
  }

  @Post('leakage/:id/fix')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '12.1 One-click fix for a leakage finding' })
  async fixLeakageFinding(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.leakageService.fixFinding(id, user.sub);
  }

  // --- Dunning & Recovery ---
  @Get('dunning')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '12.3 Get dunning cohorts and total recovered revenue' })
  async getDunning() {
    return this.dunningService.getOverview();
  }

  @Post('dunning/run')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '12.3 Manually run dunning recovery sweep' })
  async runDunningSweep() {
    return this.dunningService.runDunningSweep();
  }

  @Post('dunning/simulate-failure/:invoiceId')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '8.4 Demo button: Fail this payment to test recovery waterfall' })
  async simulateFailure(@Param('invoiceId') invoiceId: string) {
    return this.dunningService.simulatePaymentFailure(invoiceId);
  }

  // --- Reminders ---
  @Post('reminders/run')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '11.5 Manually run invoice reminder sweep' })
  async runReminderSweep() {
    return this.remindersService.runReminderSweep();
  }

  // --- Scheduled Jobs Registry ---
  @Get('jobs')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '12.4 Get scheduled jobs execution status and last run timestamps' })
  async getJobs() {
    return this.jobsService.getJobs();
  }

  @Post('jobs/:id/run')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '12.4 Manually trigger execution of a scheduled job' })
  async runJob(@Param('id') id: string) {
    return this.jobsService.triggerJob(id);
  }
}

