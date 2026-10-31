import { PrismaClient, InvoiceStatus, DiscountType, DiscountScope } from '@prisma/client';
import Decimal from 'decimal.js';

export async function seedBilling(prisma: PrismaClient, subscriptions: Array<{ id: string; customerId: string; status: string }>) {
  console.log('Seeding B: Billing (Discounts, Invoices)...');

  // Seed standard discount
  const discount = await prisma.discount.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      name: 'Welcome 10% Off',
      type: DiscountType.PERCENTAGE,
      value: new Decimal('10.00'),
      scope: DiscountScope.SUBSCRIPTION,
      startsAt: new Date(Date.now() - 30 * 86400000),
      endsAt: new Date(Date.now() + 365 * 86400000),
      usageLimit: 500,
      usedCount: 0,
      isActive: true,
    },
  });

  // Seed sample invoices for active/confirmed subscriptions
  const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE' || s.status === 'CLOSED').slice(0, 100);
  const now = new Date();

  for (let i = 0; i < activeSubs.length; i++) {
    const sub = activeSubs[i];
    const periodStart = new Date(now.getTime() - 30 * 86400000);
    const periodEnd = new Date(now.getTime());
    const dueDate = new Date(now.getTime() + 15 * 86400000);
    const subtotal = new Decimal('4999.00');
    const taxTotal = new Decimal('899.82');
    const total = subtotal.plus(taxTotal);
    const isPaid = i % 2 === 0;

    const invoice = await prisma.invoice.upsert({
      where: {
        subscriptionId_periodStart_periodEnd: {
          subscriptionId: sub.id,
          periodStart,
          periodEnd,
        },
      },
      update: {},
      create: {
        number: `INV-2026-${String(i + 1).padStart(6, '0')}`,
        subscriptionId: sub.id,
        customerId: sub.customerId,
        status: isPaid ? InvoiceStatus.PAID : InvoiceStatus.CONFIRMED,
        periodStart,
        periodEnd,
        dueDate,
        currency: 'INR',
        subtotal,
        discountTotal: new Decimal(0),
        taxTotal,
        total,
        amountPaid: isPaid ? total : new Decimal(0),
        amountDue: isPaid ? new Decimal(0) : total,
        paidAt: isPaid ? new Date() : null,
        confirmedAt: new Date(),
        lines: {
          create: [
            {
              description: 'Odoo Base License - Monthly Recurring',
              quantity: 1,
              unitPrice: subtotal,
              lineSubtotal: subtotal,
              taxRatePercent: new Decimal('18.00'),
              taxAmount: taxTotal,
              lineTotal: total,
              kind: 'RECURRING',
            },
          ],
        },
      },
    });
  }
}

