import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface WhatsAppSendResult {
  success: boolean;
  messageId: string;
  provider: 'custom_server' | 'twilio' | 'mock';
  error?: string;
}

@Injectable()
export class WhatsAppGatewayService {
  private readonly logger = new Logger(WhatsAppGatewayService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Send text message to recipient via custom Linux server or Twilio fallback
   */
  async sendText(to: string, message: string): Promise<WhatsAppSendResult> {
    const customServerUrl = this.config.get<string>('WHATSAPP_SERVER_URL');
    const twilioSid = this.config.get<string>('TWILIO_ACCOUNT_SID');
    const twilioAuth = this.config.get<string>('TWILIO_AUTH_TOKEN');
    const twilioFrom = this.config.get<string>('TWILIO_WHATSAPP_FROM', 'whatsapp:+14155238886');

    // 1. Try Custom Linux Server Gateway if configured
    if (customServerUrl) {
      try {
        const response = await fetch(`${customServerUrl}/api/messages/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.get<string>('WHATSAPP_SERVER_API_KEY')
              ? { 'X-API-Key': this.config.get<string>('WHATSAPP_SERVER_API_KEY')! }
              : {}),
          },
          body: JSON.stringify({
            phone: to,
            message,
          }),
        });

        if (response.ok) {
          const data = (await response.json().catch(() => ({}))) as Record<string, any>;
          const msgId = data.messageId || data.id || `custom-${Date.now()}`;
          this.logger.log(`WhatsApp text dispatched via Custom Server to ${to} (id: ${msgId})`);
          return { success: true, messageId: msgId, provider: 'custom_server' };
        } else {
          const errText = await response.text();
          this.logger.warn(`Custom WhatsApp server returned ${response.status}: ${errText}`);
        }
      } catch (err: unknown) {
        this.logger.warn(`Custom WhatsApp server unreachable: ${(err as Error).message}`);
      }
    }

    // 2. Try Twilio WhatsApp if configured
    if (twilioSid && twilioAuth) {
      try {
        const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
        const bodyParams = new URLSearchParams({
          From: twilioFrom,
          To: formattedTo,
          Body: message,
        });

        const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: bodyParams.toString(),
          },
        );

        if (response.ok) {
          const data = (await response.json()) as { sid: string };
          this.logger.log(`WhatsApp text dispatched via Twilio to ${to} (sid: ${data.sid})`);
          return { success: true, messageId: data.sid, provider: 'twilio' };
        } else {
          const errText = await response.text();
          this.logger.warn(`Twilio WhatsApp failed with: ${errText}`);
        }
      } catch (err: unknown) {
        this.logger.warn(`Twilio WhatsApp request error: ${(err as Error).message}`);
      }
    }

    // 3. Fallback: Local dev simulation
    const mockId = `mock-wa-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    this.logger.log(`[SIMULATED WHATSAPP] To: ${to} | ID: ${mockId}\n${message}`);
    return {
      success: true,
      messageId: mockId,
      provider: 'mock',
    };
  }

  /**
   * Send document / PDF invoice link via custom Linux server or Twilio
   */
  async sendDocument(
    to: string,
    docUrl: string,
    caption?: string,
    filename = 'invoice.pdf',
  ): Promise<WhatsAppSendResult> {
    const customServerUrl = this.config.get<string>('WHATSAPP_SERVER_URL');

    if (customServerUrl) {
      try {
        const response = await fetch(`${customServerUrl}/api/messages/send-media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: to,
            mediaUrl: docUrl,
            caption: caption || 'Your BillPilot Invoice',
            filename,
          }),
        });

        if (response.ok) {
          const data = (await response.json().catch(() => ({}))) as Record<string, any>;
          return {
            success: true,
            messageId: data.messageId || `doc-${Date.now()}`,
            provider: 'custom_server',
          };
        }
      } catch (err: unknown) {
        this.logger.warn(`Custom WhatsApp server media error: ${(err as Error).message}`);
      }
    }

    // Default to sending text message with the download link
    const msg = `${caption ? `${caption}\n\n` : ''}📄 Document Link: ${docUrl}`;
    return this.sendText(to, msg);
  }

  /**
   * Check connection status to custom server
   */
  async ping(): Promise<{ connected: boolean; provider: string; serverUrl?: string }> {
    const customServerUrl = this.config.get<string>('WHATSAPP_SERVER_URL');
    if (customServerUrl) {
      try {
        const res = await fetch(`${customServerUrl}/health`, { method: 'GET' });
        return { connected: res.ok, provider: 'custom_server', serverUrl: customServerUrl };
      } catch {
        return { connected: false, provider: 'custom_server', serverUrl: customServerUrl };
      }
    }

    const twilioSid = this.config.get<string>('TWILIO_ACCOUNT_SID');
    if (twilioSid) {
      return { connected: true, provider: 'twilio' };
    }

    return { connected: true, provider: 'mock_local' };
  }
}

