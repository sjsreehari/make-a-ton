import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { CreditNotesService } from './credit-notes.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { EventBusModule } from '../../common/events/event-bus.module';

@Module({
  imports: [PrismaModule, EventBusModule],
  controllers: [BillingController],
  providers: [BillingService, CreditNotesService],
  exports: [BillingService, CreditNotesService],
})
export class BillingModule {}
