import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { Channel } from '@billpilot/shared';

interface DefaultTemplate {
  key: string;
  channel: Channel;
  subject?: string;
  body: string;
}

const DEFAULT_TEMPLATES: DefaultTemplate[] = [
  // --- 11.3 Invoice confirmed delivery ---
  {
    key: 'invoice_confirmed',
    channel: 'WHATSAPP',
    body: `Hello {{customerName}}! 👋\n\nYour new invoice *{{invoiceNumber}}* for *₹{{total}}* is ready.\n\n📅 *Due Date:* {{dueDate}}\n🔗 *Pay Online:* {{paymentLink}}\n📄 *Download PDF:* {{pdfUrl}}\n\nThank you for choosing Brightloop Software!`,
  },
  {
    key: 'invoice_confirmed',
    channel: 'EMAIL',
    subject: 'Invoice {{invoiceNumber}} from Brightloop Software (₹{{total}})',
    body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
    <div style="background-color: #4f46e5; padding: 24px 32px; color: #ffffff;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">BillPilot</h1>
      <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Automated Subscription Billing</p>
    </div>
    
    <div style="padding: 32px;">
      <p style="font-size: 15px; margin: 0 0 16px 0;">Hello <strong>{{customerName}}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.5; color: #475569; margin: 0 0 24px 0;">
        Your recurring billing invoice for <strong>{{planName}}</strong> is now available for review and settlement.
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Invoice Number:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #0f172a;">{{invoiceNumber}}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Due Date:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #0f172a;">{{dueDate}}</td>
          </tr>
          <tr style="border-top: 1px solid #e2e8f0;">
            <td style="padding: 12px 0 4px 0; font-size: 16px; font-weight: 700; color: #0f172a;">Total Amount Due:</td>
            <td style="padding: 12px 0 4px 0; text-align: right; font-size: 18px; font-weight: 800; color: #4f46e5;">₹{{total}}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="{{paymentLink}}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 6px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);">
          Pay Invoice Online
        </a>
      </div>

      <p style="font-size: 13px; color: #64748b; text-align: center; margin: 16px 0 0 0;">
        Or <a href="{{pdfUrl}}" style="color: #4f46e5; text-decoration: underline;">download full GST PDF receipt</a>
      </p>
    </div>

    <div style="background-color: #f1f5f9; padding: 16px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
      Brightloop Software • GSTIN: 29ABCDE1234F1Z5 • support@brightloop.test
    </div>
  </div>
</body>
</html>`,
  },

  // --- 11.4 Payment receipt ---
  {
    key: 'payment_receipt',
    channel: 'WHATSAPP',
    body: `✅ *Payment Received!*\n\nHi {{customerName}}, we successfully received your payment of *₹{{amount}}* for invoice *{{invoiceNumber}}* via {{method}}.\n\nTransaction Ref: {{reference}}\nRemaining Balance: ₹{{remainingBalance}}\n\nThank you for your business!`,
  },
  {
    key: 'payment_receipt',
    channel: 'EMAIL',
    subject: 'Payment Confirmation: ₹{{amount}} for Invoice {{invoiceNumber}}',
    body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
    <div style="background-color: #059669; padding: 24px 32px; color: #ffffff;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 700;">Payment Received</h1>
      <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Thank you for your prompt payment</p>
    </div>

    <div style="padding: 32px;">
      <p style="font-size: 15px; margin: 0 0 16px 0;">Hello <strong>{{customerName}}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.5; color: #475569; margin: 0 0 24px 0;">
        We have successfully received and processed your payment of <strong>₹{{amount}}</strong>.
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Invoice Reference:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600;">{{invoiceNumber}}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Payment Method:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600;">{{method}}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Transaction Reference:</td>
            <td style="padding: 6px 0; text-align: right; font-family: monospace; font-size: 12px;">{{reference}}</td>
          </tr>
          <tr style="border-top: 1px solid #e2e8f0;">
            <td style="padding: 10px 0 0 0; font-weight: 700; color: #0f172a;">Amount Paid:</td>
            <td style="padding: 10px 0 0 0; text-align: right; font-size: 16px; font-weight: 800; color: #059669;">₹{{amount}}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 13px; color: #64748b; margin: 0;">
        Your remaining account balance for this invoice is <strong>₹{{remainingBalance}}</strong>.
      </p>
    </div>

    <div style="background-color: #f1f5f9; padding: 16px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
      Brightloop Software • Automated Billing & Reconciliation
    </div>
  </div>
</body>
</html>`,
  },

  // --- 11.5 Reminders ---
  {
    key: 'reminder_d_minus_3',
    channel: 'WHATSAPP',
    body: `Friendly reminder: Your invoice *{{invoiceNumber}}* for *₹{{total}}* is due in 3 days ({{dueDate}}).\n\nQuick pay link: {{paymentLink}}`,
  },
  {
    key: 'reminder_d_minus_3',
    channel: 'EMAIL',
    subject: 'Upcoming Payment Reminder: Invoice {{invoiceNumber}} (Due {{dueDate}})',
    body: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px;">
    <h2 style="color: #d97706; margin-top: 0;">Payment Due in 3 Days</h2>
    <p>Hi <strong>{{customerName}}</strong>,</p>
    <p>This is a quick reminder that invoice <strong>{{invoiceNumber}}</strong> for <strong>₹{{total}}</strong> is scheduled for payment on <strong>{{dueDate}}</strong>.</p>
    <div style="margin: 24px 0;">
      <a href="{{paymentLink}}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Pay Now &rarr;</a>
    </div>
    <p style="color: #64748b; font-size: 13px;">If you already settled this bill or have an autopay mandate enabled, you can safely ignore this notice.</p>
  </div>
</body>
</html>`,
  },
  {
    key: 'reminder_due_date',
    channel: 'WHATSAPP',
    body: `🔔 *Payment Due Today*\n\nHi {{customerName}}, invoice *{{invoiceNumber}}* for *₹{{total}}* is due today.\n\nPay securely here: {{paymentLink}}`,
  },
  {
    key: 'reminder_due_date',
    channel: 'EMAIL',
    subject: 'Action Required: Invoice {{invoiceNumber}} is Due Today (₹{{total}})',
    body: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px;">
    <h2 style="color: #dc2626; margin-top: 0;">Invoice Due Today</h2>
    <p>Hi <strong>{{customerName}}</strong>,</p>
    <p>Invoice <strong>{{invoiceNumber}}</strong> for <strong>₹{{total}}</strong> is due today. Please complete payment to keep your subscription in good standing.</p>
    <div style="margin: 24px 0;">
      <a href="{{paymentLink}}" style="background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Pay ₹{{total}} Now</a>
    </div>
  </div>
</body>
</html>`,
  },
  {
    key: 'reminder_overdue_d3',
    channel: 'WHATSAPP',
    body: `⚠️ *Payment Overdue (3 Days)*\n\nHi {{customerName}}, invoice *{{invoiceNumber}}* (₹{{total}}) is now 3 days overdue. Please clear this balance to avoid service interruption:\n\n{{paymentLink}}`,
  },
  {
    key: 'reminder_overdue_d7',
    channel: 'WHATSAPP',
    body: `🚨 *Final Reminder: Payment Overdue (7 Days)*\n\nHi {{customerName}}, invoice *{{invoiceNumber}}* is 7 days past due. Your subscription is scheduled for temporary pause if unpaid.\n\nImmediate payment link: {{paymentLink}}`,
  },

  // --- 11.6 Renewal alert ---
  {
    key: 'subscription_expiring',
    channel: 'WHATSAPP',
    body: `📅 *Subscription Renewal Notice*\n\nHi {{customerName}}, your subscription *{{subscriptionNumber}}* ({{planName}}) renews on *{{expiryDate}}* for ₹{{amount}}.\n\nReply *PAUSE* to hold or *RENEW* to confirm continuation.`,
  },
  {
    key: 'subscription_expiring',
    channel: 'EMAIL',
    subject: 'Upcoming Subscription Renewal: {{subscriptionNumber}} ({{planName}})',
    body: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px;">
    <h2 style="color: #4f46e5; margin-top: 0;">Subscription Renewal Notice</h2>
    <p>Hi <strong>{{customerName}}</strong>,</p>
    <p>Your subscription <strong>{{subscriptionNumber}}</strong> for <strong>{{planName}}</strong> is scheduled to renew on <strong>{{expiryDate}}</strong> for <strong>₹{{amount}}</strong>.</p>
    <p>If you wish to change your plan or pause billing, please manage your account in the customer portal or reply to our WhatsApp assistant.</p>
    <p style="color: #64748b; font-size: 13px;">Thank you for continuing with BillPilot!</p>
  </div>
</body>
</html>`,
  },

  // --- 11.7 Failed payment ---
  {
    key: 'payment_failed',
    channel: 'WHATSAPP',
    body: `❌ *Payment Attempt Failed*\n\nHi {{customerName}}, the payment of *₹{{amount}}* for invoice *{{invoiceNumber}}* could not be processed (Reason: {{reason}}).\n\nPlease update your payment method or complete payment using this recovery link:\n🔗 {{recoveryLink}}`,
  },
  {
    key: 'payment_failed',
    channel: 'EMAIL',
    subject: 'Payment Failed for Invoice {{invoiceNumber}} — Action Required',
    body: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #fecdd3; padding: 32px;">
    <h2 style="color: #e11d48; margin-top: 0;">Payment Attempt Failed</h2>
    <p>Dear <strong>{{customerName}}</strong>,</p>
    <p>We were unable to process your recurring payment of <strong>₹{{amount}}</strong> for invoice <strong>{{invoiceNumber}}</strong>.</p>
    <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 12px 16px; margin: 20px 0; font-size: 14px;">
      <strong>Reason:</strong> {{reason}}
    </div>
    <p>Please update your payment method or complete payment using the link below to prevent service interruption:</p>
    <div style="margin: 24px 0;">
      <a href="{{recoveryLink}}" style="background-color: #e11d48; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Update Payment & Retry &rarr;</a>
    </div>
  </div>
</body>
</html>`,
  },
];

@Injectable()
export class TemplatesService implements OnModuleInit {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultTemplates();
  }

  async seedDefaultTemplates() {
    for (const t of DEFAULT_TEMPLATES) {
      const existing = await this.prisma.messageTemplate.findFirst({
        where: { key: t.key, channel: t.channel as any },
      });
      if (!existing) {
        await this.prisma.messageTemplate.create({
          data: {
            key: t.key,
            channel: t.channel as any,
            subject: t.subject,
            body: t.body,
            isActive: true,
          },
        });
      } else if (t.channel === 'EMAIL' && !existing.body.includes('<!DOCTYPE html>')) {
        // Upgrade existing email templates to rich HTML
        await this.prisma.messageTemplate.update({
          where: { id: existing.id },
          data: {
            subject: t.subject,
            body: t.body,
          },
        });
      }
    }
    this.logger.log('Message templates verified & seeded.');
  }

  async render(
    templateKey: string,
    channel: 'WHATSAPP' | 'EMAIL',
    data: Record<string, unknown>,
  ): Promise<{ subject?: string; body: string }> {
    const template = await this.prisma.messageTemplate.findFirst({
      where: { key: templateKey, channel: channel as any, isActive: true },
    });

    const fallback = DEFAULT_TEMPLATES.find(
      (t) => t.key === templateKey && t.channel === channel,
    );

    const bodyTemplate = template?.body || fallback?.body || `Notification: ${JSON.stringify(data)}`;
    const subjectTemplate = template?.subject || fallback?.subject;

    const replaceVars = (str: string) => {
      return str.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
        const val = data[key];
        return val !== undefined && val !== null ? String(val) : '';
      });
    };

    return {
      subject: subjectTemplate ? replaceVars(subjectTemplate) : undefined,
      body: replaceVars(bodyTemplate),
    };
  }

  async findAll() {
    return this.prisma.messageTemplate.findMany({
      orderBy: [{ key: 'asc' }, { channel: 'asc' }],
    });
  }

  async findByKey(key: string) {
    return this.prisma.messageTemplate.findMany({ where: { key } });
  }

  async upsertTemplate(dto: {
    key: string;
    channel: Channel;
    subject?: string;
    body: string;
    isActive?: boolean;
  }) {
    const existing = await this.prisma.messageTemplate.findFirst({
      where: { key: dto.key, channel: dto.channel as any },
    });

    if (existing) {
      return this.prisma.messageTemplate.update({
        where: { id: existing.id },
        data: {
          subject: dto.subject,
          body: dto.body,
          isActive: dto.isActive ?? true,
        },
      });
    }

    return this.prisma.messageTemplate.create({
      data: {
        key: dto.key,
        channel: dto.channel as any,
        subject: dto.subject,
        body: dto.body,
        isActive: dto.isActive ?? true,
      },
    });
  }
}
