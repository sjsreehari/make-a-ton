import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { EventBusModule } from '../../common/events/event-bus.module';

@Module({
  imports: [PrismaModule, EventBusModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
