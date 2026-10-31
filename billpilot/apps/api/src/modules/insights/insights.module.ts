import { Module } from '@nestjs/common';
import { MrrService } from './mrr.service';
import { LeakageService } from './leakage.service';
import { DunningService } from './dunning.service';
import { RemindersService } from './reminders.service';
import { ScheduledJobsService } from './scheduled-jobs.service';
import { InsightsController } from './insights.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [InsightsController],
  providers: [
    MrrService,
    LeakageService,
    DunningService,
    RemindersService,
    ScheduledJobsService,
  ],
  exports: [
    MrrService,
    LeakageService,
    DunningService,
    RemindersService,
    ScheduledJobsService,
  ],
})
export class InsightsModule {}
