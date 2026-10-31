import { Controller, Post, Get, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notifications.service';
import { TemplatesService } from './templates.service';
import { EmailGatewayService } from './email-gateway.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { SendNotificationDto, QueryLogsDto, TemplateDto } from './notifications.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notifications: NotificationService,
    private readonly templates: TemplatesService,
    private readonly emailGateway: EmailGatewayService,
  ) {}

  @Post('send')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Send direct notification (WhatsApp or Email)' })
  async send(@Body() dto: SendNotificationDto) {
    return this.notifications.send(dto);
  }

  @Post('email/test')
  @Public()
  @ApiOperation({ summary: 'Send test email via Brevo' })
  async sendTestEmail(@Body() body: { to: string; subject?: string }) {
    const to = body.to || 'devanandanmr2006@gmail.com';
    const subject = body.subject || 'BillPilot - Brevo Transactional Email Test';
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; max-width: 580px; margin: auto; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
        <div style="background-color: #4f46e5; color: white; padding: 16px 20px; border-radius: 8px 8px 0 0; margin: -24px -24px 20px -24px;">
          <h2 style="margin: 0; font-size: 18px;">BillPilot Email Engine</h2>
        </div>
        <p style="font-size: 15px; color: #1e293b;">Hello!</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.5;">
          This email confirms that your <strong>Brevo Transactional Email integration</strong> is fully operational in BillPilot.
        </p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #64748b;">
          <strong>Sent At:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)
        </div>
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          Brightloop Software • Automated Billing & Notification Pipeline
        </p>
      </div>
    `;

    return this.emailGateway.sendEmail({
      to,
      subject,
      html,
    });
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
