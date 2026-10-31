import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from './notifications.service';
import { DomainEvent, InvoiceEvent, PaymentEvent, PaymentFailedEvent, SubscriptionEvent } from '@billpilot/shared';

@Injectable()
export class NotificationEventsListener {
  private readonly logger = new Logger(NotificationEventsListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  /**
   * 11.3 Invoice confirmed delivery: sends PDF download and payment link via WhatsApp and Email
   */
  @OnEvent(DomainEvent.INVOICE_CONFIRMED)
  async handleInvoiceConfirmed(payload: InvoiceEvent) {
    this.logger.log(`Handling invoice.confirmed event for invoice ${payload.invoiceId}`);

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: payload.invoiceId },
      include: {
        subscription: { include: { plan: true } },
      },
    });

    if (!invoice) return;

    const customer = await this.prisma.customer.findUnique({
      where: { id: invoice.customerId },
      include: { user: true },
    });

    if (!customer) return;

    const paylink = await this.prisma.paymentLink.findFirst({
      where: { invoiceId: invoice.id },
    });

    const paymentLink = paylink?.shortUrl || `http://localhost:3000/my/invoices`;
    const pdfUrl = `http://localhost:4000/api/v1/billing/invoices/${invoice.id}/pdf`;
    const dueDateStr = new Date(invoice.dueDate).toLocaleDateString('en-IN');

    const templateData = {
      customerName: customer.name,
      invoiceNumber: invoice.number,
      total: Number(invoice.total).toFixed(2),
      dueDate: dueDateStr,
      paymentLink,
      pdfUrl,
      planName: invoice.subscription?.plan?.name || 'Subscription',
    };

    // 1. Send WhatsApp if phone exists and customer hasn't opted out
    if (customer.phone && customer.user?.whatsappOptIn !== false) {
      await this.notifications.send({
        channel: 'WHATSAPP',
        template: 'invoice_confirmed',
        to: customer.phone,
        data: templateData,
        customerId: customer.id,
        entity: 'Invoice',
        entityId: invoice.id,
      });
    }

    // 2. Always send Email
    if (customer.email) {
      await this.notifications.send({
        channel: 'EMAIL',
        template: 'invoice_confirmed',
        to: customer.email,
        data: templateData,
        customerId: customer.id,
        entity: 'Invoice',
        entityId: invoice.id,
      });
    }

    // Update sentAt timestamp on invoice
    await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: { sentAt: new Date() },
    });
  }

  /**
   * 11.4 Payment receipt delivery on payment recorded
   */
  @OnEvent(DomainEvent.PAYMENT_RECORDED)
  async handlePaymentRecorded(payload: PaymentEvent) {
    this.logger.log(`Handling payment.recorded event for payment ${payload.paymentId}`);

    const payment = await this.prisma.payment.findUnique({
      where: { id: payload.paymentId },
      include: { invoice: true },
    });

    if (!payment) return;

    const customer = await this.prisma.customer.findUnique({
      where: { id: payment.customerId },
      include: { user: true },
    });

    if (!customer) return;

    const templateData = {
      customerName: customer.name,
      invoiceNumber: payment.invoice.number,
      amount: Number(payment.amount).toFixed(2),
      method: payment.method,
      reference: payment.externalRef || payment.id,
      remainingBalance: Number(payment.invoice.amountDue).toFixed(2),
      date: new Date(payment.paidAt).toLocaleDateString('en-IN'),
    };

    // Send WhatsApp
    if (customer.phone && customer.user?.whatsappOptIn !== false) {
      await this.notifications.send({
        channel: 'WHATSAPP',
        template: 'payment_receipt',
        to: customer.phone,
        data: templateData,
        customerId: customer.id,
        entity: 'Payment',
        entityId: payment.id,
      });
    }

    // Send Email
    if (customer.email) {
      await this.notifications.send({
        channel: 'EMAIL',
        template: 'payment_receipt',
        to: customer.email,
        data: templateData,
        customerId: customer.id,
        entity: 'Payment',
        entityId: payment.id,
      });
    }
  }

  /**
   * 11.6 Renewal alert event
   */
  @OnEvent(DomainEvent.SUBSCRIPTION_EXPIRING)
  async handleSubscriptionExpiring(payload: SubscriptionEvent) {
    this.logger.log(`Handling subscription.expiring for subscription ${payload.subscriptionId}`);

    const sub = await this.prisma.subscription.findUnique({
      where: { id: payload.subscriptionId },
      include: { customer: { include: { user: true } }, plan: true },
    });

    if (!sub || !sub.customer) return;

    const expiryStr = sub.expiryDate ? new Date(sub.expiryDate).toLocaleDateString('en-IN') : 'soon';
    const templateData = {
      customerName: sub.customer.name,
      subscriptionNumber: sub.number,
      planName: sub.plan.name,
      expiryDate: expiryStr,
      amount: Number(sub.plan.price).toFixed(2),
    };

    if (sub.customer.phone && sub.customer.user?.whatsappOptIn !== false) {
      await this.notifications.send({
        channel: 'WHATSAPP',
        template: 'subscription_expiring',
        to: sub.customer.phone,
        data: templateData,
        customerId: sub.customer.id,
        entity: 'Subscription',
        entityId: sub.id,
      });
    }

    if (sub.customer.email) {
      await this.notifications.send({
        channel: 'EMAIL',
        template: 'subscription_expiring',
        to: sub.customer.email,
        data: templateData,
        customerId: sub.customer.id,
        entity: 'Subscription',
        entityId: sub.id,
      });
    }
  }

  /**
   * 11.7 Failed payment notice
   */
  @OnEvent(DomainEvent.PAYMENT_FAILED)
  async handlePaymentFailed(payload: PaymentFailedEvent) {
    this.logger.log(`Handling payment.failed event for invoice ${payload.invoiceId}`);

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: payload.invoiceId },
    });

    if (!invoice) return;

    const customer = await this.prisma.customer.findUnique({
      where: { id: payload.customerId },
      include: { user: true },
    });

    if (!customer) return;

    const paylink = await this.prisma.paymentLink.findFirst({
      where: { invoiceId: invoice.id },
    });

    const recoveryLink = paylink?.shortUrl || `http://localhost:3000/my/invoices/${invoice.id}`;
    const templateData = {
      customerName: customer.name,
      invoiceNumber: invoice.number,
      amount: Number(invoice.amountDue).toFixed(2),
      reason: payload.message || payload.failureKind || 'Card declined',
      recoveryLink,
    };

    if (customer.phone && customer.user?.whatsappOptIn !== false) {
      await this.notifications.send({
        channel: 'WHATSAPP',
        template: 'payment_failed',
        to: customer.phone,
        data: templateData,
        customerId: customer.id,
        entity: 'Invoice',
        entityId: invoice.id,
      });
    }

    if (customer.email) {
      await this.notifications.send({
        channel: 'EMAIL',
        template: 'payment_failed',
        to: customer.email,
        data: templateData,
        customerId: customer.id,
        entity: 'Invoice',
        entityId: invoice.id,
      });
    }
  }
}
