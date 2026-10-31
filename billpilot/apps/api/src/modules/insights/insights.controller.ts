import { Controller, Get, Post } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('insights')
@Roles('ADMIN', 'STAFF')
export class InsightsController {
  constructor(private readonly service: InsightsService) {}

  @Get('leakage')
  async getFindings() {
    return this.service.getFindings();
  }

  @Post('leakage/scan')
  async runScan() {
    return this.service.runScan();
  }
}
