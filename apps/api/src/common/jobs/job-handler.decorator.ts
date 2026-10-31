import { SetMetadata } from '@nestjs/common';

export const JOB_HANDLER_METADATA = 'JOB_HANDLER_METADATA';

export interface JobHandlerMetadata {
  queue: string;
  type: string;
}

/**
 * Decorator to register a method as a background job handler.
 * Usage: @JobHandler('domain-events', 'invoice.created')
 * Or wildcard: @JobHandler('domain-events', '*')
 */
export const JobHandler = (queue: string, type: string = '*'): MethodDecorator => {
  return SetMetadata(JOB_HANDLER_METADATA, { queue, type });
};
