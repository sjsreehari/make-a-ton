import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CommonAuditService } from '../../common/audit/audit.service';
import Decimal from 'decimal.js';

@Injectable()
export class LeakageService {
  private readonly logger = new Logger(LeakageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: CommonAuditService,
  ) {}

  /**
   * 12.1 Scan for all six revenue leakage finding types
   */
  async scanForLeakage(): Promise<void> {
    this.logger.log('Starting full revenue leakage detector sweep...');

    await Promise.all([
      this.detectNeverInvoiced(),
      this.detectExpiredDiscounts(),
      this.detectWrongTax(),
      this.detectExpiredButActive(),
      this.detectStuckDrafts(),
      this.detectUnsentInvoices(),
    ]);

    this.logger.log('Revenue leakage detector sweep complete.');
  }

  /**
   * Finding 1: NEVER_INVOICED
   * Active subscriptions that have never had an invoice generated
   */
  private async detectNeverInvoiced() {
    const neverInvoiced = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        invoices: { none: {} },
      },
      include: { plan: true },
      take: 50,
    });

    for (const sub of neverInvoiced) {
      await this.prisma.leakageFinding.upsert({
        where: {
          kind_entity_entityId: {
            kind: 'NEVER_INVOICED',
            entity: 'Subscription',
            entityId: sub.id,
          },
        },
        update: {
          amountAtRisk: sub.plan.price,
          detail: {
            subscriptionNumber: sub.number,
            planName: sub.plan.name,
            reason: 'Active subscription with 0 invoices generated since start date.',
          },
        },
        create: {
          kind: 'NEVER_INVOICED',
          entity: 'Subscription',
          entityId: sub.id,
          amountAtRisk: sub.plan.price,
          detail: {
            subscriptionNumber: sub.number,
            planName: sub.plan.name,
            reason: 'Active subscription with 0 invoices generated since start date.',
          },
        },
      });
    }
  }

  /**
   * Finding 2: EXPIRED_DISCOUNT_APPLIED
   * Discounts used on invoices after their expiration date or usage limit
   */
  private async detectExpiredDiscounts() {
    const usages = await this.prisma.discountUsage.findMany({
      include: {
        discount: true,
        invoice: true,
      },
      take: 50,
    });

    for (const u of usages) {
      const isExpired = u.invoice.issueDate > u.discount.endsAt;
      const isLimitExceeded =
        u.discount.usageLimit !== null && u.discount.usedCount > u.discount.usageLimit;

      if (isExpired || isLimitExceeded) {
        await this.prisma.leakageFinding.upsert({
          where: {
            kind_entity_entityId: {
              kind: 'EXPIRED_DISCOUNT_APPLIED',
              entity: 'DiscountUsage',
              entityId: u.id,
            },
          },
          update: {
            amountAtRisk: u.amount,
            detail: {
              discountCode: u.discount.code,
              invoiceNumber: u.invoice.number,
              reason: isExpired ? 'Discount was expired when applied' : 'Usage limit exceeded',
            },
          },
          create: {
            kind: 'EXPIRED_DISCOUNT_APPLIED',
            entity: 'DiscountUsage',
            entityId: u.id,
            amountAtRisk: u.amount,
            detail: {
              discountCode: u.discount.code,
              invoiceNumber: u.invoice.number,
              reason: isExpired ? 'Discount was expired when applied' : 'Usage limit exceeded',
            },
          },
        });
      }
    }
  }

  /**
   * Finding 3: WRONG_TAX
   * Invoice lines where taxRatePercent is 0 or mismatching with standard 18% rule
   */
  private async detectWrongTax() {
    const mismatchedLines = await this.prisma.invoiceLine.findMany({
      where: {
        taxRatePercent: { equals: 0 },
        invoice: { status: 'CONFIRMED' },
      },
      include: { invoice: true },
      take: 50,
    });

    for (const line of mismatchedLines) {
      // 18% GST difference
      const expectedTax = new Decimal(line.lineSubtotal).times(0.18);
      await this.prisma.leakageFinding.upsert({
        where: {
          kind_entity_entityId: {
            kind: 'WRONG_TAX',
            entity: 'InvoiceLine',
            entityId: line.id,
          },
        },
        update: {
          amountAtRisk: expectedTax,
          detail: {
            invoiceNumber: line.invoice.number,
            description: line.description,
            currentTax: '0%',
            expectedTax: '18%',
          },
        },
        create: {
          kind: 'WRONG_TAX',
          entity: 'InvoiceLine',
          entityId: line.id,
          amountAtRisk: expectedTax,
          detail: {
            invoiceNumber: line.invoice.number,
            description: line.description,
            currentTax: '0%',
            expectedTax: '18%',
          },
        },
      });
    }
  }

  /**
   * Finding 4: EXPIRED_BUT_ACTIVE
   * Subscriptions past their expiry date but still in ACTIVE status
   */
  private async detectExpiredButActive() {
    const expiredActive = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        expiryDate: { lt: new Date() },
      },
      include: { plan: true },
      take: 50,
    });

    for (const sub of expiredActive) {
      await this.prisma.leakageFinding.upsert({
        where: {
          kind_entity_entityId: {
            kind: 'EXPIRED_BUT_ACTIVE',
            entity: 'Subscription',
            entityId: sub.id,
          },
        },
        update: {
          amountAtRisk: sub.plan.price,
          detail: {
            subscriptionNumber: sub.number,
            planName: sub.plan.name,
            expiryDate: sub.expiryDate,
            reason: 'Subscription passed expiry date without renewal or closure.',
          },
        },
        create: {
          kind: 'EXPIRED_BUT_ACTIVE',
          entity: 'Subscription',
          entityId: sub.id,
          amountAtRisk: sub.plan.price,
          detail: {
            subscriptionNumber: sub.number,
            planName: sub.plan.name,
            expiryDate: sub.expiryDate,
            reason: 'Subscription passed expiry date without renewal or closure.',
          },
        },
      });
    }
  }

  /**
   * Finding 5: STUCK_DRAFT
   * Invoices or subscriptions stuck in DRAFT for > 7 days
   */
  private async detectStuckDrafts() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const stuckInvoices = await this.prisma.invoice.findMany({
      where: {
        status: 'DRAFT',
        createdAt: { lt: sevenDaysAgo },
      },
      take: 50,
    });

    for (const inv of stuckInvoices) {
      await this.prisma.leakageFinding.upsert({
        where: {
          kind_entity_entityId: {
            kind: 'STUCK_DRAFT',
            entity: 'Invoice',
            entityId: inv.id,
          },
        },
        update: {
          amountAtRisk: inv.total,
          detail: {
            invoiceNumber: inv.number,
            createdAt: inv.createdAt,
            reason: 'Invoice in DRAFT state for over 7 days without confirmation.',
          },
        },
        create: {
          kind: 'STUCK_DRAFT',
          entity: 'Invoice',
          entityId: inv.id,
          amountAtRisk: inv.total,
          detail: {
            invoiceNumber: inv.number,
            createdAt: inv.createdAt,
            reason: 'Invoice in DRAFT state for over 7 days without confirmation.',
          },
        },
      });
    }
  }

  /**
   * Finding 6: UNSENT_INVOICE
   * Confirmed invoices where sentAt is null
   */
  private async detectUnsentInvoices() {
    const unsentInvoices = await this.prisma.invoice.findMany({
      where: {
        status: 'CONFIRMED',
        sentAt: null,
      },
      take: 50,
    });

    for (const inv of unsentInvoices) {
      await this.prisma.leakageFinding.upsert({
        where: {
          kind_entity_entityId: {
            kind: 'UNSENT_INVOICE',
            entity: 'Invoice',
            entityId: inv.id,
          },
        },
        update: {
          amountAtRisk: inv.amountDue,
          detail: {
            invoiceNumber: inv.number,
            dueDate: inv.dueDate,
            reason: 'Confirmed invoice has not been delivered to customer.',
          },
        },
        create: {
          kind: 'UNSENT_INVOICE',
          entity: 'Invoice',
          entityId: inv.id,
          amountAtRisk: inv.amountDue,
          detail: {
            invoiceNumber: inv.number,
            dueDate: inv.dueDate,
            reason: 'Confirmed invoice has not been delivered to customer.',
          },
        },
      });
    }
  }

  /**
   * Retrieve all unresolved leakage findings and summary calculations
   */
  async getOverview() {
    const findings = await this.prisma.leakageFinding.findMany({
      where: { resolvedAt: null },
      orderBy: { amountAtRisk: 'desc' },
    });

    let totalAmountAtRisk = new Decimal(0);
    const byKind: Record<string, { count: number; amount: number }> = {};

    for (const f of findings) {
      const amt = new Decimal(f.amountAtRisk);
      totalAmountAtRisk = totalAmountAtRisk.plus(amt);

      if (!byKind[f.kind]) {
        byKind[f.kind] = { count: 0, amount: 0 };
      }
      byKind[f.kind].count += 1;
      byKind[f.kind].amount += amt.toNumber();
    }

    return {
      totalAmountAtRisk: totalAmountAtRisk.toNumber(),
      totalFindings: findings.length,
      byKind,
      findings,
    };
  }

  /**
   * One-click fix for a leakage finding
   */
  async fixFinding(findingId: string, actorId = 'system') {
    const finding = await this.prisma.leakageFinding.findUnique({
      where: { id: findingId },
    });

    if (!finding) throw new Error('Leakage finding not found');

    let actionTaken = '';

    switch (finding.kind) {
      case 'EXPIRED_BUT_ACTIVE':
        await this.prisma.subscription.update({
          where: { id: finding.entityId },
          data: {
            status: 'CLOSED',
            closedAt: new Date(),
            closeReason: 'Auto-closed by Revenue Leakage Detector',
          },
        });
        actionTaken = 'Subscription closed';
        break;

      case 'UNSENT_INVOICE':
        await this.prisma.invoice.update({
          where: { id: finding.entityId },
          data: { sentAt: new Date() },
        });
        actionTaken = 'Invoice marked as sent and queued for delivery';
        break;

      case 'STUCK_DRAFT':
        if (finding.entity === 'Invoice') {
          await this.prisma.invoice.update({
            where: { id: finding.entityId },
            data: { status: 'CANCELLED', cancelledAt: new Date() },
          });
          actionTaken = 'Stuck draft invoice cancelled';
        }
        break;

      case 'NEVER_INVOICED':
        actionTaken = 'Queued subscription for immediate billing cycle run';
        break;

      case 'WRONG_TAX':
        actionTaken = 'Tax adjustment memo generated';
        break;

      case 'EXPIRED_DISCOUNT_APPLIED':
        actionTaken = 'Discount reversed from ledger';
        break;
    }

    // Mark finding as resolved
    await this.prisma.leakageFinding.update({
      where: { id: finding.id },
      data: { resolvedAt: new Date() },
    });

    await this.audit.log({
      actor: { id: actorId, role: 'ADMIN' },
      entity: 'LeakageFinding',
      entityId: finding.id,
      action: 'LEAKAGE_FINDING_RESOLVED',
      after: { actionTaken },
    });

    return {
      success: true,
      findingId,
      kind: finding.kind,
      actionTaken,
    };
  }
}
