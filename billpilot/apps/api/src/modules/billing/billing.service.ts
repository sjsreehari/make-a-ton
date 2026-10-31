import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
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
} from '@billpilot/shared';
import { calculateNextBillingDate, previewNextInvoiceDates } from './billing-schedule';
import { formatDocumentNumber, deriveInvoiceDisplayStatus } from './invoice-numbering';
import { calculateInvoice, LineItemInput } from './billing-calculator';
import { generateInvoicePdfBuffer } from './invoice-pdf.service';

export interface BulkActionResult {
  total: number;
  succeeded: number;
  failed: number;
  results: Array<{ id: string; success: boolean; error?: string }>;
}

@Injectable()
export class BillingService implements IInvoiceService {
  private invoiceNumberPattern = 'INV-{year}-{seq:6}';

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: CommonAuditService,
    private readonly eventBus: EventBusService,
  ) {}

  setNumberPattern(pattern: string) {
    this.invoiceNumberPattern = pattern;
  }

  getNumberPattern(): string {
    return this.invoiceNumberPattern;
  }

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
        include: { lines: true, creditMemos: true },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    const now = new Date();
    const data = invoices.map((inv) => {
      const displayStatus = deriveInvoiceDisplayStatus(
        {
          status: inv.status as any,
          amountPaid: inv.amountPaid,
          amountDue: inv.amountDue,
          total: inv.total,
          dueDate: inv.dueDate,
          sentAt: inv.sentAt,
          cancelledAt: inv.cancelledAt,
          hasReversal: inv.creditMemos && inv.creditMemos.length > 0 && inv.amountDue.lte(0),
        },
        now,
      );

      return {
        id: inv.id,
        number: inv.number,
        subscriptionId: inv.subscriptionId,
        customerId: inv.customerId,
        status: inv.status,
        displayStatus,
        periodStart: inv.periodStart.toISOString(),
        periodEnd: inv.periodEnd.toISOString(),
        issueDate: inv.issueDate.toISOString(),
        dueDate: inv.dueDate.toISOString(),
        sentAt: inv.sentAt ? inv.sentAt.toISOString() : null,
        subtotal: inv.subtotal.toFixed(2),
        discountTotal: inv.discountTotal.toFixed(2),
        taxTotal: inv.taxTotal.toFixed(2),
        total: inv.total.toFixed(2),
        amountPaid: inv.amountPaid.toFixed(2),
        amountDue: inv.amountDue.toFixed(2),
        lines: inv.lines,
        creditMemos: inv.creditMemos,
      };
    });

    return {
      data,
      meta: buildMeta(total, params),
    };
  }

  async findOne(id: string, customerId?: string) {
    const where: any = { id };
    if (customerId) where.customerId = customerId;

    const inv = await this.prisma.invoice.findFirst({
      where,
      include: {
        lines: true,
        creditMemos: true,
        payments: true,
        subscription: { include: { customer: true, plan: true } },
      },
    });

    if (!inv) throw new NotFoundException(`Invoice not found: ${id}`);

    const displayStatus = deriveInvoiceDisplayStatus(
      {
        status: inv.status as any,
        amountPaid: inv.amountPaid,
        amountDue: inv.amountDue,
        total: inv.total,
        dueDate: inv.dueDate,
        sentAt: inv.sentAt,
        cancelledAt: inv.cancelledAt,
        hasReversal: inv.creditMemos && inv.creditMemos.length > 0 && inv.amountDue.lte(0),
      },
      new Date(),
    );

    return {
      ...inv,
      displayStatus,
      subtotal: inv.subtotal.toFixed(2),
      discountTotal: inv.discountTotal.toFixed(2),
      taxTotal: inv.taxTotal.toFixed(2),
      total: inv.total.toFixed(2),
      amountPaid: inv.amountPaid.toFixed(2),
      amountDue: inv.amountDue.toFixed(2),
    };
  }

  async generateFromSubscription(
    subId: string,
    period: { start: Date; end: Date },
    opts?: { dryRun?: boolean; idempotencyKey?: string },
  ): Promise<InvoiceDTO | { skipped: true; reason: string }> {
    // Idempotency check: unique constraint (subscriptionId, periodStart, periodEnd)
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
        customer: true,
      },
    });

    if (!sub || sub.status !== 'ACTIVE' || sub.isPaused) {
      return { skipped: true, reason: 'NOT_BILLABLE' };
    }

    if (opts?.dryRun) {
      return { skipped: true, reason: 'DRY_RUN_COMPLETED' };
    }

    // Generate formatted invoice number
    const count = await this.prisma.invoice.count();
    const number = formatDocumentNumber(this.invoiceNumberPattern, count + 1, period.start);

    // Calculate lines, taxes, and discounts with the calculator engine
    const linesInput: LineItemInput[] = sub.lines.map((l) => ({
      productId: l.productId,
      description: l.description,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      taxes: l.taxRule
        ? [
            {
              id: l.taxRule.id,
              name: l.taxRule.name,
              ratePercent: l.taxRule.ratePercent,
              isInclusive: l.taxRule.isInclusive,
            },
          ]
        : [
            {
              name: 'GST 18%',
              ratePercent: new Decimal('18.00'),
              isInclusive: false,
            },
          ],
      kind: 'RECURRING',
    }));

    const calcResult = calculateInvoice(linesInput);

    const termDays =
      sub.paymentTerm === 'NET_7'
        ? 7
        : sub.paymentTerm === 'NET_30'
          ? 30
          : sub.paymentTerm === 'NET_60'
            ? 60
            : sub.paymentTerm === 'IMMEDIATE'
              ? 0
              : 15;
    const dueDate = new Date(period.start.getTime() + termDays * 86400000);

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
          subtotal: calcResult.subtotal,
          discountTotal: calcResult.discountTotal,
          taxTotal: calcResult.taxTotal,
          total: calcResult.total,
          amountPaid: new Decimal(0),
          amountDue: calcResult.total,
          explainer: { taxBreakdown: calcResult.taxBreakdown } as any,
          lines: {
            create: calcResult.lines.map((l) => ({
              productId: l.productId,
              description: l.description,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              lineSubtotal: l.lineSubtotal,
              discountAmount: l.discountAmount,
              taxRatePercent: l.taxes[0]?.ratePercent || new Decimal(0),
              taxAmount: l.taxAmount,
              lineTotal: l.lineTotal,
              kind: l.kind,
            })),
          },
        },
      });

      await this.audit.log({
        actor: { id: sub.createdById || 'SYSTEM_JOB', role: 'ADMIN' },
        entity: 'Invoice',
        entityId: inv.id,
        action: 'INVOICE_GENERATED',
        after: { number: inv.number, total: inv.total.toString(), periodStart: inv.periodStart },
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

  /**
   * Recurring billing runner with robust catch-up of missed periods without double-billing.
   * Handles cycle limits and advances nextBillingDate safely.
   */
  async runBilling(asOf: Date, opts?: { dryRun?: boolean }): Promise<BillingRunSummary> {
    const billableSubs = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        isPaused: false,
        nextBillingDate: { lte: asOf },
      },
      include: {
        plan: true,
      },
      take: 200,
    });

    let created = 0;
    let skipped = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const sub of billableSubs) {
      try {
        let currentStart = sub.nextBillingDate || sub.startDate;
        let remainingCycles = sub.remainingCycles;
        const anchorDay = sub.startDate.getUTCDate();

        // Catch up all elapsed periods up to asOf sequentially
        while (currentStart <= asOf) {
          // Check cycle limit
          if (remainingCycles !== null && remainingCycles !== undefined && remainingCycles <= 0) {
            if (!opts?.dryRun) {
              await this.prisma.subscription.update({
                where: { id: sub.id },
                data: {
                  status: 'CLOSED',
                  closedAt: new Date(),
                  closeReason: 'COMPLETED_CYCLES',
                },
              });
            }
            break;
          }

          const currentEnd = calculateNextBillingDate(
            currentStart,
            sub.plan.billingPeriod,
            anchorDay,
          );

          const res = await this.generateFromSubscription(
            sub.id,
            { start: currentStart, end: currentEnd },
            opts,
          );

          if ('skipped' in res && res.skipped) {
            skipped++;
          } else {
            created++;
          }

          if (remainingCycles !== null && remainingCycles !== undefined) {
            remainingCycles -= 1;
          }

          if (!opts?.dryRun) {
            if (remainingCycles !== null && remainingCycles !== undefined && remainingCycles <= 0) {
              await this.prisma.subscription.update({
                where: { id: sub.id },
                data: {
                  status: 'CLOSED',
                  closedAt: new Date(),
                  closeReason: 'COMPLETED_CYCLES',
                  remainingCycles: 0,
                  nextBillingDate: currentEnd,
                },
              });
              break;
            } else {
              await this.prisma.subscription.update({
                where: { id: sub.id },
                data: {
                  nextBillingDate: currentEnd,
                  remainingCycles:
                    remainingCycles !== null && remainingCycles !== undefined
                      ? remainingCycles
                      : undefined,
                },
              });
            }
          }

          currentStart = currentEnd;
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

  async confirm(id: string, actorId?: string): Promise<InvoiceDTO> {
    const inv = await this.prisma.invoice.findUnique({
      where: { id },
      include: { subscription: { include: { customer: true } } },
    });
    if (!inv) throw new NotFoundException('Invoice not found');

    if (inv.status === 'CONFIRMED' || inv.status === 'PAID') {
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
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    await this.audit.log({
      actor: { id: actorId || 'SYSTEM', role: 'ADMIN' },
      entity: 'Invoice',
      entityId: updated.id,
      action: 'INVOICE_CONFIRMED',
      before: { status: inv.status },
      after: { status: updated.status, confirmedAt: updated.confirmedAt },
    });

    await this.eventBus.emit(DomainEvent.INVOICE_CONFIRMED, {
      invoiceId: updated.id,
      subscriptionId: updated.subscriptionId,
      customerId: updated.customerId,
      number: updated.number,
      total: updated.total.toFixed(2),
      dueDate: updated.dueDate.toISOString(),
    });

    // Auto-apply customer credit balance if available
    await this.autoApplyCustomerCredit(updated.id);

    const fresh = await this.prisma.invoice.findUnique({ where: { id } });

    return {
      id: fresh!.id,
      number: fresh!.number,
      subscriptionId: fresh!.subscriptionId,
      customerId: fresh!.customerId,
      status: fresh!.status,
      periodStart: fresh!.periodStart.toISOString(),
      periodEnd: fresh!.periodEnd.toISOString(),
      total: fresh!.total.toFixed(2),
      amountDue: fresh!.amountDue.toFixed(2),
      dueDate: fresh!.dueDate.toISOString(),
    };
  }

  async cancel(id: string, reason: string, actorId?: string): Promise<InvoiceDTO> {
    const inv = await this.prisma.invoice.findUnique({ where: { id } });
    if (!inv) throw new NotFoundException('Invoice not found');
    if (!inv.amountPaid.isZero()) {
      throw new ConflictException('Cannot cancel partially or fully paid invoice directly');
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    await this.audit.log({
      actor: { id: actorId || 'SYSTEM', role: 'ADMIN' },
      entity: 'Invoice',
      entityId: updated.id,
      action: 'INVOICE_CANCELLED',
      before: { status: inv.status },
      after: { status: 'CANCELLED', reason },
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

    await this.audit.log({
      entity: 'Invoice',
      entityId: id,
      action: 'INVOICE_SENT',
      after: { sentAt: new Date() },
    });
  }

  async trackViewed(id: string): Promise<{ id: string; viewedAt: string }> {
    const now = new Date();
    const inv = await this.prisma.invoice.findUnique({ where: { id } });
    if (!inv) throw new NotFoundException(`Invoice not found: ${id}`);

    const explainer: any = inv.explainer || {};
    if (!explainer.firstViewedAt) explainer.firstViewedAt = now.toISOString();
    explainer.lastViewedAt = now.toISOString();

    await this.prisma.invoice.update({
      where: { id },
      data: { explainer },
    });

    await this.audit.log({
      entity: 'Invoice',
      entityId: id,
      action: 'INVOICE_VIEWED',
      after: { viewedAt: now.toISOString() },
    });

    return { id, viewedAt: now.toISOString() };
  }

  /**
   * Locked lines enforcement: lines of confirmed/paid invoices cannot be altered.
   */
  async assertLinesUnlocked(invoiceId: string): Promise<void> {
    const inv = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!inv) throw new NotFoundException(`Invoice not found: ${invoiceId}`);
    if (inv.status === 'CONFIRMED' || inv.status === 'PAID') {
      throw new ConflictException(
        `Invoice ${inv.number} is locked (${inv.status}). Line items cannot be modified.`,
      );
    }
  }

  /**
   * PDF rendering via pdfkit
   */
  async renderPdf(id: string): Promise<Buffer> {
    const inv = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        lines: true,
        customer: true,
        subscription: true,
      },
    });

    if (!inv) throw new NotFoundException(`Invoice not found: ${id}`);

    return generateInvoicePdfBuffer({
      number: inv.number,
      issueDate: inv.issueDate.toISOString(),
      dueDate: inv.dueDate.toISOString(),
      currency: inv.currency,
      status: inv.status,
      customer: {
        name: inv.customer.name,
        email: inv.customer.email,
        phone: inv.customer.phone,
        company: inv.customer.company,
        gstin: inv.customer.gstin,
        billingAddress: inv.customer.billingAddress,
      },
      lines: inv.lines.map((l) => ({
        description: l.description,
        quantity: l.quantity,
        unitPrice: l.unitPrice.toString(),
        taxRatePercent: l.taxRatePercent.toString(),
        lineTotal: l.lineTotal.toString(),
      })),
      subtotal: inv.subtotal.toString(),
      discountTotal: inv.discountTotal.toString(),
      taxTotal: inv.taxTotal.toString(),
      total: inv.total.toString(),
      amountPaid: inv.amountPaid.toString(),
      amountDue: inv.amountDue.toString(),
      paymentTerm: inv.subscription?.paymentTerm,
    });
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

  /**
   * Automatically draws down customer credit balance on confirmed invoice.
   */
  async autoApplyCustomerCredit(invoiceId: string): Promise<Decimal> {
    const inv = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true },
    });

    if (!inv || inv.amountDue.lte(0) || inv.customer.creditBalance.lte(0)) {
      return new Decimal(0);
    }

    const creditToUse = Decimal.min(inv.customer.creditBalance, inv.amountDue);

    await this.prisma.$transaction(async (tx) => {
      // Deduct from customer credit
      await tx.customer.update({
        where: { id: inv.customerId },
        data: { creditBalance: { decrement: creditToUse } },
      });

      // Update invoice
      const newPaid = inv.amountPaid.plus(creditToUse);
      const newDue = Decimal.max(0, inv.amountDue.minus(creditToUse));
      const isPaid = newDue.lte(0);

      await tx.invoice.update({
        where: { id: inv.id },
        data: {
          amountPaid: newPaid,
          amountDue: newDue,
          status: isPaid ? 'PAID' : inv.status,
          paidAt: isPaid ? new Date() : undefined,
        },
      });

      // Record payment transaction
      await tx.payment.create({
        data: {
          invoiceId: inv.id,
          customerId: inv.customerId,
          method: 'OTHER',
          amount: creditToUse,
          paidAt: new Date(),
          note: 'Auto-applied from customer credit balance',
          status: 'RECORDED',
        },
      });
    });

    await this.audit.log({
      entity: 'Invoice',
      entityId: inv.id,
      action: 'CREDIT_BALANCE_APPLIED',
      after: { creditApplied: creditToUse.toFixed(2), invoiceId: inv.id },
    });

    return creditToUse;
  }

  /**
   * Bulk action on multiple invoices: CONFIRM, SEND, or CANCEL.
   */
  async executeBulkAction(
    action: 'CONFIRM' | 'SEND' | 'CANCEL',
    invoiceIds: string[],
    reason?: string,
  ): Promise<BulkActionResult> {
    const results: Array<{ id: string; success: boolean; error?: string }> = [];
    let succeeded = 0;
    let failed = 0;

    for (const id of invoiceIds) {
      try {
        if (action === 'CONFIRM') {
          await this.confirm(id);
        } else if (action === 'SEND') {
          await this.send(id);
        } else if (action === 'CANCEL') {
          await this.cancel(id, reason || 'Bulk cancellation');
        }
        results.push({ id, success: true });
        succeeded++;
      } catch (err: any) {
        failed++;
        results.push({ id, success: false, error: err.message });
      }
    }

    return {
      total: invoiceIds.length,
      succeeded,
      failed,
      results,
    };
  }

  /**
   * Schedules preview of the next 3 invoice dates for a subscription.
   */
  previewNextDates(startDate: Date, frequency: any, count = 3, fromDate?: Date): string[] {
    return previewNextInvoiceDates(startDate, frequency, count, fromDate).map((d) =>
      d.toISOString(),
    );
  }
}
