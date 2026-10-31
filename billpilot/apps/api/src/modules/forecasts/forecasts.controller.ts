import { Controller, Get, Query } from '@nestjs/common';
import { ForecastsService } from './forecasts.service';
import { GetForecastDto, getForecastSchema } from './forecasts.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('forecasts')
@Roles('ADMIN', 'STAFF')
export class ForecastsController {
  constructor(private readonly service: ForecastsService) {}

  @Get('cash-flow')
  async getCashFlow(@Query(new ZodValidationPipe(getForecastSchema)) query: GetForecastDto) {
    return this.service.getCashFlow(query.months ?? 3);
  }
}
