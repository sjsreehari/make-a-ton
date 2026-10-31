import { Controller, Post, Get, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WhatsAppBotService } from './whatsapp-bot.service';
import { WhatsAppGatewayService } from './whatsapp-gateway.service';
import { PhoneService } from './phone.service';
import type { JwtPayload } from '../../common/guards/roles.guard';
import { Request } from 'express';

@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsAppController {
  constructor(
    private readonly botService: WhatsAppBotService,
    private readonly gatewayService: WhatsAppGatewayService,
    private readonly phoneService: PhoneService,
  ) {}

  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inbound WhatsApp webhook (Linux WhatsApp server or Twilio)' })
  async handleWebhook(@Body() body: any, @Req() req: Request) {
    // Handle Twilio format (From, Body) or Custom Server format (from/phone, message/body)
    const from = body.From || body.from || body.phone || body.sender || '';
    const text = body.Body || body.body || body.message || body.text || '';
    const messageId = body.MessageSid || body.id || body.messageId;

    if (!from || !text) {
      return { status: 'ignored', reason: 'Missing from or text' };
    }

    return this.botService.handleInbound({
      from,
      body: text,
      messageId,
      rawPayload: body,
    });
  }

  @Post('test')
  @Public()
  @ApiOperation({ summary: 'Send test message to real phone number' })
  async sendTest(@Body() body: { phone: string; message?: string }) {
    const phone = this.phoneService.normalize(body.phone);
    const text =
      body.message ||
      `🚀 *BillPilot Test Message*\n\nYour WhatsApp connection to the BillPilot automated billing engine is active!`;

    const result = await this.gatewayService.sendText(phone, text);
    return {
      success: result.success,
      phone,
      provider: result.provider,
      messageId: result.messageId,
    };
  }

  @Get('status')
  @Public()
  @ApiOperation({ summary: 'Get WhatsApp gateway connectivity status' })
  async getStatus() {
    return this.gatewayService.ping();
  }

  @Post('verify/request')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request OTP verification for phone number' })
  async requestVerification(
    @CurrentUser() user: JwtPayload,
    @Body() body: { phone: string },
  ) {
    return this.phoneService.requestVerification(user.sub, body.phone);
  }

  @Post('verify/confirm')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm OTP and verify phone number' })
  async confirmVerification(
    @CurrentUser() user: JwtPayload,
    @Body() body: { otp: string },
  ) {
    return this.phoneService.confirmVerification(user.sub, body.otp);
  }

  @Post('opt-in')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update WhatsApp notification opt-in preference' })
  async setOptIn(
    @CurrentUser() user: JwtPayload,
    @Body() body: { enabled: boolean },
  ) {
    return this.phoneService.setOptIn(user.sub, body.enabled);
  }
}
