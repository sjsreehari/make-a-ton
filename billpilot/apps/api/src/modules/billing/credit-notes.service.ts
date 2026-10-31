import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import Decimal from 'decimal.js';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CommonAuditService } from '../../common/audit/audit.service';
import { EventBusService } from '../../common/events/event-bus.service';
import { formatDocumentNumber } from './invoice-numbering';
import { generateInvoicePdfBuffer } from './invoice-pdf.service';
import { Actor } from '@billpilot/shared';

export interface CreateCreditNoteDto {
  amount: number;
  reason: string;
}

@Injectable()
export class CreditNotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: CommonAuditService,
    private readonly eventBus: EventBusService,
  ) {}

  async createForInvoice(invoiceId: string, dto: CreateCreditNoteDto, actor?: Actor) {
    if (dto.amount <= 0) {
      throw new BadRequestException('Credit note amount must be positive');
    }

    const inv = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true },
    });

    if (!inv) throw new NotFoundException(`Invoice not found: ${invoiceId}`);

    const count = await this.prisma.creditMemo.count();
    const number = formatDocumentNumber('CN-{year}-{seq:6}', count + 1);
    const creditAmount = new Decimal(dto.amount);

    return this.prisma.$transaction(async (tx) => {
      // 1. Create CreditMemo record
      const memo = await tx.creditMemo.create({
        data: {
          number,
          invoiceId: inv.id,
          amount: creditAmount,
          reason: dto.reason,
        },
      });

      // 2. Reduce invoice amountDue
      let excessCredit = new Decimal(0);
      let newDue = inv.amountDue.minus(creditAmount);
      if (newDue.lt(0)) {
        excessCredit = newDue.abs();
        newDue = new Decimal(0);

        // Credit excess to customer balance
        await tx.customer.update({
          where: { id: inv.customerId },
          data: { creditBalance: { increment: excessCredit } },
        });
      }

      const isSettled = newDue.lte(0);
      await tx.invoice.update({
        where: { id: inv.id },
        data: {
          amountDue: newDue,
          status: isSettled ? 'PAID' : inv.status,
          paidAt: isSettled ? new Date() : undefined,
        },
      });

      await this.audit.log({
        actor,
        entity: 'CreditMemo',
        entityId: memo.id,
        action: 'CREDIT_NOTE_CREATED',
        after: {
          number: memo.number,
          invoiceId: inv.id,
          amount: memo.amount.toFixed(2),
          reason: memo.reason,
          excessCredit: excessCredit.toFixed(2),
        },
      });

      return {
        id: memo.id,
        number: memo.number,
        invoiceId: inv.id,
        invoiceNumber: inv.number,
        amount: memo.amount.toFixed(2),
        reason: memo.reason,
        createdAt: memo.createdAt.toISOString(),
        invoiceNewAmountDue: newDue.toFixed(2),
      };
    });
  }

  async findByInvoice(invoiceId: string) {
    const memos = await this.prisma.creditMemo.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: memos.map((m) => ({
        id: m.id,
        number: m.number,
        invoiceId: m.invoiceId,
        amount: m.amount.toFixed(2),
        reason: m.reason,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }

  async renderPdf(creditNoteId: string): Promise<Buffer> {
    const memo = await this.prisma.creditMemo.findUnique({
      where: { id: creditNoteId },
      include: {
        invoice: {
          include: { customer: true },
        },
      },
    });

    if (!memo) throw new NotFoundException(`Credit Note not found: ${creditNoteId}`);

    return generateInvoicePdfBuffer({
      number: memo.number,
      issueDate: memo.createdAt.toISOString(),
      dueDate: memo.createdAt.toISOString(),
      currency: memo.invoice.currency,
      status: 'ISSUED',
      customer: {
        name: memo.invoice.customer.name,
        email: memo.invoice.customer.email,
        phone: memo.invoice.customer.phone,
        company: memo.invoice.customer.company,
        gstin: memo.invoice.customer.gstin,
      },
      lines: [
        {
          description: `Credit Note for Invoice ${memo.invoice.number}: ${memo.reason}`,
          quantity: 1,
          unitPrice: memo.amount.toString(),
          taxRatePercent: 0,
          lineTotal: memo.amount.toString(),
        },
      ],
      subtotal: memo.amount.toString(),
      discountTotal: '0.00',
      taxTotal: '0.00',
      total: memo.amount.toString(),
      amountPaid: memo.amount.toString(),
      amountDue: '0.00',
      notes: `Linked to Invoice: ${memo.invoice.number}. Reason: ${memo.reason}`,
    });
  }
}
