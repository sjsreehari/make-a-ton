import { Injectable, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { Channel } from '@billpilot/shared';

export const ALLOWED_TEMPLATE_VARIABLES = [
  'customerName',
  'invoiceNumber',
  'total',
  'dueDate',
  'amount',
  'method',
  'reference',
  'remainingBalance',
  'paymentLink',
  'pdfUrl',
  'expiryDate',
  'subscriptionNumber',
  'planName',
  'recoveryLink',
  'reason',
  'date',
];

interface DefaultTemplate {
  key: string;
  channel: Channel;
  subject?: string;
  body: string;
}

const DEFAULT_TEMPLATES: DefaultTemplate[] = [
  // --- Invoice confirmed delivery ---
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

  // --- Payment receipt ---
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
      <h1 style="margin: 0; font-size: 20px; font-weight: 700;">Payment Successful</h1>
      <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Transaction Confirmed</p>
    </div>
    
    <div style="padding: 32px;">
      <p style="font-size: 15px; margin: 0 0 16px 0;">Hello <strong>{{customerName}}</strong>,</p>
      <p style="font-size: 14px; color: #475569; margin: 0 0 24px 0;">
        We have received your payment of <strong>₹{{amount}}</strong> for invoice <strong>{{invoiceNumber}}</strong>.
      </p>

      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 14px;">
        <table style="width: 100%;">
          <tr>
            <td style="color: #166534; padding: 4px 0;">Payment Method:</td>
            <td style="text-align: right; font-weight: 600; color: #14532d;">{{method}}</td>
          </tr>
          <tr>
            <td style="color: #166534; padding: 4px 0;">Reference ID:</td>
            <td style="text-align: right; font-mono; font-size: 12px; color: #14532d;">{{reference}}</td>
          </tr>
          <tr>
            <td style="color: #166534; padding: 4px 0;">Remaining Balance:</td>
            <td style="text-align: right; font-weight: 700; color: #14532d;">₹{{remainingBalance}}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 13px; color: #64748b;">
        You can always view your past invoices and transactions in your <a href="{{paymentLink}}" style="color: #059669;">Client Portal</a>.
      </p>
    </div>
  </div>
</body>
</html>`,
  },

  // --- Payment reminders ---
  {
    key: 'reminder_d_minus_3',
    channel: 'WHATSAPP',
    body: `⏰ *Payment Reminder: 3 Days Left*\n\nHi {{customerName}}, your invoice *{{invoiceNumber}}* for *₹{{total}}* is due on {{dueDate}}.\n\nPay seamlessly using the link below:\n🔗 {{paymentLink}}\n\nIgnore if already paid.`,
  },
  {
    key: 'reminder_due_date',
    channel: 'WHATSAPP',
    body: `⚡ *Invoice Due Today*\n\nHi {{customerName}}, this is a friendly reminder that invoice *{{invoiceNumber}}* (₹{{total}}) is due today.\n\nAvoid any service disruptions by paying now:\n🔗 {{paymentLink}}`,
  },
  {
    key: 'reminder_overdue_d3',
    channel: 'WHATSAPP',
    body: `⚠️ *Urgent: Invoice Overdue (3 Days)*\n\nHi {{customerName}}, invoice *{{invoiceNumber}}* for *₹{{total}}* was due on {{dueDate}} and is now overdue.\n\nPlease settle your outstanding balance:\n🔗 {{paymentLink}}`,
  },
  {
    key: 'reminder_overdue_d7',
    channel: 'WHATSAPP',
    body: `🚨 *Final Notice: Invoice Overdue (7 Days)*\n\nHi {{customerName}}, invoice *{{invoiceNumber}}* (₹{{total}}) is 7 days overdue. Your subscription may be suspended.\n\nPay immediately:\n🔗 {{paymentLink}}`,
  },

  // --- Failed payment ---
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
    try {
      await this.seedDefaultTemplates();
    } catch (err: any) {
      this.logger.warn("Could not seed message templates at init: " + (err?.message || err));
    }
  }

  async seedDefaultTemplates() {
    for (const t of DEFAULT_TEMPLATES) {
      const existing = await this.prisma.messageTemplate.findFirst({
        where: { key: t.key },
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

  extractVariables(text: string): string[] {
    const matches = text.match(/\{\{([a-zA-Z0-9_]+)\}\}/g);
    if (!matches) return [];
    return Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, ''))));
  }

  validateTemplate(body: string, subject?: string): void {
    const varsInBody = this.extractVariables(body);
    const varsInSubject = subject ? this.extractVariables(subject) : [];
    const allVars = Array.from(new Set([...varsInBody, ...varsInSubject]));

    const unknownVars = allVars.filter((v) => !ALLOWED_TEMPLATE_VARIABLES.includes(v));
    if (unknownVars.length > 0) {
      throw new BadRequestException(
        `Invalid template variables rejected: ${unknownVars.map((v) => `{{${v}}}`).join(', ')}. Allowed variables are: ${ALLOWED_TEMPLATE_VARIABLES.join(', ')}`,
      );
    }
  }

  preview(dto: {
    body: string;
    subject?: string;
    sampleData?: Record<string, string>;
  }) {
    this.validateTemplate(dto.body, dto.subject);

    const defaultSamples: Record<string, string> = {
      customerName: 'Acme Corporation',
      invoiceNumber: 'INV-2026-000123',
      total: '1,499.00',
      dueDate: '2026-11-15',
      amount: '1,499.00',
      method: 'UPI',
      reference: 'UPI/1234567890',
      remainingBalance: '0.00',
      paymentLink: 'https://billing.brightloop.io/pay/inv-123',
      pdfUrl: 'https://billing.brightloop.io/invoices/inv-123/pdf',
      expiryDate: '2027-11-01',
      subscriptionNumber: 'SUB-2026-000045',
      planName: 'Enterprise Growth',
      recoveryLink: 'https://billing.brightloop.io/rescue/pay-123',
      reason: 'Insufficient funds',
      date: '2026-10-31',
    };

    const mergedData = { ...defaultSamples, ...(dto.sampleData || {}) };

    const renderText = (str: string) => {
      return str.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
        return mergedData[key] !== undefined ? String(mergedData[key]) : `{{${key}}}`;
      });
    };

    return {
      renderedSubject: dto.subject ? renderText(dto.subject) : undefined,
      renderedBody: renderText(dto.body),
      detectedVariables: this.extractVariables(dto.body + (dto.subject || '')),
      sampleDataUsed: mergedData,
    };
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
    this.validateTemplate(dto.body, dto.subject);

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
