import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto, createDiscountSchema } from './discounts.dto';
import type { JwtPayload } from '../../common/guards/roles.guard';

@ApiTags('Discounts')
@ApiBearerAuth()
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'List discounts with pagination' })
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.discountsService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create new discount (Admin only)' })
  async create(
    @Body(new ZodValidationPipe(createDiscountSchema)) dto: CreateDiscountDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.discountsService.create(dto, user.sub);
  }
}

