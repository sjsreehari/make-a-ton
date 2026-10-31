import { Controller, Post, Get, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notifications.service';
import { TemplatesService } from './templates.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { SendNotificationDto, QueryLogsDto, TemplateDto } from './notifications.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notifications: NotificationService,
    private readonly templates: TemplatesService,
  ) {}

  @Post('send')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Send direct notification (WhatsApp or Email)' })
  async send(@Body() dto: SendNotificationDto) {
    return this.notifications.send(dto);
  }

  @Get('logs')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '11.11 Query notification delivery logs with pagination' })
  async getLogs(@Query() query: QueryLogsDto) {
    return this.notifications.getLogs(query);
  }

  @Post('logs/:id/retry')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Retry a failed notification' })
  async retryLog(@Param('id') id: string) {
    return this.notifications.retry(id);
  }

  @Get('templates')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '11.10 List all message templates' })
  async getTemplates() {
    return this.templates.findAll();
  }

  @Get('templates/:key')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Get template by key' })
  async getTemplateByKey(@Param('key') key: string) {
    return this.templates.findByKey(key);
  }

  @Put('templates')
  @Roles('ADMIN')
  @ApiOperation({ summary: '11.10 Create or update a message template (Admin only)' })
  async upsertTemplate(@Body() dto: TemplateDto) {
    return this.templates.upsertTemplate(dto as any);
  }
}
