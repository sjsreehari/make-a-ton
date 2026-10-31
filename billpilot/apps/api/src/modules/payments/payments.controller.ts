import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { PaymentsService } from './payments.service';
import {
  RecordPaymentDto,
  MultiInvoicePaymentDto,
  RefundPaymentDto,
  recordPaymentSchema,
  multiInvoicePaymentSchema,
  refundPaymentSchema,
} from './payments.dto';
import type { JwtPayload } from '../../common/guards/roles.guard';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'List payments (scoped to customer if CUSTOMER role)' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('customerId') customerId?: string,
    @Query('invoiceId') invoiceId?: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    const effectiveCustomerId = user?.role === 'CUSTOMER' ? user.customerId : customerId;
    return this.paymentsService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      customerId: effectiveCustomerId,
      invoiceId,
    });
  }

  @Post()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Record payment for an invoice with automatic overpayment credit' })
  async record(
    @Body(new ZodValidationPipe(recordPaymentSchema)) dto: RecordPaymentDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.paymentsService.record(dto, user ? { id: user.sub, role: user.role } : undefined);
  }

  @Post('multi-apply')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Apply one payment across multiple invoices with customer credit overflow' })
  async applyAcrossInvoices(
    @Body(new ZodValidationPipe(multiInvoicePaymentSchema)) dto: MultiInvoicePaymentDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.paymentsService.applyAcrossInvoices(
      dto,
      user ? { id: user.sub, role: user.role } : undefined,
    );
  }

  @Post(':id/refund')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Refund a recorded payment with reason and restore balance' })
  async refund(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(refundPaymentSchema)) dto: RefundPaymentDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.paymentsService.refund(id, dto, user ? { id: user.sub, role: user.role } : undefined);
  }
}

