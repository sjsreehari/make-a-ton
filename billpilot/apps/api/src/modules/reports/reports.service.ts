import { Injectable, NotFoundException } from '@nestjs/common';
import Decimal from 'decimal.js';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CacheService } from '../../common/redis/cache.service';
import { ReportFilterDto } from './reports.dto';

export interface AgingBucketSummary {
  current: Decimal;
  days1To30: Decimal;
  days31To60: Decimal;
  days61To90: Decimal;
  days90Plus: Decimal;
  total: Decimal;
}

export interface AgingCustomerRow extends AgingBucketSummary {
  customerId: string;
  customerName: string;
  customerEmail: string;
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async getDashboardSummary(filters: ReportFilterDto) {
    const cacheKey = `report:dashboard:${this.cache.hashKey(filters as Record<string, unknown>)}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    const subWhere: any = {};
    if (filters.planId) subWhere.planId = filters.planId;
    if (filters.customerId) subWhere.customerId = filters.customerId;

    const [activeSubscriptions, confirmedSubscriptions, paidInvoices, dueInvoices] =
      await Promise.all([
        this.prisma.subscription.count({
          where: { ...subWhere, status: 'ACTIVE', isPaused: false },
        }),
        this.prisma.subscription.count({
          where: { ...subWhere, status: 'CONFIRMED' },
        }),
        this.prisma.invoice.aggregate({
          where: { status: 'PAID' },
          _sum: { amountPaid: true },
        }),
        this.prisma.invoice.aggregate({
          where: {
            status: { in: ['DRAFT', 'CONFIRMED'] },
          },
          _sum: { amountDue: true },
          _count: { id: true },
        }),
      ]);

    const now = new Date();
    const overdueCount = await this.prisma.invoice.count({
      where: {
        status: 'CONFIRMED',
        dueDate: { lt: now },
      },
    });

    const summary = {
      activeSubscriptions,
      confirmedSubscriptions,
      revenueCollected: (paidInvoices._sum.amountPaid || new Decimal(0)).toFixed(2),
      amountOwed: (dueInvoices._sum.amountDue || new Decimal(0)).toFixed(2),
      overdueCount,
      totalUnpaidInvoices: dueInvoices._count.id,
      generatedAt: now.toISOString(),
    };

    await this.cache.set(cacheKey, summary, 60);

    return { ...summary, fromCache: false };
  }

  /**
   * Accounts Receivable Aging Report (< 2s).
   * Buckets: Current, 1-30, 31-60, 61-90, 90+
   */
  async getAgingReport(asOf: Date = new Date()) {
    const unpaidInvoices = await this.prisma.invoice.findMany({
      where: {
        status: { in: ['CONFIRMED', 'DRAFT'] },
        amountDue: { gt: 0 },
      },
      include: {
        subscription: { include: { customer: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    const totals: AgingBucketSummary = {
      current: new Decimal(0),
      days1To30: new Decimal(0),
      days31To60: new Decimal(0),
      days61To90: new Decimal(0),
      days90Plus: new Decimal(0),
      total: new Decimal(0),
    };

    const customerMap = new Map<string, AgingCustomerRow>();

    for (const inv of unpaidInvoices) {
      const dueDate = new Date(inv.dueDate);
      const diffDays = Math.floor((asOf.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const due = inv.amountDue;

      const customer = inv.subscription.customer;
      let row = customerMap.get(inv.customerId);
      if (!row) {
        row = {
          customerId: inv.customerId,
          customerName: customer.name,
          customerEmail: customer.email,
          current: new Decimal(0),
          days1To30: new Decimal(0),
          days31To60: new Decimal(0),
          days61To90: new Decimal(0),
          days90Plus: new Decimal(0),
          total: new Decimal(0),
        };
        customerMap.set(inv.customerId, row);
      }

      if (diffDays <= 0) {
        row.current = row.current.plus(due);
        totals.current = totals.current.plus(due);
      } else if (diffDays <= 30) {
        row.days1To30 = row.days1To30.plus(due);
        totals.days1To30 = totals.days1To30.plus(due);
      } else if (diffDays <= 60) {
        row.days31To60 = row.days31To60.plus(due);
        totals.days31To60 = totals.days31To60.plus(due);
      } else if (diffDays <= 90) {
        row.days61To90 = row.days61To90.plus(due);
        totals.days61To90 = totals.days61To90.plus(due);
      } else {
        row.days90Plus = row.days90Plus.plus(due);
        totals.days90Plus = totals.days90Plus.plus(due);
      }

      row.total = row.total.plus(due);
      totals.total = totals.total.plus(due);
    }

    const customers = Array.from(customerMap.values()).map((c) => ({
      customerId: c.customerId,
      customerName: c.customerName,
      customerEmail: c.customerEmail,
      current: c.current.toFixed(2),
      days1To30: c.days1To30.toFixed(2),
      days31To60: c.days31To60.toFixed(2),
      days61To90: c.days61To90.toFixed(2),
      days90Plus: c.days90Plus.toFixed(2),
      total: c.total.toFixed(2),
    }));

    return {
      asOf: asOf.toISOString(),
      totals: {
        current: totals.current.toFixed(2),
        days1To30: totals.days1To30.toFixed(2),
        days31To60: totals.days31To60.toFixed(2),
        days61To90: totals.days61To90.toFixed(2),
        days90Plus: totals.days90Plus.toFixed(2),
        total: totals.total.toFixed(2),
      },
      customers,
    };
  }

  /**
   * Tax Summary Report: Taxable sales and tax collected by rate (< 2s)
   */
  async getTaxSummaryReport(startDate?: Date, endDate?: Date) {
    const where: any = {
      invoice: {
        status: { in: ['CONFIRMED', 'PAID'] },
      },
    };

    if (startDate || endDate) {
      where.invoice.issueDate = {};
      if (startDate) where.invoice.issueDate.gte = startDate;
      if (endDate) where.invoice.issueDate.lte = endDate;
    }

    const lines = await this.prisma.invoiceLine.findMany({
      where,
      select: {
        taxRatePercent: true,
        lineSubtotal: true,
        taxAmount: true,
      },
    });

    const rateMap = new Map<string, { rate: Decimal; taxableAmount: Decimal; taxAmount: Decimal }>();

    for (const l of lines) {
      const rateStr = l.taxRatePercent.toFixed(2);
      const entry = rateMap.get(rateStr) || {
        rate: l.taxRatePercent,
        taxableAmount: new Decimal(0),
        taxAmount: new Decimal(0),
      };
      entry.taxableAmount = entry.taxableAmount.plus(l.lineSubtotal);
      entry.taxAmount = entry.taxAmount.plus(l.taxAmount);
      rateMap.set(rateStr, entry);
    }

    let grandTaxable = new Decimal(0);
    let grandTax = new Decimal(0);

    const breakdown = Array.from(rateMap.entries()).map(([rateStr, v]) => {
      grandTaxable = grandTaxable.plus(v.taxableAmount);
      grandTax = grandTax.plus(v.taxAmount);
      return {
        ratePercent: rateStr,
        taxableAmount: v.taxableAmount.toFixed(2),
        taxAmount: v.taxAmount.toFixed(2),
      };
    });

    return {
      startDate: startDate?.toISOString() || null,
      endDate: endDate?.toISOString() || null,
      totalTaxableSales: grandTaxable.toFixed(2),
      totalTaxCollected: grandTax.toFixed(2),
      breakdown,
    };
  }

  /**
   * Payments by Method Report (< 2s)
   */
  async getPaymentsByMethodReport(startDate?: Date, endDate?: Date) {
    const where: any = { status: 'RECORDED' };
    if (startDate || endDate) {
      where.paidAt = {};
      if (startDate) where.paidAt.gte = startDate;
      if (endDate) where.paidAt.lte = endDate;
    }

    const payments = await this.prisma.payment.findMany({
      where,
      select: {
        method: true,
        amount: true,
      },
    });

    const methodMap = new Map<string, { count: number; total: Decimal }>();
    let grandTotal = new Decimal(0);

    for (const p of payments) {
      const entry = methodMap.get(p.method) || { count: 0, total: new Decimal(0) };
      entry.count++;
      entry.total = entry.total.plus(p.amount);
      grandTotal = grandTotal.plus(p.amount);
      methodMap.set(p.method, entry);
    }

    const methods = Array.from(methodMap.entries()).map(([method, v]) => ({
      method,
      count: v.count,
      total: v.total.toFixed(2),
      percentage: grandTotal.isZero()
        ? '0.00'
        : v.total.dividedBy(grandTotal).times(100).toFixed(2),
    }));

    return {
      startDate: startDate?.toISOString() || null,
      endDate: endDate?.toISOString() || null,
      grandTotal: grandTotal.toFixed(2),
      totalTransactions: payments.length,
      methods,
    };
  }

  /**
   * Generates Customer Account Statement with running balance
   */
  async getCustomerStatement(customerId: string, startDate?: Date, endDate?: Date) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) throw new NotFoundException(`Customer not found: ${customerId}`);

    const [invoices, payments, creditMemos] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { customerId, status: { not: 'CANCELLED' } },
        orderBy: { issueDate: 'asc' },
      }),
      this.prisma.payment.findMany({
        where: { customerId, status: 'RECORDED' },
        orderBy: { paidAt: 'asc' },
      }),
      this.prisma.creditMemo.findMany({
        where: { invoice: { customerId } },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    interface LedgerEntry {
      date: Date;
      type: 'INVOICE' | 'PAYMENT' | 'CREDIT_MEMO';
      reference: string;
      description: string;
      debit: Decimal;
      credit: Decimal;
    }

    const entries: LedgerEntry[] = [];

    for (const inv of invoices) {
      entries.push({
        date: inv.issueDate,
        type: 'INVOICE',
        reference: inv.number,
        description: `Invoice ${inv.number}`,
        debit: inv.total,
        credit: new Decimal(0),
      });
    }

    for (const p of payments) {
      entries.push({
        date: p.paidAt,
        type: 'PAYMENT',
        reference: p.id,
        description: `Payment via ${p.method} ${p.note ? `(${p.note})` : ''}`,
        debit: new Decimal(0),
        credit: p.amount,
      });
    }

    for (const cm of creditMemos) {
      entries.push({
        date: cm.createdAt,
        type: 'CREDIT_MEMO',
        reference: cm.number,
        description: `Credit Note ${cm.number}: ${cm.reason}`,
        debit: new Decimal(0),
        credit: cm.amount,
      });
    }

    // Sort chronologically
    entries.sort((a, b) => a.date.getTime() - b.date.getTime());

    let runningBalance = new Decimal(0);
    let totalInvoiced = new Decimal(0);
    let totalPaid = new Decimal(0);
    let totalCredited = new Decimal(0);

    const ledger = entries.map((e) => {
      totalInvoiced = totalInvoiced.plus(e.debit);
      totalPaid = totalPaid.plus(e.type === 'PAYMENT' ? e.credit : 0);
      totalCredited = totalCredited.plus(e.type === 'CREDIT_MEMO' ? e.credit : 0);
      runningBalance = runningBalance.plus(e.debit).minus(e.credit);

      return {
        date: e.date.toISOString(),
        type: e.type,
        reference: e.reference,
        description: e.description,
        debit: e.debit.toFixed(2),
        credit: e.credit.toFixed(2),
        runningBalance: runningBalance.toFixed(2),
      };
    });

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        company: customer.company,
        currency: customer.currency,
        currentCreditBalance: customer.creditBalance.toFixed(2),
      },
      summary: {
        totalInvoiced: totalInvoiced.toFixed(2),
        totalPaid: totalPaid.toFixed(2),
        totalCredited: totalCredited.toFixed(2),
        outstandingBalance: runningBalance.toFixed(2),
      },
      transactions: ledger,
    };
  }

  /**
   * Generates PDF buffer for Customer Account Statement
   */
  async renderStatementPdf(customerId: string): Promise<Buffer> {
    const stmt = await this.getCustomerStatement(customerId);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const primary = '#0f172a';
      const accent = '#4f46e5';
      const muted = '#64748b';

      doc
        .fontSize(22)
        .fillColor(accent)
        .text('Brightloop Software', 50, 45)
        .fontSize(9)
        .fillColor(muted)
        .text('Customer Statement of Account', 50, 72);

      doc
        .fontSize(16)
        .fillColor(primary)
        .text('ACCOUNT STATEMENT', 350, 45, { align: 'right' })
        .fontSize(9)
        .fillColor(muted)
        .text(`Date: ${new Date().toISOString().substring(0, 10)}`, 350, 68, { align: 'right' })
        .text(`Customer: ${stmt.customer.name}`, 350, 82, { align: 'right' });

      doc.moveTo(50, 105).lineTo(545, 105).strokeColor('#e2e8f0').stroke();

      // Summary Cards
      const boxY = 115;
      const boxW = 115;
      const boxH = 45;

      const drawBox = (x: number, title: string, val: string) => {
        doc.rect(x, boxY, boxW, boxH).fillAndStroke('#f8fafc', '#e2e8f0');
        doc.fillColor(muted).fontSize(8).text(title, x + 8, boxY + 8);
        doc.fillColor(primary).fontSize(11).font('Helvetica-Bold').text(val, x + 8, boxY + 22).font('Helvetica');
      };

      drawBox(50, 'TOTAL INVOICED', `${stmt.customer.currency} ${stmt.summary.totalInvoiced}`);
      drawBox(175, 'TOTAL PAID', `${stmt.customer.currency} ${stmt.summary.totalPaid}`);
      drawBox(300, 'TOTAL CREDITED', `${stmt.customer.currency} ${stmt.summary.totalCredited}`);
      drawBox(425, 'BALANCE DUE', `${stmt.customer.currency} ${stmt.summary.outstandingBalance}`);

      // Ledger Table Header
      let y = 180;
      doc.rect(50, y, 495, 20).fill('#f1f5f9');
      doc
        .fillColor(primary)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('Date', 55, y + 5)
        .text('Type', 125, y + 5)
        .text('Reference', 190, y + 5)
        .text('Invoiced', 280, y + 5, { width: 75, align: 'right' })
        .text('Paid/Credit', 365, y + 5, { width: 75, align: 'right' })
        .text('Balance', 455, y + 5, { width: 80, align: 'right' })
        .font('Helvetica');

      y += 24;

      for (const t of stmt.transactions) {
        if (y > 750) {
          doc.addPage();
          y = 50;
        }

        doc
          .fontSize(8)
          .fillColor(primary)
          .text(t.date.substring(0, 10), 55, y)
          .text(t.type, 125, y)
          .text(t.reference.substring(0, 18), 190, y)
          .text(Number(t.debit) > 0 ? Number(t.debit).toFixed(2) : '-', 280, y, { width: 75, align: 'right' })
          .text(Number(t.credit) > 0 ? Number(t.credit).toFixed(2) : '-', 365, y, { width: 75, align: 'right' })
          .text(t.runningBalance, 455, y, { width: 80, align: 'right' });

        y += 18;
        doc.moveTo(50, y).lineTo(545, y).strokeColor('#f8fafc').stroke();
        y += 2;
      }

      doc.end();
    });
  }
}
