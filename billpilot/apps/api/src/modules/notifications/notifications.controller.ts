import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto, sendNotificationSchema } from './notifications.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Post('send')
  @Roles('ADMIN', 'STAFF')
  async send(@Body(new ZodValidationPipe(sendNotificationSchema)) dto: SendNotificationDto) {
    return this.service.send(dto);
  }

  @Get('logs')
  @Roles('ADMIN', 'STAFF')
  async listLogs(@Query('customerId') customerId?: string) {
    return this.service.list(customerId);
  }
}
