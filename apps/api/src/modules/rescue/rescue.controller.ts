import { Controller, Get, Post, Body } from '@nestjs/common';
import { RescueService } from './rescue.service';
import { SimulateFailureDto, simulateFailureSchema } from './rescue.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('rescue')
@Roles('ADMIN', 'STAFF')
export class RescueController {
  constructor(private readonly service: RescueService) {}

  @Post('simulate')
  async simulate(@Body(new ZodValidationPipe(simulateFailureSchema)) dto: SimulateFailureDto) {
    return this.service.simulateFailure(dto);
  }

  @Get('metrics')
  async metrics() {
    return this.service.getMetrics();
  }
}
