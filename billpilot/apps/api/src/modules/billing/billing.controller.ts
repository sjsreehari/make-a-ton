import { Controller, Get, Post, Param, Body, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { BillingService } from './billing.service';
import { RunBillingDto, CancelInvoiceDto, runBillingSchema, cancelInvoiceSchema } from './billing.dto';
import type { JwtPayload } from '../../common/guards/roles.guard';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('invoices')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get()
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'List invoices with pagination' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    const customerId = user?.role === 'CUSTOMER' ? user.customerId : undefined;
    return this.billingService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      customerId,
      status,
    });
  }

  @Post('run-billing')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Execute billing generation batch (supports Idempotency-Key)' })
  async runBilling(
    @Body(new ZodValidationPipe(runBillingSchema)) dto: RunBillingDto,
    @Headers('Idempotency-Key') _idempotencyKey?: string,
  ) {
    const asOf = dto.asOf ? new Date(dto.asOf) : new Date();
    return this.billingService.runBilling(asOf, { dryRun: dto.dryRun });
  }

  @Post(':id/confirm')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Confirm draft invoice' })
  async confirm(@Param('id') id: string) {
    return this.billingService.confirm(id);
  }

  @Post(':id/cancel')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Cancel invoice' })
  async cancel(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(cancelInvoiceSchema)) dto: CancelInvoiceDto,
  ) {
    return this.billingService.cancel(id, dto.reason);
  }

  @Post(':id/send')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Mark invoice as sent' })
  async send(@Param('id') id: string) {
    await this.billingService.send(id);
    return { success: true };
  }
}

