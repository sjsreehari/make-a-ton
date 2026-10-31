import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { NotificationService } from './notifications.service';
import { TemplatesService, ALLOWED_TEMPLATE_VARIABLES } from './templates.service';
import {
  SendNotificationDto,
  sendNotificationSchema,
  CreateTemplateDto,
  createTemplateSchema,
} from './notifications.dto';

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
  @ApiOperation({ summary: 'Send an ad-hoc notification via Email or WhatsApp' })
  async send(@Body(new ZodValidationPipe(sendNotificationSchema)) dto: SendNotificationDto) {
    return this.notifications.send(dto);
  }

  @Get('templates')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'List message templates' })
  async listTemplates() {
    return this.templates.findAll();
  }

  @Get('templates/variables')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'List supported template variables for the editor picker' })
  async listVariables() {
    return {
      allowedVariables: ALLOWED_TEMPLATE_VARIABLES,
    };
  }

  @Post('templates/preview')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Live preview of message template with sample data and validation' })
  async previewTemplate(
    @Body() dto: { body: string; subject?: string; sampleData?: Record<string, string> },
  ) {
    return this.templates.preview(dto);
  }

  @Post('templates')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create or update custom message template with validation' })
  async upsertTemplate(
    @Body(new ZodValidationPipe(createTemplateSchema)) dto: CreateTemplateDto,
  ) {
    return this.templates.upsertTemplate(dto);
  }
}
