import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CatalogService } from './catalog.service';
import {
  CreateProductDto,
  CreateVariantDto,
  CreatePlanDto,
  createProductSchema,
  createVariantSchema,
  createPlanSchema,
} from './catalog.dto';
import type { JwtPayload } from '../../common/guards/roles.guard';

@ApiTags('Catalog')
@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('plans')
  @Public()
  @ApiOperation({ summary: 'List all subscription plans (public)' })
  async getPlans(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.catalogService.findPlans({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Post('plans')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create new plan (Admin only)' })
  async createPlan(
    @Body(new ZodValidationPipe(createPlanSchema)) dto: CreatePlanDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.catalogService.createPlan(dto, user.sub);
  }

  @Get('products')
  @ApiBearerAuth()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'List products and variants' })
  async getProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
  ) {
    return this.catalogService.findProducts({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      type,
    });
  }

  @Post('products')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create product (Admin only)' })
  async createProduct(
    @Body(new ZodValidationPipe(createProductSchema)) dto: CreateProductDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.catalogService.createProduct(dto, user.sub);
  }

  @Post('products/variants')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Add product variant (Admin only)' })
  async addVariant(
    @Body(new ZodValidationPipe(createVariantSchema)) dto: CreateVariantDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.catalogService.addVariant(dto, user.sub);
  }
}
