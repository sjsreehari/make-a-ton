import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { EventBusService } from '../../common/events/event-bus.service';
import { DomainEvent } from '@billpilot/shared';

@ApiTags('Dev')
@Controller('dev')
export class DevController {
  constructor(private readonly eventBus: EventBusService) {}

  @Post('emit-test')
  @Public()
  @ApiOperation({ summary: 'Emit test invoice.confirmed event to demonstrate event bus' })
  async emitTest() {
    const payload = {
      invoiceId: 'inv-test-demo-001',
      subscriptionId: 'sub-test-demo-001',
      customerId: 'customer-seed-001',
      number: 'INV-2026-TEST01',
      total: '4999.00',
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    };

    await this.eventBus.emit(DomainEvent.INVOICE_CONFIRMED, payload);

    return {
      success: true,
      message: 'Emitted invoice.confirmed event. Check notifications module for log entry.',
      payload,
    };
  }
}

