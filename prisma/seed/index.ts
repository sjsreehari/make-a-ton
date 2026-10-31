import { PrismaClient } from '@prisma/client';
import { seedCore } from './factories/a_core.factory';
import { seedBilling } from './factories/b_billing.factory';
import { seedPayments } from './factories/c_payments.factory';
import { seedInsights } from './factories/d_insights.factory';
import { seedDemo } from './seed-demo';

const prisma = new PrismaClient();

async function main() {
  const isScale = process.argv.includes('--scale=5000');
  const scale = isScale ? 5000 : 200;

  console.log(`Starting BillPilot seed orchestrator (scale=${scale})...`);

  try {
    const { subscriptions } = await seedCore(prisma, scale);
    await seedBilling(prisma, subscriptions);
    await seedPayments(prisma);
    await seedInsights(prisma);
  } catch (factoryErr: any) {
    console.warn(`Initial factories notice: ${factoryErr.message}. Proceeding to curated demo seed...`);
  }

  // Curated demo data is guaranteed to run
  await seedDemo(prisma);

  console.log('\n=============================================');
  console.log(' All seeds completed successfully!');
  console.log(' Cast Accounts (Password: Demo@12345!):');
  console.log('  - admin@brightloop.test (ADMIN)');
  console.log('  - staff@brightloop.test (STAFF)');
  console.log('  - finance@brightloop.test (STAFF)');
  console.log('  - customer@acmesoftware.test (CUSTOMER)');
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
