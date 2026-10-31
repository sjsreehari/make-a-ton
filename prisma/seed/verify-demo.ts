import { PrismaClient, Role } from '@prisma/client';
import { verify } from 'argon2';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface VerificationResult {
  category: string;
  item: string;
  expected: string;
  actual: string;
  passed: boolean;
}

async function verifyDemo() {
  console.log('='.repeat(80));
  console.log(' BillPilot Demo Data & Infrastructure Verification');
  console.log('='.repeat(80) + '\n');

  await prisma.$connect();
  const checks: VerificationResult[] = [];

  function record(category: string, item: string, expected: string, actual: any, passed: boolean) {
    checks.push({
      category,
      item,
      expected,
      actual: String(actual),
      passed,
    });
  }

  // 1. Cast Accounts (4 Accounts + Password verification)
  const castEmails = [
    { email: 'admin@brightloop.test', role: Role.ADMIN, name: 'Alex Chen' },
    { email: 'staff@brightloop.test', role: Role.STAFF, name: 'Samira Khan' },
    { email: 'finance@brightloop.test', role: Role.STAFF, name: 'David Park' },
    { email: 'customer@acmesoftware.test', role: Role.CUSTOMER, name: 'Priya Sharma' },
  ];

  for (const c of castEmails) {
    const user = await prisma.user.findUnique({ where: { email: c.email } });
    const exists = !!user && user.role === c.role;
    let pwdValid = false;
    if (user?.passwordHash) {
      pwdValid = await verify(user.passwordHash, 'Demo@12345!').catch(() => false);
    }
    record('Cast Accounts', c.email, `Role: ${c.role}, Pwd: Valid`, `Found: ${!!user}, Pwd: ${pwdValid ? 'Valid' : 'Invalid'}`, exists && pwdValid);
  }

  // Customer Acme Software
  const acme = await prisma.customer.findFirst({ where: { company: 'Acme Software' } });
  const acmeCredit = acme?.creditBalance ? Number(acme.creditBalance) : 0;
  record('Customer Scoping', 'Acme Software Credit', '12500 INR', `${acmeCredit} INR`, acmeCredit === 12500);

  // 2. Catalog (10 products, 6 plans, 3 tax rules)
  const productCount = await prisma.product.count();
  record('Catalog', 'Products Count', '>= 10', productCount, productCount >= 10);

  const planCount = await prisma.plan.count();
  record('Catalog', 'Plans Count', '>= 6', planCount, planCount >= 6);

  const taxRuleCount = await prisma.taxRule.count();
  record('Catalog', 'Tax Rules Count', '>= 3', taxRuleCount, taxRuleCount >= 3);

  // 3. Subscriptions (>= 25 across >= 15 customers)
  const subCount = await prisma.subscription.count();
  record('Subscriptions', 'Total Subscriptions', '>= 25', subCount, subCount >= 25);

  const customerCount = await prisma.customer.count();
  record('Subscriptions', 'Distinct Customers', '>= 15', customerCount, customerCount >= 15);

  // 12 active due TODAY
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const dueTodayCount = await prisma.subscription.count({
    where: {
      status: 'ACTIVE',
      nextBillingDate: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  });
  record('Subscriptions', 'Active Due Today', '>= 12', dueTodayCount, dueTodayCount >= 12);

  const pausedCount = await prisma.subscription.count({ where: { status: 'PAUSED' } });
  record('Subscriptions', 'Paused Subscriptions', '>= 4', pausedCount, pausedCount >= 4);

  const closedCount = await prisma.subscription.count({ where: { status: 'CLOSED' } });
  record('Subscriptions', 'Closed Subscriptions', '>= 3', closedCount, closedCount >= 3);

  // 4. Invoices & Payments (>= 40 Invoices, >= 15 Paid, >= 15 Overdue)
  const invoiceCount = await prisma.invoice.count();
  record('Invoices', 'Total Invoices', '>= 40', invoiceCount, invoiceCount >= 40);

  const paidCount = await prisma.invoice.count({ where: { status: 'PAID' } });
  record('Invoices', 'Paid Invoices', '>= 15', paidCount, paidCount >= 15);

  const overdueCount = await prisma.invoice.count({
    where: {
      status: 'CONFIRMED',
      dueDate: { lt: new Date() },
    },
  });
  record('Invoices', 'Overdue Invoices', '>= 15', overdueCount, overdueCount >= 15);

  const draftCount = await prisma.invoice.count({ where: { status: 'DRAFT' } });
  record('Invoices', 'Draft Invoices', '>= 4', draftCount, draftCount >= 4);

  const paymentCount = await prisma.payment.count({ where: { status: 'RECORDED' } });
  record('Payments', 'Recorded Payments', '>= 15', paymentCount, paymentCount >= 15);

  // 5. Payment Rescue & Mandates
  const rescueFailures = await prisma.paymentAttempt.findMany({
    where: { status: 'FAILED' },
    select: { failureKind: true },
  });
  const distinctKinds = new Set(rescueFailures.map((f) => f.failureKind).filter(Boolean));
  record('Rescue', 'Failure Kinds Covered', '>= 5 kinds', `${distinctKinds.size} kinds`, distinctKinds.size >= 5);

  const mandateCount = await prisma.mandate.count();
  record('Mandates', 'Total Mandates', '>= 8', mandateCount, mandateCount >= 8);

  // 6. Plan Changes & Discounts
  const planChangeCount = await prisma.planChangeRequest.count({ where: { status: 'REQUESTED' } });
  record('Plan Changes', 'Pending Requests', '>= 4', planChangeCount, planChangeCount >= 4);

  const discountCount = await prisma.discount.count();
  record('Discounts', 'Active Discounts', '>= 5', discountCount, discountCount >= 5);

  // 7. Snapshots
  const mrrSnapshotCount = await prisma.mrrSnapshot.count();
  record('Snapshots', 'Historical MRR Snapshots', '>= 6', mrrSnapshotCount, mrrSnapshotCount >= 6);

  const forecastCount = await prisma.forecastSnapshot.count();
  record('Snapshots', 'Forecast Snapshots', '>= 3', forecastCount, forecastCount >= 3);

  // 8. Revenue Leakage (6 distinct kinds)
  const findings = await prisma.leakageFinding.findMany({ select: { kind: true } });
  const findingKinds = new Set(findings.map((f) => f.kind));
  record('Revenue Leakage', 'Distinct Findings', '>= 6 kinds', `${findingKinds.size} kinds`, findingKinds.size >= 6);

  // 9. Bank Statement CSV
  const csvPath = path.join(__dirname, 'demo-bank-statement.csv');
  const csvExists = fs.existsSync(csvPath);
  let csvRowCount = 0;
  if (csvExists) {
    const content = fs.readFileSync(csvPath, 'utf8');
    csvRowCount = content.split('\n').filter((l) => l.trim().length > 0).length - 1; // subtract header
  }
  record('Bank Statement', 'CSV Statement Rows', '>= 30 rows', `${csvRowCount} rows`, csvExists && csvRowCount >= 30);

  // Output table
  console.table(checks);

  const failedChecks = checks.filter((c) => !c.passed);
  if (failedChecks.length > 0) {
    console.error(`\n❌ Verification FAILED: ${failedChecks.length} checks failed.`);
    for (const f of failedChecks) {
      console.error(`  - [${f.category}] ${f.item}: Expected ${f.expected}, but got ${f.actual}`);
    }
    process.exit(1);
  } else {
    console.log(`\n✅ ALL ${checks.length} VERIFICATION CHECKS PASSED PERFECTLY!\n`);
    process.exit(0);
  }
}

verifyDemo()
  .catch((err) => {
    console.error('Verification script crashed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
