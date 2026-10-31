import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import Decimal from 'decimal.js';
import { IPaymentService, PaymentDTO, PaymentMethod } from '@billpilot/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EventBusService } from '../../common/events/event-bus.service';
import { CommonAuditService } from '../../common/audit/audit.service';

@Injectable()
export class PaymentsService implements IPaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly audit: CommonAuditService,
  ) {}

  async record(input: {
    invoiceId: string;
    method: PaymentMethod;
    amount: string;
    date: Date;
    note?: string;
    externalRef?: string;
    recordedById?: string;
  }): Promise<PaymentDTO> {
    const payment = await this.prisma.$transaction(async (tx) => {
      if (input.externalRef) {
        const existing = await tx.payment.findUnique({
          where: { externalRef: input.externalRef },
        });
        if (existing) {
          return existing;
        }
      }

      const invoice = await tx.invoice.findUnique({
        where: { id: input.invoiceId },
      });

      if (!invoice) {
        throw new BadRequestException('Invoice not found');
      }

      if (invoice.status === 'CANCELLED' || invoice.status === 'DRAFT') {
        throw new BadRequestException(`Cannot pay invoice in status ${invoice.status}`);
      }

      const amountDec = new Decimal(input.amount);
      if (amountDec.lte(0)) {
        throw new BadRequestException('Amount must be positive');
      }

      const appliedToInvoice = Decimal.min(amountDec, invoice.amountDue);
      const overpayment = amountDec.minus(appliedToInvoice);

      const p = await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          customerId: invoice.customerId,
          method: input.method as any,
          amount: amountDec,
          paidAt: input.date,
          note: input.note,
          externalRef: input.externalRef,
          recordedById: input.recordedById,
        },
      });

      const newPaid = invoice.amountPaid.plus(appliedToInvoice);
      const newDue = invoice.amountDue.minus(appliedToInvoice);
      const isPaid = newDue.lte(0);

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: newPaid,
          amountDue: newDue,
          status: isPaid ? 'PAID' : invoice.status,
          paidAt: isPaid ? new Date() : undefined,
        },
      });

      if (overpayment.gt(0)) {
        await tx.customer.update({
          where: { id: invoice.customerId },
          data: { creditBalance: { increment: overpayment } },
        });
      }

      return p;
    });

    await this.audit.log({
      actor: input.recordedById ? { id: input.recordedById, role: 'STAFF' } : undefined,
      entity: 'Payment',
      entityId: payment.id,
      action: 'PAYMENT_RECORDED',
      after: payment,
    });

    await this.eventBus.emit('payment.recorded', {
      paymentId: payment.id,
      invoiceId: payment.invoiceId,
      customerId: payment.customerId,
      amount: payment.amount.toFixed(2),
      method: payment.method as PaymentMethod,
    });

    return {
      id: payment.id,
      invoiceId: payment.invoiceId,
      customerId: payment.customerId,
      amount: payment.amount.toFixed(2),
      method: payment.method as PaymentMethod,
      paidAt: payment.paidAt.toISOString(),
      status: payment.status,
    };
  }

  async listForInvoice(invoiceId: string): Promise<PaymentDTO[]> {
    const list = await this.prisma.payment.findMany({
      where: { invoiceId },
      orderBy: { paidAt: 'desc' },
    });

    return list.map((p) => ({
      id: p.id,
      invoiceId: p.invoiceId,
      customerId: p.customerId,
      amount: p.amount.toFixed(2),
      method: p.method as PaymentMethod,
      paidAt: p.paidAt.toISOString(),
      status: p.status,
    }));
  }

  async outstanding(customerId?: string): Promise<{ totalDue: string; overdueCount: number }> {
    const where: any = {
      status: 'CONFIRMED',
    };
    if (customerId) where.customerId = customerId;

    const invoices = await this.prisma.invoice.findMany({
      where,
      select: { amountDue: true, dueDate: true },
    });

    const now = new Date();
    let total = new Decimal(0);
    let overdueCount = 0;

    for (const inv of invoices) {
      total = total.plus(inv.amountDue);
      if (inv.dueDate < now) {
        overdueCount++;
      }
    }

    return {
      totalDue: total.toFixed(2),
      overdueCount,
    };
  }
}
