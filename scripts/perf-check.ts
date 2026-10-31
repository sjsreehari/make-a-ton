import { PrismaClient } from '@prisma/client';

interface ExplainRow {
  id: number;
  select_type: string;
  table: string;
  partitions?: string;
  type: string;
  possible_keys: string | null;
  key: string | null;
  key_len: string | null;
  ref: string | null;
  rows: number;
  filtered: number;
  Extra: string;
}

const prisma = new PrismaClient();

const BENCHMARK_QUERIES = [
  {
    name: '(a) Dashboard Summary',
    description: 'Total revenue, active subscriptions, overdue invoices count',
    sql: `SELECT
      COALESCE(SUM(amountPaid), 0) AS totalRevenue,
      (SELECT COUNT(*) FROM \`Subscription\` WHERE \`status\` = 'ACTIVE') AS activeSubs,
      (SELECT COUNT(*) FROM \`Invoice\` WHERE \`status\` = 'CONFIRMED' AND \`dueDate\` < NOW()) AS overdueCount
    FROM \`Invoice\``,
  },
  {
    name: '(b) Overdue Invoices List',
    description: 'Confirmed invoices past due date ordered by due date',
    sql: `SELECT \`id\`, \`number\`, \`customerId\`, \`amountDue\`, \`dueDate\`
    FROM \`Invoice\`
    WHERE \`status\` = 'CONFIRMED' AND \`dueDate\` < NOW()
    ORDER BY \`dueDate\` ASC
    LIMIT 50`,
  },
  {
    name: '(c) Active Subscriptions Due for Billing',
    description: 'Active subscriptions ready for invoice generation',
    sql: `SELECT \`id\`, \`customerId\`, \`planId\`, \`nextBillingDate\`
    FROM \`Subscription\`
    WHERE \`status\` = 'ACTIVE' AND \`nextBillingDate\` <= NOW()
    ORDER BY \`nextBillingDate\` ASC
    LIMIT 50`,
  },
  {
    name: '(d) Customer Invoices with Payments',
    description: 'Invoices joined with recorded payments for a customer',
    sql: `SELECT i.\`id\`, i.\`number\`, i.\`total\`, p.\`id\` AS paymentId, p.\`amount\`, p.\`paidAt\`
    FROM \`Invoice\` i
    INNER JOIN \`Payment\` p ON p.\`invoiceId\` = i.\`id\`
    WHERE i.\`customerId\` = 'cust_demo_sample'
    ORDER BY i.\`issueDate\` DESC
    LIMIT 50`,
  },
  {
    name: '(e) Leakage Finding Scan',
    description: 'Subscriptions active past billing date without generated invoice',
    sql: `SELECT s.\`id\`, s.\`customerId\`, s.\`status\`, s.\`nextBillingDate\`
    FROM \`Subscription\` s
    LEFT JOIN \`Invoice\` i ON i.\`subscriptionId\` = s.\`id\` AND i.\`periodEnd\` >= s.\`nextBillingDate\`
    WHERE s.\`status\` = 'ACTIVE' AND s.\`nextBillingDate\` < NOW() AND i.\`id\` IS NULL
    LIMIT 50`,
  },
];

async function runBenchmark() {
  console.log('='.repeat(80));
  console.log(' BillPilot MySQL 8.0 Query Performance & EXPLAIN Benchmark');
  console.log('='.repeat(80) + '\n');

  await prisma.$connect();
  const results: any[] = [];

  for (const q of BENCHMARK_QUERIES) {
    console.log(`\nQuery: ${q.name}`);
    console.log(`Description: ${q.description}`);
    console.log('-'.repeat(80));

    // 1. Run EXPLAIN
    const rawRows = (await prisma.$queryRawUnsafe(`EXPLAIN ${q.sql}`)) as any[];
    const explainRows = rawRows.map((r) => ({
      table: String(r.table ?? r.f2 ?? 'N/A'),
      type: String(r.type ?? r.f4 ?? 'N/A'),
      key: r.key ?? r.f6 ? String(r.key ?? r.f6) : 'NONE',
      rows: Number(r.rows ?? r.f9 ?? 0),
      extra: String(r.Extra ?? r.f11 ?? ''),
    }));

    console.log('EXPLAIN Plan:');
    for (const r of explainRows) {
      const tableStr = r.table.padEnd(20);
      const typeStr = r.type.padEnd(10);
      const keyStr = r.key.padEnd(30);
      console.log(`  Table: ${tableStr} Type: ${typeStr} Key: ${keyStr} Rows: ${r.rows}`);
    }

    // 2. Measure Timings over 10 samples
    const timings: number[] = [];
    for (let i = 0; i < 10; i++) {
      const t0 = performance.now();
      await prisma.$queryRawUnsafe(q.sql);
      timings.push(performance.now() - t0);
    }

    timings.sort((a, b) => a - b);
    const min = timings[0].toFixed(2);
    const avg = (timings.reduce((a, b) => a + b, 0) / timings.length).toFixed(2);
    const p95 = timings[Math.floor(timings.length * 0.95)].toFixed(2);
    const max = timings[timings.length - 1].toFixed(2);

    console.log(`Timings: min=${min}ms, avg=${avg}ms, p95=${p95}ms, max=${max}ms`);

    results.push({
      name: q.name,
      plan: explainRows.map(r => `${r.table || 'derived'}:${r.type || 'N/A'}(${r.key || 'NONE'})`).join(', '),
      p95: `${p95}ms`,
      avg: `${avg}ms`,
    });
  }

  await prisma.$disconnect();

  console.log('\n' + '='.repeat(80));
  console.log(' Benchmark Summary Table');
  console.log('='.repeat(80));
  console.table(results);
}

runBenchmark().catch((err) => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
