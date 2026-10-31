import { Module } from '@nestjs/common';
import { PaylinksController } from './paylinks.controller';
import { PaylinksService } from './paylinks.service';

@Module({
  controllers: [PaylinksController],
  providers: [PaylinksService],
  exports: [PaylinksService],
})
export class PaylinksModule {}
