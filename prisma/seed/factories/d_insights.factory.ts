import { PrismaClient, Channel, FindingKind, RiskBand } from '@prisma/client';
import Decimal from 'decimal.js';

export async function seedInsights(prisma: PrismaClient) {
  console.log('Seeding D: Insights & Templates...');

  // Standard message templates
  await prisma.messageTemplate.upsert({
    where: { key: 'invoice.confirmed' },
    update: {},
    create: {
      key: 'invoice.confirmed',
      channel: Channel.WHATSAPP,
      body: 'Hello {{customer.name}}, your invoice {{invoice.number}} for {{invoice.total}} is ready. Pay here: {{payLink}}',
      isActive: true,
    },
  });

  await prisma.messageTemplate.upsert({
    where: { key: 'reminder.d_minus_3' },
    update: {},
    create: {
      key: 'reminder.d_minus_3',
      channel: Channel.WHATSAPP,
      body: 'Reminder: Invoice {{invoice.number}} for {{invoice.total}} is due in 3 days.',
      isActive: true,
    },
  });

  // MRR snapshot
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  await prisma.mrrSnapshot.upsert({
    where: { month: currentMonth },
    update: {},
    create: {
      month: currentMonth,
      mrr: new Decimal('245000.00'),
      newMrr: new Decimal('45000.00'),
      expansionMrr: new Decimal('12000.00'),
      contractionMrr: new Decimal('3000.00'),
      churnedMrr: new Decimal('5000.00'),
      activeCount: 150,
    },
  });
}

