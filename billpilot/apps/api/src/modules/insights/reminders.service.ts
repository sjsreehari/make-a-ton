import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from '../notifications/notifications.service';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  /**
   * 11.5 Daily reminder sweep @ 08:00 UTC
   * Checks for D-3, Due Date, and Overdue milestones
   */
  @Cron('0 8 * * *')
  async runReminderSweep() {
    this.logger.log('Starting automated invoice payment reminder sweep...');
    const now = new Date();
    const todayStr = now.toISOString().substring(0, 10);

    const pendingInvoices = await this.prisma.invoice.findMany({
      where: {
        status: 'CONFIRMED',
        amountDue: { gt: 0 },
      },
    });

    let dMinus3Count = 0;
    let dueTodayCount = 0;

    for (const inv of pendingInvoices) {
      const dueDate = new Date(inv.dueDate);
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const customer = await this.prisma.customer.findUnique({
        where: { id: inv.customerId },
        include: { user: true },
      });

      if (!customer || !customer.phone) continue;

      const paylink = await this.prisma.paymentLink.findFirst({
        where: { invoiceId: inv.id },
      });
      const paymentLink = paylink?.shortUrl || `http://localhost:3000/my/invoices`;

      const templateData = {
        customerName: customer.name,
        invoiceNumber: inv.number,
        total: Number(inv.amountDue).toFixed(2),
        dueDate: dueDate.toLocaleDateString('en-IN'),
        paymentLink,
      };

      // Milestone: D-3 (Exactly 3 days before due date)
      if (diffDays === 3) {
        const dedupeKey = `reminder_d3_${inv.id}_${todayStr}`;
        const sent = await this.notifications.send({
          channel: 'WHATSAPP',
          template: 'reminder_d_minus_3',
          to: customer.phone,
          data: templateData,
          customerId: customer.id,
          entity: 'Invoice',
          entityId: inv.id,
          dedupeKey,
        });
        if (sent.queued) dMinus3Count++;
      }

      // Milestone: Due Today (diffDays === 0)
      if (diffDays === 0) {
        const dedupeKey = `reminder_duetoday_${inv.id}_${todayStr}`;
        const sent = await this.notifications.send({
          channel: 'WHATSAPP',
          template: 'reminder_due_date',
          to: customer.phone,
          data: templateData,
          customerId: customer.id,
          entity: 'Invoice',
          entityId: inv.id,
          dedupeKey,
        });
        if (sent.queued) dueTodayCount++;
      }
    }

    return {
      success: true,
      pendingInvoicesChecked: pendingInvoices.length,
      dMinus3Count,
      dueTodayCount,
    };
  }
}

