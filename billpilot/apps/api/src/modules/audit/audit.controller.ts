import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditService } from './audit.service';
import { AuditFilterDto } from './audit.dto';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'View immutable system audit logs (Admin only)' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query() filters?: AuditFilterDto,
  ) {
    return this.auditService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      ...filters,
    });
  }
}

