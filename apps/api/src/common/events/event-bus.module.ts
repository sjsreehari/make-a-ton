import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EventBusService } from './event-bus.service';
import { DOMAIN_EVENTS_QUEUE } from '@billpilot/shared';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: DOMAIN_EVENTS_QUEUE,
    }),
  ],
  providers: [EventBusService],
  exports: [EventBusService],
})
export class EventBusModule {}

