import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailGatewayService {
  private readonly logger = new Logger(EmailGatewayService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST', 'localhost');
    const port = Number(this.config.get<number>('SMTP_PORT', 1025));

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      ignoreTLS: true,
    });
  }

  async sendEmail(input: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<{ messageId: string }> {
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

      this.logger.log(`Email sent to ${input.to}: ${info.messageId}`);
      return { messageId: info.messageId };
    } catch (err: unknown) {
      this.logger.error(`Failed to send email to ${input.to}: ${(err as Error).message}`);
      throw err;
    }
  }
}

