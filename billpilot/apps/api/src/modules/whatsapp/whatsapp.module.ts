import { Module } from '@nestjs/common';
import { WhatsAppGatewayService } from './whatsapp-gateway.service';
import { PhoneService } from './phone.service';
import { WhatsAppBotService } from './whatsapp-bot.service';
import { WhatsAppController } from './whatsapp.controller';

@Module({
  controllers: [WhatsAppController],
  providers: [WhatsAppGatewayService, PhoneService, WhatsAppBotService],
  exports: [WhatsAppGatewayService, PhoneService, WhatsAppBotService],
})
export class WhatsappModule {}

