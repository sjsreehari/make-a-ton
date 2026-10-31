import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { RecordPaymentDto, recordPaymentSchema } from './payments.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaymentMethod } from '@billpilot/shared';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  @Roles('ADMIN', 'STAFF')
  async record(
    @Body(new ZodValidationPipe(recordPaymentSchema)) dto: RecordPaymentDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.record({
      invoiceId: dto.invoiceId,
      method: dto.method,
      amount: dto.amount,
      date: dto.date ? new Date(dto.date) : new Date(),
      note: dto.note,
      externalRef: dto.externalRef,
      recordedById: userId,
    });
  }

  @Get()
  async list(@Query('invoiceId') invoiceId?: string) {
    if (!invoiceId) return { data: [] };
    const items = await this.service.listForInvoice(invoiceId);
    return { data: items };
  }

  @Get('outstanding')
  async outstanding(@Query('customerId') customerId?: string) {
    return this.service.outstanding(customerId);
  }
}
