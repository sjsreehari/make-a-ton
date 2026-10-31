import { Module } from '@nestjs/common';
import { ProrationController } from './proration.controller';
import { ProrationService } from './proration.service';

@Module({
  controllers: [ProrationController],
  providers: [ProrationService],
  exports: [ProrationService],
})
export class ProrationModule {}

