import { Module, forwardRef } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { TemplatesService } from './templates.service';
import { EmailGatewayService } from './email-gateway.service';
import { NotificationEventsListener } from './notification-events.listener';
import { NotificationsController } from './notifications.controller';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [forwardRef(() => WhatsappModule)],
  controllers: [NotificationsController],
  providers: [
    NotificationService,
    TemplatesService,
    EmailGatewayService,
    NotificationEventsListener,
  ],
  exports: [NotificationService, TemplatesService, EmailGatewayService],
})
export class NotificationsModule {}

