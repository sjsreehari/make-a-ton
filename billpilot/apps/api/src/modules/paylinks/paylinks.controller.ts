import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PaylinksService } from './paylinks.service';
import { CreatePaylinkDto, createPaylinkSchema } from './paylinks.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('paylinks')
export class PaylinksController {
  constructor(private readonly service: PaylinksService) {}

  @Post()
  @Roles('ADMIN', 'STAFF')
  async create(@Body(new ZodValidationPipe(createPaylinkSchema)) dto: CreatePaylinkDto) {
    return this.service.create(dto);
  }

  @Get(':invoiceId')
  async get(@Param('invoiceId') invoiceId: string) {
    return this.service.getForInvoice(invoiceId);
  }
}
