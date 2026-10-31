import { Global, Module } from '@nestjs/common';
import { CommonAuditService } from './audit.service';

@Global()
@Module({
  providers: [CommonAuditService],
  exports: [CommonAuditService],
})
export class CommonAuditModule {}
