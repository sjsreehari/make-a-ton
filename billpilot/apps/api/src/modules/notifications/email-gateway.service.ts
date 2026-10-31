import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailSendResult {
  success: boolean;
  messageId: string;
  provider: 'brevo' | 'smtp' | 'mock';
  error?: string;
}

@Injectable()
export class EmailGatewayService {
  private readonly logger = new Logger(EmailGatewayService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST', 'localhost');
    const port = Number(this.config.get<number>('SMTP_PORT', 1025));

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        ignoreTLS: true,
      });
    } catch {
      this.transporter = null;
    }
  }

  /**
   * Send transactional email using Brevo REST API (primary) or SMTP fallback
   */
  async sendEmail(input: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    recipientName?: string;
  }): Promise<{ messageId: string; provider?: string }> {
    const brevoApiKey = this.config.get<string>('BREVO_API_KEY');

    const senderEmail = this.config.get<string>(
      'BREVO_SENDER_EMAIL',
      'devanandanmr2006@gmail.com',
    );
    const senderName = this.config.get<string>(
      'BREVO_SENDER_NAME',
      'BillPilot - Brightloop Software',
    );

    // 1. Try Brevo REST API v3
    if (brevoApiKey) {
      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'api-key': brevoApiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: {
              name: senderName,
              email: senderEmail,
            },
            to: [
              {
                email: input.to,
                name: input.recipientName || input.to.split('@')[0],
              },
            ],
            subject: input.subject,
            htmlContent: input.html,
            textContent: input.text || input.html.replace(/<[^>]+>/g, ''),
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as { messageId: string };
          this.logger.log(`Email dispatched via Brevo to ${input.to} (id: ${data.messageId})`);
          return { messageId: data.messageId, provider: 'brevo' };
        } else {
          const errorText = await response.text();
          this.logger.warn(`Brevo API returned error status ${response.status}: ${errorText}`);
        }
      } catch (err: unknown) {
        this.logger.warn(`Brevo API call failed: ${(err as Error).message}`);
      }
    }

    // 2. Fallback to local SMTP / Mailhog
    if (this.transporter) {
      const from = this.config.get<string>(
        'SMTP_FROM',
        'Brightloop <billing@brightloop.test>',
      );

      try {
        const info = await this.transporter.sendMail({
          from,
          to: input.to,
          subject: input.subject,
          html: input.html,
          text: input.text || input.html.replace(/<[^>]+>/g, ''),
        });

        this.logger.log(`Email dispatched via SMTP to ${input.to}: ${info.messageId}`);
        return { messageId: info.messageId, provider: 'smtp' };
      } catch (err: unknown) {
        this.logger.warn(`SMTP email failed: ${(err as Error).message}`);
      }
    }

    // 3. Fallback dev simulation
    const mockId = `mock-email-${Date.now()}`;
    this.logger.log(`[SIMULATED EMAIL] To: ${input.to} | Subject: "${input.subject}" | ID: ${mockId}`);
    return { messageId: mockId, provider: 'mock' };
  }
}
