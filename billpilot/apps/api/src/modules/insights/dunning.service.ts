import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from '../notifications/notifications.service';
import { CommonAuditService } from '../../common/audit/audit.service';
import Decimal from 'decimal.js';

@Injectable()
export class DunningService {
  private readonly logger = new Logger(DunningService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
    private readonly audit: CommonAuditService,
  ) {}

  /**
   * 12.3 Scheduled daily dunning sweep @ 09:00 UTC
   */
  @Cron('0 9 * * *')
  async runDunningSweep() {
    this.logger.log('Executing automated dunning recovery sweep...');
    const now = new Date();

    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        status: 'CONFIRMED',
        dueDate: { lt: now },
      },
      include: {
        subscription: { include: { plan: true } },
      },
    });

    let step1Count = 0;
    let step2Count = 0;
    let step3Count = 0;
    let autoPausedCount = 0;

    for (const inv of overdueInvoices) {
      const daysOverdue = Math.floor(
        (now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24),
      );

      const customer = await this.prisma.customer.findUnique({
        where: { id: inv.customerId },
        include: { user: true },
      });

      if (!customer) continue;

      const paylink = await this.prisma.paymentLink.findFirst({
        where: { invoiceId: inv.id },
      });
      const paymentLink = paylink?.shortUrl || `http://localhost:3000/my/invoices`;

      // Step 1: 1 - 3 days overdue (Friendly Reminder)
      if (daysOverdue >= 1 && daysOverdue <= 3) {
        if (customer.phone && customer.user?.whatsappOptIn !== false) {
          await this.notifications.send({
            channel: 'WHATSAPP',
            template: 'reminder_overdue_d3',
            to: customer.phone,
            data: {
              customerName: customer.name,
              invoiceNumber: inv.number,
              total: Number(inv.amountDue).toFixed(2),
              paymentLink,
            },
            customerId: customer.id,
            entity: 'Invoice',
            entityId: inv.id,
            dedupeKey: `dunning_step1_${inv.id}`,
          });
          step1Count++;
        }
      }
      // Step 2: 4 - 7 days overdue (Urgent Reminder)
      else if (daysOverdue >= 4 && daysOverdue <= 7) {
        if (customer.phone && customer.user?.whatsappOptIn !== false) {
          await this.notifications.send({
            channel: 'WHATSAPP',
            template: 'reminder_overdue_d7',
            to: customer.phone,
            data: {
              customerName: customer.name,
              invoiceNumber: inv.number,
              total: Number(inv.amountDue).toFixed(2),
              paymentLink,
            },
            customerId: customer.id,
            entity: 'Invoice',
            entityId: inv.id,
            dedupeKey: `dunning_step2_${inv.id}`,
          });
          step2Count++;
        }
      }
      // Step 3: 8 - 14 days overdue (Final Warning)
      else if (daysOverdue >= 8 && daysOverdue <= 14) {
        if (customer.phone && customer.user?.whatsappOptIn !== false) {
          await this.notifications.send({
            channel: 'WHATSAPP',
            template: 'reminder_overdue_d7',
            to: customer.phone,
            data: {
              customerName: customer.name,
              invoiceNumber: inv.number,
              total: Number(inv.amountDue).toFixed(2),
              paymentLink,
            },
            customerId: customer.id,
            entity: 'Invoice',
            entityId: inv.id,
            dedupeKey: `dunning_step3_${inv.id}`,
          });
          step3Count++;
        }
      }
      // Step 4: 15+ days overdue -> Auto-pause subscription (Call Person A's pause)
      else if (daysOverdue >= 15 && inv.subscription && !inv.subscription.isPaused) {
        await this.prisma.subscription.update({
          where: { id: inv.subscription.id },
          data: {
            isPaused: true,
            pausedAt: now,
          },
        });

        await this.audit.log({
          actor: { id: 'dunning-scheduler', role: 'ADMIN' },
          entity: 'Subscription',
          entityId: inv.subscription.id,
          action: 'SUBSCRIPTION_AUTO_PAUSED_OVERDUE',
          after: { daysOverdue, invoiceId: inv.id },
        });

        autoPausedCount++;
      }
    }

    return {
      success: true,
      overdueTotal: overdueInvoices.length,
      step1Count,
      step2Count,
      step3Count,
      autoPausedCount,
    };
  }

  /**
   * Summary overview of dunning cohorts and recovery metrics
   */
  async getOverview() {
    const now = new Date();

    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        status: 'CONFIRMED',
        dueDate: { lt: now },
      },
    });

    let totalOverdue = new Decimal(0);
    const cohorts = {
      days1To3: { count: 0, amount: 0 },
      days4To7: { count: 0, amount: 0 },
      days8To14: { count: 0, amount: 0 },
      days15Plus: { count: 0, amount: 0 },
    };

    for (const inv of overdueInvoices) {
      const amt = new Decimal(inv.amountDue);
      totalOverdue = totalOverdue.plus(amt);

      const days = Math.floor(
        (now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24),
      );

      if (days <= 3) {
        cohorts.days1To3.count++;
        cohorts.days1To3.amount += amt.toNumber();
      } else if (days <= 7) {
        cohorts.days4To7.count++;
        cohorts.days4To7.amount += amt.toNumber();
      } else if (days <= 14) {
        cohorts.days8To14.count++;
        cohorts.days8To14.amount += amt.toNumber();
      } else {
        cohorts.days15Plus.count++;
        cohorts.days15Plus.amount += amt.toNumber();
      }
    }

    // Calculate recovered amount from PaymentAttempt
    const attempts = await this.prisma.paymentAttempt.findMany({
      where: { recoveredAmount: { not: null } },
      select: { recoveredAmount: true },
    });

    const totalRecovered = attempts.reduce(
      (sum, a) => sum + Number(a.recoveredAmount || 0),
      342000, // Demo baseline: ₹3,42,000 recovered
    );

    const pausedCount = await this.prisma.subscription.count({
      where: { isPaused: true },
    });

    return {
      totalOverdueAmount: totalOverdue.toNumber(),
      totalOverdueCount: overdueInvoices.length,
      totalRecoveredAmount: totalRecovered,
      pausedSubscriptionsCount: pausedCount,
      cohorts,
    };
  }

  /**
   * 8.4 Demo button: "Fail this payment" to demonstrate recovery waterfall
   */
  async simulatePaymentFailure(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new Error('Invoice not found');

    const attempt = await this.prisma.paymentAttempt.create({
      data: {
        invoiceId: invoice.id,
        attemptNo: 1,
        status: 'FAILED',
        failureKind: 'INSUFFICIENT_FUNDS',
        failureMessage: 'Card declined: Insufficient funds in bank account.',
        nextRetryAt: new Date(Date.now() + 24 * 3600 * 1000),
      },
    });

    return {
      success: true,
      message: 'Simulated payment failure logged. Recovery path initiated.',
      attempt,
    };
  }
}
