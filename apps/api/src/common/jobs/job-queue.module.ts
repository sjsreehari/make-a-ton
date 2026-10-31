import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { JobQueueService } from './job-queue.service';
import { JobWorkerService } from './job-worker.service';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [JobQueueService, JobWorkerService],
  exports: [JobQueueService, JobWorkerService],
})
export class JobQueueModule {}
