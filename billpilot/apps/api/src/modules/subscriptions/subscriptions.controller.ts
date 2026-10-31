import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SubscriptionsService } from './subscriptions.service';
import {
  CreateSubscriptionDto,
  TransitionSubscriptionDto,
  createSubscriptionSchema,
  transitionSubscriptionSchema,
} from './subscriptions.dto';
import type { JwtPayload } from '../../common/guards/roles.guard';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'List subscriptions (scoped to customerId if CUSTOMER role)' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    const customerId = user?.role === 'CUSTOMER' ? user.customerId : undefined;
    return this.subscriptionsService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
      customerId,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'Get single subscription details' })
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const customerId = user.role === 'CUSTOMER' ? user.customerId : undefined;
    return this.subscriptionsService.findOne(id, customerId);
  }

  @Get(':id/schedule-preview')
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'Preview the next 3 invoice dates for a subscription' })
  async previewSchedule(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const customerId = user.role === 'CUSTOMER' ? user.customerId : undefined;
    return this.subscriptionsService.previewSchedule(id, customerId);
  }

  @Post(':id/approve-quote')
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'One-click quotation approval from client portal' })
  async approveQuotation(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.subscriptionsService.approveQuotation(id, {
      id: user.sub,
      role: user.role,
      customerId: user.customerId,
    });
  }

  @Post()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Create draft subscription' })
  async create(
    @Body(new ZodValidationPipe(createSubscriptionSchema)) dto: CreateSubscriptionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.subscriptionsService.create(dto, {
      id: user.sub,
      role: user.role,
      customerId: user.customerId,
    });
  }

  @Post(':id/transition')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Transition subscription state machine' })
  async transition(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(transitionSubscriptionSchema)) dto: TransitionSubscriptionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.subscriptionsService.transition(
      id,
      dto.status as any,
      {
        id: user.sub,
        role: user.role,
        customerId: user.customerId,
      },
      dto.reason,
    );
  }

  @Post(':id/pause')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Pause subscription (pausable plans only)' })
  async pause(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.subscriptionsService.pause(id, {
      id: user.sub,
      role: user.role,
      customerId: user.customerId,
    });
  }

  @Post(':id/resume')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Resume paused subscription' })
  async resume(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.subscriptionsService.resume(id, {
      id: user.sub,
      role: user.role,
      customerId: user.customerId,
    });
  }
}
