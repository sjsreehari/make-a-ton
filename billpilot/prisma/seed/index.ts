import { PrismaClient } from '@prisma/client';
import { seedCore } from './factories/a_core.factory';
import { seedBilling } from './factories/b_billing.factory';
import { seedPayments } from './factories/c_payments.factory';
import { seedInsights } from './factories/d_insights.factory';

const prisma = new PrismaClient();

async function main() {
  const isScale = process.argv.includes('--scale=5000');
  const scale = isScale ? 5000 : 200;

  console.log(`Starting BillPilot seed orchestrator (scale=${scale})...`);

  const { subscriptions } = await seedCore(prisma, scale);
  await seedBilling(prisma, subscriptions);
  await seedPayments(prisma);
  await seedInsights(prisma);

  console.log('\n=============================================');
  console.log(' Seed completed successfully!');
  console.log(' Admin: staff: admin@brightloop.test / Admin@12345!');
  console.log(' Staff: staff@brightloop.test / Staff@12345!');
  console.log(' Cust1: cust1@brightloop.test / Cust@12345!');
  console.log('=============================================\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
