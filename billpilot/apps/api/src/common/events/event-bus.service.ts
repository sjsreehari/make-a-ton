import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DOMAIN_EVENTS_QUEUE, DomainEvent, DomainEventPayloadMap } from '@billpilot/shared';

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);

  constructor(
    private readonly emitter: EventEmitter2,
    @InjectQueue(DOMAIN_EVENTS_QUEUE) private readonly queue: Queue,
  ) {}

  async emit<E extends DomainEvent>(
    event: E,
    payload: DomainEventPayloadMap[E],
  ): Promise<void> {
    // 1. In-process synchronous/micro-task dispatch
    this.emitter.emit(event, payload);

    // 2. Durable asynchronous background dispatch via BullMQ
    try {
      await this.queue.add(event, payload, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      });
    } catch (err: unknown) {
      this.logger.warn(`Could not enqueue event ${event} to BullMQ: ${(err as Error).message}`);
    }

    this.logger.log(`Domain event emitted: ${event}`);
  }
}
