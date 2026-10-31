import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { MandatesService } from './mandates.service';
import { CreateMandateDto, createMandateSchema } from './mandates.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('mandates')
@Roles('ADMIN', 'STAFF')
export class MandatesController {
  constructor(private readonly service: MandatesService) {}

  @Post()
  async create(@Body(new ZodValidationPipe(createMandateSchema)) dto: CreateMandateDto) {
    return this.service.create(dto);
  }

  @Get()
  async list(@Query('customerId') customerId?: string) {
    return this.service.list(customerId);
  }
}
