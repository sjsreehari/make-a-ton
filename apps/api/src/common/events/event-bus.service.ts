import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DOMAIN_EVENTS_QUEUE, DomainEvent, DomainEventPayloadMap } from '@billpilot/shared';
import { JobQueueService } from '../jobs/job-queue.service';

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);

  constructor(
    private readonly emitter: EventEmitter2,
    private readonly jobQueue: JobQueueService,
  ) {}

  async emit<E extends DomainEvent>(
    event: E,
    payload: DomainEventPayloadMap[E],
  ): Promise<void> {
    // 1. In-process synchronous/micro-task dispatch
    this.emitter.emit(event, payload);

    // 2. Durable asynchronous background dispatch via MySQL Job Queue
    try {
      await this.jobQueue.enqueue(DOMAIN_EVENTS_QUEUE, event, payload, {
        maxAttempts: 3,
      });
    } catch (err: unknown) {
      this.logger.warn(`Could not enqueue event ${event} to JobQueue: ${(err as Error).message}`);
    }

    this.logger.log(`Domain event emitted: ${event}`);
  }
}
