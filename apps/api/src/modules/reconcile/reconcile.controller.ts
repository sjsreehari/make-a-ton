import { Controller, Get, Post, Body } from '@nestjs/common';
import { ReconcileService } from './reconcile.service';
import { UploadStatementDto, uploadStatementSchema } from './reconcile.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('reconcile')
@Roles('ADMIN', 'STAFF')
export class ReconcileController {
  constructor(private readonly service: ReconcileService) {}

  @Post('upload')
  async upload(@Body(new ZodValidationPipe(uploadStatementSchema)) dto: UploadStatementDto) {
    return this.service.processStatement(dto);
  }

  @Get('review')
  async reviewQueue() {
    return this.service.getReviewQueue();
  }
}
