import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { TaxService } from './tax.service';
import { CreateTaxRuleDto, createTaxRuleSchema } from './tax.dto';
import type { JwtPayload } from '../../common/guards/roles.guard';

@ApiTags('Tax')
@ApiBearerAuth()
@Controller('tax-rules')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Get()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'List tax rules' })
  async findAll() {
    return this.taxService.findAll();
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create tax rule (Admin only)' })
  async create(
    @Body(new ZodValidationPipe(createTaxRuleSchema)) dto: CreateTaxRuleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.taxService.create(dto, user.sub);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete or deactivate tax rule (Admin only)' })
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.taxService.delete(id, user.sub);
  }
}
