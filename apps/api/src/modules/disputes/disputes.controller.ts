import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto, createDisputeSchema } from './disputes.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('disputes')
export class DisputesController {
  constructor(private readonly service: DisputesService) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(createDisputeSchema)) dto: CreateDisputeDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.create(dto, userId);
  }

  @Get()
  async list(@Query('invoiceId') invoiceId?: string) {
    return this.service.list(invoiceId);
  }
}
