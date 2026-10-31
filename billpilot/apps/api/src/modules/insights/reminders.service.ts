import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import Decimal from 'decimal.js';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from '../notifications/notifications.service';
import { CommonAuditService } from '../../common/audit/audit.service';

export interface ReminderScheduleRule {
  offsetDays: number; // e.g. -3 (3 days before due), 0 (due today), 3 (3 days overdue), 7 (7 days overdue)
  templateKey: string;
  lateFeePercent?: number; // e.g. 5 = 5% of amountDue
  lateFeeFixed?: number; // e.g. 250
}

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  // Configurable reminder schedule table
  private scheduleRules: ReminderScheduleRule[] = [
    { offsetDays: -3, templateKey: 'reminder_d_minus_3' },
    { offsetDays: 0, templateKey: 'reminder_due_date' },
    { offsetDays: 3, templateKey: 'reminder_overdue_d3' },
    { offsetDays: 7, templateKey: 'reminder_overdue_d7', lateFeePercent: 5 },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
    private readonly audit: CommonAuditService,
  ) {}

  getScheduleRules(): ReminderScheduleRule[] {
    return this.scheduleRules;
  }

  setScheduleRules(rules: ReminderScheduleRule[]) {
    this.scheduleRules = rules;
  }

  /**
   * Daily reminder sweep @ 08:00 UTC
   * Checks configurable offset schedule, applies late fee exactly once, dedupes reminders.
   */
  @Cron('0 8 * * *')
  async runReminderSweep(asOf: Date = new Date()) {
    this.logger.log('Starting automated invoice payment reminder sweep...');
    const todayStr = asOf.toISOString().substring(0, 10);

    const pendingInvoices = await this.prisma.invoice.findMany({
      where: {
        status: 'CONFIRMED',
        amountDue: { gt: 0 },
      },
      include: {
        lines: true,
      },
    });

    let remindersSent = 0;
    let lateFeesAdded = 0;

    for (const inv of pendingInvoices) {
      const dueDate = new Date(inv.dueDate);
      // diffDays: positive = days past due; negative = days before due
      const diffTime = asOf.getTime() - dueDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      const customer = await this.prisma.customer.findUnique({
        where: { id: inv.customerId },
      });

      if (!customer || !customer.phone) continue;

      for (const rule of this.scheduleRules) {
        if (diffDays === rule.offsetDays) {
          // 1. Check & Add late fee exactly once if configured
          if (rule.lateFeePercent || rule.lateFeeFixed) {
            const hasLateFee = inv.lines.some((l) => l.kind === 'LATE_FEE');
            if (!hasLateFee) {
              let fee = new Decimal(0);
              if (rule.lateFeePercent) {
                fee = inv.amountDue
                  .times(rule.lateFeePercent)
                  .dividedBy(100)
                  .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
              } else if (rule.lateFeeFixed) {
                fee = new Decimal(rule.lateFeeFixed);
              }

              if (fee.gt(0)) {
                await this.prisma.$transaction(async (tx) => {
                  await tx.invoiceLine.create({
                    data: {
                      invoiceId: inv.id,
                      description: `Late payment fee (${rule.offsetDays} days overdue)`,
                      quantity: 1,
                      unitPrice: fee,
                      lineSubtotal: fee,
                      taxRatePercent: new Decimal(0),
                      taxAmount: new Decimal(0),
                      lineTotal: fee,
                      kind: 'LATE_FEE',
                    },
                  });

                  await tx.invoice.update({
                    where: { id: inv.id },
                    data: {
                      total: { increment: fee },
                      amountDue: { increment: fee },
                    },
                  });
                });

                await this.audit.log({
                  entity: 'Invoice',
                  entityId: inv.id,
                  action: 'LATE_FEE_ASSESSED',
                  after: { fee: fee.toFixed(2), ruleOffsetDays: rule.offsetDays },
                });

                lateFeesAdded++;
              }
            }
          }

          // 2. Send reminder with deduplication key
          const dedupeKey = `reminder_rule_${rule.offsetDays}_${inv.id}_${todayStr}`;
          const paymentLink = `https://billing.brightloop.io/my/invoices`;

          const templateData = {
            customerName: customer.name,
            invoiceNumber: inv.number,
            total: inv.amountDue.toFixed(2),
            dueDate: dueDate.toLocaleDateString('en-IN'),
            paymentLink,
          };

          const sent = await this.notifications.send({
            channel: 'WHATSAPP',
            template: rule.templateKey,
            to: customer.phone,
            data: templateData,
            customerId: customer.id,
            entity: 'Invoice',
            entityId: inv.id,
            dedupeKey,
          });

          if (sent.queued) remindersSent++;
        }
      }
    }

    return {
      success: true,
      pendingInvoicesChecked: pendingInvoices.length,
      remindersSent,
      lateFeesAdded,
    };
  }
}
