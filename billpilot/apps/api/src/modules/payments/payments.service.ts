import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import Decimal from 'decimal.js';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CommonAuditService } from '../../common/audit/audit.service';
import { EventBusService } from '../../common/events/event-bus.service';
import { parsePagination, buildMeta, PaginationParams } from '../../common/pagination/pagination';
import { DomainEvent, Actor } from '@billpilot/shared';
import { RecordPaymentDto, MultiInvoicePaymentDto, RefundPaymentDto } from './payments.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: CommonAuditService,
    private readonly eventBus: EventBusService,
  ) {}

  async findAll(params: PaginationParams & { customerId?: string; invoiceId?: string; status?: string }) {
    const { skip, take } = parsePagination(params);
    const where: any = {};
    if (params.customerId) where.customerId = params.customerId;
    if (params.invoiceId) where.invoiceId = params.invoiceId;
    if (params.status) where.status = params.status;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: { paidAt: 'desc' },
        include: {
          invoice: {
            select: { id: true, number: true, total: true, amountDue: true, status: true },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    const data = payments.map((p) => ({
      id: p.id,
      invoiceId: p.invoiceId,
      invoiceNumber: p.invoice.number,
      customerId: p.customerId,
      method: p.method,
      amount: p.amount.toFixed(2),
      paidAt: p.paidAt.toISOString(),
      note: p.note,
      status: p.status,
      externalRef: p.externalRef,
    }));

    return {
      data,
      meta: buildMeta(total, params),
    };
  }

  async record(dto: RecordPaymentDto, actor?: Actor) {
    const inv = await this.prisma.invoice.findUnique({
      where: { id: dto.invoiceId },
    });

    if (!inv) throw new NotFoundException(`Invoice not found: ${dto.invoiceId}`);
    if (inv.status === 'CANCELLED') throw new ConflictException('Cannot pay cancelled invoice');

    const paymentAmount = new Decimal(dto.amount);
    const paidAt = dto.paidAt ? new Date(dto.paidAt) : new Date();

    return this.prisma.$transaction(async (tx) => {
      // 1. Create payment record
      const payment = await tx.payment.create({
        data: {
          invoiceId: inv.id,
          customerId: dto.customerId,
          method: dto.method,
          amount: paymentAmount,
          paidAt,
          note: dto.note,
          externalRef: dto.externalRef,
          recordedById: actor?.id,
          status: 'RECORDED',
        },
      });

      // 2. Determine overpayment vs invoice settlement
      let amountAppliedToInvoice = paymentAmount;
      let overpayment = new Decimal(0);

      if (paymentAmount.gt(inv.amountDue)) {
        amountAppliedToInvoice = inv.amountDue;
        overpayment = paymentAmount.minus(inv.amountDue);

        // Credit excess to customer credit balance
        await tx.customer.update({
          where: { id: dto.customerId },
          data: { creditBalance: { increment: overpayment } },
        });

        await this.audit.log({
          actor,
          entity: 'Customer',
          entityId: dto.customerId,
          action: 'OVERPAYMENT_CREDITED',
          after: { overpayment: overpayment.toFixed(2), paymentId: payment.id },
        });
      }

      const newPaid = inv.amountPaid.plus(amountAppliedToInvoice);
      const newDue = Decimal.max(0, inv.amountDue.minus(amountAppliedToInvoice));
      const isPaid = newDue.lte(0);

      await tx.invoice.update({
        where: { id: inv.id },
        data: {
          amountPaid: newPaid,
          amountDue: newDue,
          status: isPaid ? 'PAID' : inv.status === 'DRAFT' ? 'CONFIRMED' : inv.status,
          paidAt: isPaid ? paidAt : undefined,
        },
      });

      await this.audit.log({
        actor,
        entity: 'Payment',
        entityId: payment.id,
        action: 'PAYMENT_RECORDED',
        after: {
          amount: payment.amount.toFixed(2),
          method: payment.method,
          invoiceId: inv.id,
          overpayment: overpayment.toFixed(2),
        },
      });

      if (isPaid) {
        await this.eventBus.emit(DomainEvent.INVOICE_PAID, {
          invoiceId: inv.id,
          subscriptionId: inv.subscriptionId,
          customerId: inv.customerId,
          number: inv.number,
          total: inv.total.toFixed(2),
          dueDate: inv.dueDate.toISOString(),
        });
      }

      return {
        payment,
        appliedToInvoice: amountAppliedToInvoice.toFixed(2),
        overpaymentCredited: overpayment.toFixed(2),
      };
    });
  }

  /**
   * Applies one single payment across multiple invoices.
   * Any leftover excess is credited to the customer balance.
   */
  async applyAcrossInvoices(dto: MultiInvoicePaymentDto, actor?: Actor) {
    const paidAt = dto.paidAt ? new Date(dto.paidAt) : new Date();
    let remainingPayment = new Decimal(dto.amount);

    let invoicesToPay: Array<{ id: string; amountDue: Decimal; number: string; subscriptionId: string }>;

    if (dto.allocations && dto.allocations.length > 0) {
      const invoiceIds = dto.allocations.map((a) => a.invoiceId);
      const fetched = await this.prisma.invoice.findMany({
        where: { id: { in: invoiceIds }, customerId: dto.customerId },
      });
      invoicesToPay = dto.allocations.map((alloc) => {
        const found = fetched.find((f) => f.id === alloc.invoiceId);
        if (!found) throw new NotFoundException(`Invoice not found: ${alloc.invoiceId}`);
        return {
          id: found.id,
          amountDue: Decimal.min(new Decimal(alloc.amount), found.amountDue),
          number: found.number,
          subscriptionId: found.subscriptionId,
        };
      });
    } else {
      // Auto-allocate across oldest unpaid invoices
      const outstanding = await this.prisma.invoice.findMany({
        where: {
          customerId: dto.customerId,
          status: { in: ['CONFIRMED', 'DRAFT'] },
          amountDue: { gt: 0 },
        },
        orderBy: { dueDate: 'asc' },
      });
      invoicesToPay = outstanding.map((inv) => ({
        id: inv.id,
        amountDue: inv.amountDue,
        number: inv.number,
        subscriptionId: inv.subscriptionId,
      }));
    }

    const appliedInvoices: Array<{
      invoiceId: string;
      number: string;
      amountApplied: string;
      settled: boolean;
    }> = [];

    const result = await this.prisma.$transaction(async (tx) => {
      for (const target of invoicesToPay) {
        if (remainingPayment.lte(0)) break;

        const alloc = Decimal.min(remainingPayment, target.amountDue);
        if (alloc.lte(0)) continue;

        const inv = await tx.invoice.findUnique({ where: { id: target.id } });
        if (!inv) continue;

        const newPaid = inv.amountPaid.plus(alloc);
        const newDue = Decimal.max(0, inv.amountDue.minus(alloc));
        const isSettled = newDue.lte(0);

        await tx.invoice.update({
          where: { id: inv.id },
          data: {
            amountPaid: newPaid,
            amountDue: newDue,
            status: isSettled ? 'PAID' : inv.status === 'DRAFT' ? 'CONFIRMED' : inv.status,
            paidAt: isSettled ? paidAt : undefined,
          },
        });

        await tx.payment.create({
          data: {
            invoiceId: inv.id,
            customerId: dto.customerId,
            method: dto.method,
            amount: alloc,
            paidAt,
            note: dto.note || 'Multi-invoice payment distribution',
            externalRef: dto.externalRef,
            recordedById: actor?.id,
            status: 'RECORDED',
          },
        });

        remainingPayment = remainingPayment.minus(alloc);
        appliedInvoices.push({
          invoiceId: inv.id,
          number: inv.number,
          amountApplied: alloc.toFixed(2),
          settled: isSettled,
        });

        if (isSettled) {
          await this.eventBus.emit(DomainEvent.INVOICE_PAID, {
            invoiceId: inv.id,
            subscriptionId: inv.subscriptionId,
            customerId: inv.customerId,
            number: inv.number,
            total: inv.total.toFixed(2),
            dueDate: inv.dueDate.toISOString(),
          });
        }
      }

      // If overpayment remains, credit to customer balance
      let creditCredited = new Decimal(0);
      if (remainingPayment.gt(0)) {
        creditCredited = remainingPayment;
        await tx.customer.update({
          where: { id: dto.customerId },
          data: { creditBalance: { increment: creditCredited } },
        });

        await this.audit.log({
          actor,
          entity: 'Customer',
          entityId: dto.customerId,
          action: 'OVERPAYMENT_CREDITED',
          after: { creditAdded: creditCredited.toFixed(2) },
        });
      }

      return {
        totalReceived: new Decimal(dto.amount).toFixed(2),
        remainingPaymentCredited: creditCredited.toFixed(2),
        appliedInvoices,
      };
    });

    await this.audit.log({
      actor,
      entity: 'Payment',
      entityId: dto.customerId,
      action: 'MULTI_INVOICE_PAYMENT_APPLIED',
      after: result,
    });

    return result;
  }

  /**
   * Refunds a payment with reason, restores balance on invoice, and writes audit record.
   */
  async refund(paymentId: string, dto: RefundPaymentDto, actor?: Actor) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { invoice: true },
    });

    if (!payment) throw new NotFoundException(`Payment not found: ${paymentId}`);
    if (payment.status === 'REFUNDED') throw new ConflictException('Payment is already refunded');

    const refundAmount = dto.amount ? Decimal.min(new Decimal(dto.amount), payment.amount) : payment.amount;

    const result = await this.prisma.$transaction(async (tx) => {
      // Mark payment as refunded
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'REFUNDED',
          note: `${payment.note ? payment.note + ' | ' : ''}Refunded: ${dto.reason}`,
        },
      });

      // Restore balance on invoice
      const inv = payment.invoice;
      const newPaid = Decimal.max(0, inv.amountPaid.minus(refundAmount));
      const newDue = inv.amountDue.plus(refundAmount);
      const newStatus = inv.status === 'PAID' ? 'CONFIRMED' : inv.status;

      await tx.invoice.update({
        where: { id: inv.id },
        data: {
          amountPaid: newPaid,
          amountDue: newDue,
          status: newStatus,
          paidAt: null,
        },
      });

      return {
        paymentId: updatedPayment.id,
        refundAmount: refundAmount.toFixed(2),
        reason: dto.reason,
        invoiceId: inv.id,
        newInvoiceStatus: newStatus,
        newAmountDue: newDue.toFixed(2),
      };
    });

    await this.audit.log({
      actor,
      entity: 'Payment',
      entityId: paymentId,
      action: 'PAYMENT_REFUNDED',
      after: result,
    });

    return result;
  }
}
