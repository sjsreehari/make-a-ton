import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RescueService } from './rescue.service';
import { SimulateFailureDto, simulateFailureSchema } from './rescue.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Payment Rescue')
@ApiBearerAuth()
@Controller('rescue')
@Roles('ADMIN', 'STAFF')
export class RescueController {
  constructor(private readonly service: RescueService) {}

  @Post('simulate')
  @ApiOperation({ summary: 'Simulate a payment failure to trigger smart rescue workflow' })
  async simulate(@Body(new ZodValidationPipe(simulateFailureSchema)) dto: SimulateFailureDto) {
    return this.service.simulateFailure(dto);
  }

  @Get('failures')
  @ApiOperation({ summary: 'Get active payment failure events and rescue progress' })
  async getFailures() {
    return this.service.getFailures();
  }

  @Post('recover/:id')
  @ApiOperation({ summary: 'Execute one-click recovery retry against failed invoice' })
  async recover(@Param('id') id: string) {
    return this.service.recoverAttempt(id);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get payment rescue recovery metrics' })
  async metrics() {
    return this.service.getMetrics();
  }
}
