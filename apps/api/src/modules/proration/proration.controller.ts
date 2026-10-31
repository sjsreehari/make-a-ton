import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ProrationService } from './proration.service';
import { ProrationPreviewDto, prorationPreviewSchema } from './proration.dto';

@ApiTags('Proration')
@ApiBearerAuth()
@Controller('proration')
export class ProrationController {
  constructor(private readonly prorationService: ProrationService) {}

  @Post('preview')
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'Calculate pure proration preview without database writes' })
  async preview(@Body(new ZodValidationPipe(prorationPreviewSchema)) dto: ProrationPreviewDto) {
    return this.prorationService.calculatePreview(dto);
  }
}

