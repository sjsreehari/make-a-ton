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
  // 11.3 Invoice confirmed delivery
  {
    key: 'invoice_confirmed',
    channel: 'WHATSAPP',
    body: `Hello {{customerName}}! 👋\n\nYour new invoice *{{invoiceNumber}}* for *₹{{total}}* is ready.\n\n📅 *Due Date:* {{dueDate}}\n🔗 *Pay Online:* {{paymentLink}}\n📄 *Download PDF:* {{pdfUrl}}\n\nThank you for choosing Brightloop Software!`,
  },
  {
    key: 'invoice_confirmed',
    channel: 'EMAIL',
    subject: 'Your BillPilot Invoice {{invoiceNumber}} (₹{{total}})',
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
      <h2 style="color: #4f46e5;">BillPilot Invoice {{invoiceNumber}}</h2>
      <p>Dear {{customerName}},</p>
      <p>Your subscription invoice for the current billing period has been generated.</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>Invoice Number:</strong> {{invoiceNumber}}</p>
        <p style="margin: 4px 0;"><strong>Amount Due:</strong> ₹{{total}}</p>
        <p style="margin: 4px 0;"><strong>Due Date:</strong> {{dueDate}}</p>
      </div>
      <p><a href="{{paymentLink}}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Pay Online Now</a></p>
      <p style="color: #64748b; font-size: 12px; margin-top: 30px;">Brightloop Software — Automated Subscription Billing</p>
    </div>`,
  },

  // 11.4 Payment receipt
  {
    key: 'payment_receipt',
    channel: 'WHATSAPP',
    body: `✅ *Payment Received!*\n\nHi {{customerName}}, we successfully received your payment of *₹{{amount}}* for invoice *{{invoiceNumber}}* via {{method}}.\n\nTransaction Ref: {{reference}}\nRemaining Balance: ₹{{remainingBalance}}\n\nThank you for your business!`,
  },
  {
    key: 'payment_receipt',
    channel: 'EMAIL',
    subject: 'Payment Receipt: ₹{{amount}} for Invoice {{invoiceNumber}}',
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #10b981;">Payment Received</h2>
      <p>Hi {{customerName}},</p>
      <p>We received your payment of <strong>₹{{amount}}</strong> via {{method}} on {{date}}.</p>
      <p>Applied to Invoice: <strong>{{invoiceNumber}}</strong></p>
      <p>Your account is up to date.</p>
    </div>`,
  },

  // 11.5 Reminders
  {
    key: 'reminder_d_minus_3',
    channel: 'WHATSAPP',
    body: `Friendly reminder: Your invoice *{{invoiceNumber}}* for *₹{{total}}* is due in 3 days ({{dueDate}}).\n\nQuick pay link: {{paymentLink}}`,
  },
  {
    key: 'reminder_d_minus_3',
    channel: 'EMAIL',
    subject: 'Upcoming Payment Reminder: Invoice {{invoiceNumber}} Due in 3 Days',
    body: `<p>Hi {{customerName}}, invoice {{invoiceNumber}} for ₹{{total}} is due on {{dueDate}}. Pay here: <a href="{{paymentLink}}">{{paymentLink}}</a></p>`,
  },
  {
    key: 'reminder_due_date',
    channel: 'WHATSAPP',
    body: `🔔 *Payment Due Today*\n\nHi {{customerName}}, invoice *{{invoiceNumber}}* for *₹{{total}}* is due today.\n\nPay securely here: {{paymentLink}}`,
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

  // 11.6 Renewal alert
  {
    key: 'subscription_expiring',
    channel: 'WHATSAPP',
    body: `📅 *Subscription Renewal Notice*\n\nHi {{customerName}}, your subscription *{{subscriptionNumber}}* ({{planName}}) renews on *{{expiryDate}}* for ₹{{amount}}.\n\nReply *PAUSE* to hold or *RENEW* to confirm continuation.`,
  },
  {
    key: 'subscription_expiring',
    channel: 'EMAIL',
    subject: 'Your subscription renews in 5 days',
    body: `<p>Hi {{customerName}}, subscription {{subscriptionNumber}} renews on {{expiryDate}}. Contact us or reply to manage your plan.</p>`,
  },

  // 11.7 Failed payment
  {
    key: 'payment_failed',
    channel: 'WHATSAPP',
    body: `❌ *Payment Attempt Failed*\n\nHi {{customerName}}, the payment of *₹{{amount}}* for invoice *{{invoiceNumber}}* could not be processed (Reason: {{reason}}).\n\nPlease update your payment method or complete payment using this recovery link:\n🔗 {{recoveryLink}}`,
  },
  {
    key: 'payment_failed',
    channel: 'EMAIL',
    subject: 'Action Required: Payment Failed for Invoice {{invoiceNumber}}',
    body: `<p>Dear {{customerName}}, your scheduled payment of ₹{{amount}} failed due to: {{reason}}.</p><p><a href="{{recoveryLink}}">Update payment details and retry</a></p>`,
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
