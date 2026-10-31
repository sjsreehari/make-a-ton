import { PrismaClient, PaymentMethod, PaymentStatus } from '@prisma/client';
import Decimal from 'decimal.js';

export async function seedPayments(prisma: PrismaClient) {
  console.log('Seeding C: Payments...');

  const paidInvoices = await prisma.invoice.findMany({
    where: { status: 'PAID' },
    take: 50,
  });

  for (let i = 0; i < paidInvoices.length; i++) {
    const inv = paidInvoices[i];
    await prisma.payment.upsert({
      where: { externalRef: `pay-ref-${inv.number}` },
      update: {},
      create: {
        invoiceId: inv.id,
        customerId: inv.customerId,
        method: PaymentMethod.RAZORPAY,
        amount: inv.total,
        paidAt: new Date(),
        status: PaymentStatus.RECORDED,
        externalRef: `pay-ref-${inv.number}`,
        note: 'Auto-reconciled via Razorpay webhook',
      },
    });
  }
}
