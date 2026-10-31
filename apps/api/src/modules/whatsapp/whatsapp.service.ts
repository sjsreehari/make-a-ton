import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { WhatsappWebhookDto } from './whatsapp.dto';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private readonly prisma: PrismaService) {}

  async handleInbound(dto: WhatsappWebhookDto) {
    this.logger.log(`Received WhatsApp message from ${dto.From}: "${dto.Body}"`);
    return {
      success: true,
      reply: 'Brightloop BillPilot Bot: Thank you for your message. Type HELP for commands.',
    };
  }
}
