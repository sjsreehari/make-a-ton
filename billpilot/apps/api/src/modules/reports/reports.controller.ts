import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from './reports.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('admin/ping')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin-only ping verification endpoint (Roles guard demo)' })
  adminPing() {
    return {
      message: 'pong',
      role: 'ADMIN',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('reports/dashboard')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Executive summary metrics for billing dashboard' })
  async getDashboard(@Query() query: ReportFilterDto) {
    return this.reportsService.getDashboardSummary(query);
  }
}
