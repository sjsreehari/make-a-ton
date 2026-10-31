import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import Decimal from 'decimal.js';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CommonAuditService } from '../../common/audit/audit.service';
import { EventBusService } from '../../common/events/event-bus.service';
import { parsePagination, buildMeta, PaginationParams } from '../../common/pagination/pagination';
import {
  IInvoiceService,
  InvoiceDTO,
  BillingRunSummary,
  DomainEvent,
  InvoiceStatus,
  NotImplementedError,
} from '@billpilot/shared';

@Injectable()
export class BillingService implements IInvoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: CommonAuditService,
    private readonly eventBus: EventBusService,
  ) {}

  async findAll(params: PaginationParams & { customerId?: string; status?: string }) {
    const { skip, take } = parsePagination(params);
    const where: any = {};
    if (params.customerId) where.customerId = params.customerId;
    if (params.status) where.status = params.status;

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take,
        orderBy: { issueDate: 'desc' },
        include: { lines: true },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    const data = invoices.map((inv) => ({
      id: inv.id,
      number: inv.number,
      subscriptionId: inv.subscriptionId,
      customerId: inv.customerId,
      status: inv.status,
      periodStart: inv.periodStart.toISOString(),
      periodEnd: inv.periodEnd.toISOString(),
      issueDate: inv.issueDate.toISOString(),
      dueDate: inv.dueDate.toISOString(),
      subtotal: inv.subtotal.toFixed(2),
      discountTotal: inv.discountTotal.toFixed(2),
      taxTotal: inv.taxTotal.toFixed(2),
      total: inv.total.toFixed(2),
      amountPaid: inv.amountPaid.toFixed(2),
      amountDue: inv.amountDue.toFixed(2),
      lines: inv.lines,
    }));

    return {
      data,
      meta: buildMeta(total, params),
    };
  }

  async generateFromSubscription(
    subId: string,
    period: { start: Date; end: Date },
    opts?: { dryRun?: boolean; idempotencyKey?: string },
  ): Promise<InvoiceDTO | { skipped: true; reason: string }> {
    const existing = await this.prisma.invoice.findUnique({
      where: {
        subscriptionId_periodStart_periodEnd: {
          subscriptionId: subId,
          periodStart: period.start,
          periodEnd: period.end,
        },
      },
    });

    if (existing) {
      return { skipped: true, reason: 'ALREADY_BILLED' };
    }

    const sub = await this.prisma.subscription.findUnique({
      where: { id: subId },
      include: {
        lines: { include: { taxRule: true } },
        plan: true,
      },
    });

    if (!sub || sub.status !== 'ACTIVE' || sub.isPaused) {
      return { skipped: true, reason: 'NOT_BILLABLE' };
    }

    if (opts?.dryRun) {
      return { skipped: true, reason: 'DRY_RUN_COMPLETED' };
    }

    // Generate invoice number
    const count = await this.prisma.invoice.count();
    const number = `INV-2026-${String(count + 1).padStart(6, '0')}`;

    let subtotal = new Decimal(0);
    let taxTotal = new Decimal(0);

    const invoiceLines = sub.lines.map((l) => {
      const lineSub = l.amount;
      subtotal = subtotal.plus(lineSub);
      const taxRate = l.taxRule?.ratePercent || new Decimal('18.00');
      const taxAmount = lineSub.times(taxRate).dividedBy(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
      taxTotal = taxTotal.plus(taxAmount);
      const lineTotal = lineSub.plus(taxAmount);

      return {
        productId: l.productId,
        description: l.description,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        lineSubtotal: lineSub,
        discountAmount: new Decimal(0),
        taxRatePercent: taxRate,
        taxAmount,
        lineTotal,
        kind: 'RECURRING',
      };
    });

    const total = subtotal.plus(taxTotal);
    const dueDate = new Date(Date.now() + 15 * 86400000);

    try {
      const inv = await this.prisma.invoice.create({
        data: {
          number,
          subscriptionId: sub.id,
          customerId: sub.customerId,
          status: 'DRAFT',
          periodStart: period.start,
          periodEnd: period.end,
          dueDate,
          subtotal,
          discountTotal: new Decimal(0),
          taxTotal,
          total,
          amountPaid: new Decimal(0),
          amountDue: total,
          lines: {
            create: invoiceLines,
          },
        },
      });

      await this.eventBus.emit(DomainEvent.INVOICE_GENERATED, {
        invoiceId: inv.id,
        subscriptionId: inv.subscriptionId,
        customerId: inv.customerId,
        number: inv.number,
        total: inv.total.toFixed(2),
        dueDate: inv.dueDate.toISOString(),
      });

      return {
        id: inv.id,
        number: inv.number,
        subscriptionId: inv.subscriptionId,
        customerId: inv.customerId,
        status: inv.status,
        periodStart: inv.periodStart.toISOString(),
        periodEnd: inv.periodEnd.toISOString(),
        total: inv.total.toFixed(2),
        amountDue: inv.amountDue.toFixed(2),
        dueDate: inv.dueDate.toISOString(),
      };
    } catch (err: any) {
      if (err.code === 'P2002') {
        return { skipped: true, reason: 'ALREADY_BILLED' };
      }
      throw err;
    }
  }

  async runBilling(asOf: Date, opts?: { dryRun?: boolean }): Promise<BillingRunSummary> {
    const billableSubs = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        isPaused: false,
        nextBillingDate: { lte: asOf },
      },
      take: 200,
    });

    let created = 0;
    let skipped = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const sub of billableSubs) {
      try {
        const start = sub.nextBillingDate || asOf;
        const end = new Date(start.getTime() + 30 * 86400000);
        const res = await this.generateFromSubscription(sub.id, { start, end }, opts);
        if ('skipped' in res && res.skipped) {
          skipped++;
        } else {
          created++;
        }
      } catch (err: any) {
        failed++;
        errors.push(`Sub ${sub.id}: ${err.message}`);
      }
    }

    await this.eventBus.emit(DomainEvent.BILLING_RUN_COMPLETED, {
      created,
      skipped,
      failed,
      errors,
    });

    return {
      created,
      skipped,
      failed,
      errors,
      dryRun: !!opts?.dryRun,
    };
  }

  async confirm(id: string): Promise<InvoiceDTO> {
    const inv = await this.prisma.invoice.findUnique({ where: { id } });
    if (!inv) throw new NotFoundException('Invoice not found');

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    await this.eventBus.emit(DomainEvent.INVOICE_CONFIRMED, {
      invoiceId: updated.id,
      subscriptionId: updated.subscriptionId,
      customerId: updated.customerId,
      number: updated.number,
      total: updated.total.toFixed(2),
      dueDate: updated.dueDate.toISOString(),
    });

    return {
      id: updated.id,
      number: updated.number,
      subscriptionId: updated.subscriptionId,
      customerId: updated.customerId,
      status: updated.status,
      periodStart: updated.periodStart.toISOString(),
      periodEnd: updated.periodEnd.toISOString(),
      total: updated.total.toFixed(2),
      amountDue: updated.amountDue.toFixed(2),
      dueDate: updated.dueDate.toISOString(),
    };
  }

  async cancel(id: string, reason: string): Promise<InvoiceDTO> {
    const inv = await this.prisma.invoice.findUnique({ where: { id } });
    if (!inv) throw new NotFoundException('Invoice not found');
    if (!inv.amountPaid.isZero()) throw new ConflictException('Cannot cancel partially paid invoice');

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    return {
      id: updated.id,
      number: updated.number,
      subscriptionId: updated.subscriptionId,
      customerId: updated.customerId,
      status: updated.status,
      periodStart: updated.periodStart.toISOString(),
      periodEnd: updated.periodEnd.toISOString(),
      total: updated.total.toFixed(2),
      amountDue: updated.amountDue.toFixed(2),
      dueDate: updated.dueDate.toISOString(),
    };
  }

  async send(id: string): Promise<void> {
    await this.prisma.invoice.update({
      where: { id },
      data: { sentAt: new Date() },
    });
  }

  async renderPdf(_id: string): Promise<Buffer> {
    throw new NotImplementedError('PDF rendering via pdfkit');
  }

  async markPaidIfSettled(id: string): Promise<void> {
    const inv = await this.prisma.invoice.findUnique({ where: { id } });
    if (!inv) return;

    if (inv.amountDue.lte(0) && inv.status !== 'PAID') {
      await this.prisma.invoice.update({
        where: { id },
        data: { status: 'PAID', paidAt: new Date() },
      });

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
}

