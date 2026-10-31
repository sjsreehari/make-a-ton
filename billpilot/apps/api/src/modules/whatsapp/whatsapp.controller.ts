import { Controller, Post, Body } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappWebhookDto } from './whatsapp.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('webhooks/twilio/whatsapp')
export class WhatsappController {
  constructor(private readonly service: WhatsappService) {}

  @Post()
  @Public()
  async handleInbound(@Body() dto: WhatsappWebhookDto) {
    return this.service.handleInbound(dto);
  }
}
