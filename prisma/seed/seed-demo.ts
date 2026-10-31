import {
  PrismaClient,
  Role,
  BillingPeriod,
  ProductType,
  SubscriptionStatus,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  FailureKind,
  MandateStatus,
  PlanChangeKind,
  PlanChangeStatus,
  DiscountType,
  DiscountScope,
  LeakageFindingKind,
} from '@prisma/client';
import { hash } from 'argon2';
import Decimal from 'decimal.js';

// Anchor helper: dynamic dates relative to today
const NOW = new Date();
export function anchor(daysOffset: number): Date {
  const d = new Date(NOW.getTime() + daysOffset * 86400000);
  d.setHours(9, 0, 0, 0);
  return d;
}

export async function seedDemo(prisma: PrismaClient) {
  console.log('='.repeat(80));
  console.log(' Seeding BillPilot Curated Deterministic Demo Data');
  console.log('='.repeat(80));

  const demoPasswordHash = await hash('Demo@12345!');

  // 1. Tax Rules
  console.log('Seeding Tax Rules...');
  const [tax18, tax0, tax5] = await Promise.all([
    prisma.taxRule.upsert({
      where: { id: 'tax-gst-18' },
      update: {},
      create: { id: 'tax-gst-18', name: 'GST 18%', ratePercent: new Decimal(18.0), isActive: true },
    }),
    prisma.taxRule.upsert({
      where: { id: 'tax-gst-0' },
      update: {},
      create: { id: 'tax-gst-0', name: 'GST 0% (SEZ/Export)', ratePercent: new Decimal(0.0), isActive: true },
    }),
    prisma.taxRule.upsert({
      where: { id: 'tax-gst-5' },
      update: {},
      create: { id: 'tax-gst-5', name: 'GST 5% (Hardware)', ratePercent: new Decimal(5.0), isActive: true },
    }),
  ]);

  // 2. Products (10 realistic SaaS products)
  console.log('Seeding Products...');
  const productDefs = [
    { id: 'prod-billing', name: 'Cloud Billing Engine', type: ProductType.SOFTWARE, salesPrice: 2999, costPrice: 500, taxId: tax18.id },
    { id: 'prod-metered', name: 'Metered Events Addon', type: ProductType.ADDON, salesPrice: 999, costPrice: 100, taxId: tax18.id },
    { id: 'prod-sla', name: 'Enterprise SLA', type: ProductType.SERVICE, salesPrice: 4999, costPrice: 800, taxId: tax18.id },
    { id: 'prod-audit', name: 'Audit Trail Exporter', type: ProductType.ADDON, salesPrice: 1499, costPrice: 150, taxId: tax18.id },
    { id: 'prod-ssl', name: 'Custom Domain SSL', type: ProductType.ADDON, salesPrice: 499, costPrice: 50, taxId: tax18.id },
    { id: 'prod-ip', name: 'Dedicated IP', type: ProductType.ADDON, salesPrice: 1999, costPrice: 300, taxId: tax18.id },
    { id: 'prod-sso', name: 'SSO / SAML Pack', type: ProductType.SOFTWARE, salesPrice: 3499, costPrice: 400, taxId: tax18.id },
    { id: 'prod-whatsapp', name: 'WhatsApp Alerts Pack', type: ProductType.SERVICE, salesPrice: 799, costPrice: 80, taxId: tax18.id },
    { id: 'prod-support', name: 'Premium Support', type: ProductType.SUPPORT, salesPrice: 2499, costPrice: 500, taxId: tax18.id },
    { id: 'prod-vault', name: 'Compliance Vault', type: ProductType.SOFTWARE, salesPrice: 5999, costPrice: 1000, taxId: tax18.id },
  ];

  const products: Record<string, any> = {};
  for (const p of productDefs) {
    products[p.id] = await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        name: p.name,
        type: p.type,
        salesPrice: new Decimal(p.salesPrice),
        costPrice: new Decimal(p.costPrice),
        taxRuleId: p.taxId,
        isActive: true,
      },
    });
  }

  // 3. Plans (6 plans across billing periods)
  console.log('Seeding Plans...');
  const planDefs = [
    { id: 'plan-starter', name: 'Starter', price: 2999, period: BillingPeriod.MONTHLY, mainProd: 'prod-billing' },
    { id: 'plan-growth', name: 'Growth', price: 9999, period: BillingPeriod.MONTHLY, mainProd: 'prod-billing' },
    { id: 'plan-scale', name: 'Scale', price: 29999, period: BillingPeriod.MONTHLY, mainProd: 'prod-billing' },
    { id: 'plan-enterprise', name: 'Enterprise Annual', price: 299999, period: BillingPeriod.YEARLY, mainProd: 'prod-billing' },
    { id: 'plan-daily', name: 'Daily Pilot', price: 199, period: BillingPeriod.DAILY, mainProd: 'prod-metered' },
    { id: 'plan-weekly', name: 'Weekly Sprint', price: 1499, period: BillingPeriod.WEEKLY, mainProd: 'prod-metered' },
  ];

  const plans: Record<string, any> = {};
  for (const p of planDefs) {
    plans[p.id] = await prisma.plan.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        name: p.name,
        price: new Decimal(p.price),
        billingPeriod: p.period,
        isActive: true,
      },
    });

    await prisma.planProduct.upsert({
      where: { planId_productId: { planId: p.id, productId: p.mainProd } },
      update: {},
      create: { planId: p.id, productId: p.mainProd, quantity: 1 },
    });
  }

  // 4. Discounts & Promotions (5 discounts)
  console.log('Seeding Discounts...');
  const discounts = [
    { id: 'disc-welcome20', code: 'WELCOME20', type: DiscountType.PERCENTAGE, value: 20, usageLimit: 100, usedCount: 24, endsAt: anchor(60) },
    { id: 'disc-startup50', code: 'STARTUP50', type: DiscountType.PERCENTAGE, value: 50, usageLimit: 50, usedCount: 12, endsAt: anchor(90) },
    { id: 'disc-flat1000', code: 'FLAT1000', type: DiscountType.FIXED, value: 1000, usageLimit: null, usedCount: 45, endsAt: anchor(120) },
    { id: 'disc-partner', code: 'PARTNER_ANNUAL', type: DiscountType.PERCENTAGE, value: 15, usageLimit: 200, usedCount: 38, endsAt: anchor(180) },
    { id: 'disc-expired', code: 'EXPIRED_PROMO', type: DiscountType.PERCENTAGE, value: 100, usageLimit: 10, usedCount: 10, endsAt: anchor(-10) },
  ];

  for (const d of discounts) {
    await prisma.discount.upsert({
      where: { id: d.id },
      update: {},
      create: {
        id: d.id,
        code: d.code,
        name: d.code,
        type: d.type,
        scope: DiscountScope.SUBSCRIPTION,
        value: new Decimal(d.value),
        usageLimit: d.usageLimit,
        usedCount: d.usedCount,
        startsAt: anchor(-180),
        endsAt: d.endsAt,
        isActive: true,
      },
    });
  }

  // 5. The Cast (4 Curated Accounts)
  console.log('Seeding Cast Accounts...');
  // (a) Admin: Alex Chen
  await prisma.user.upsert({
    where: { email: 'admin@brightloop.test' },
    update: { passwordHash: demoPasswordHash },
    create: {
      id: 'usr-admin-alex',
      email: 'admin@brightloop.test',
      name: 'Alex Chen, Founder & CEO',
      passwordHash: demoPasswordHash,
      role: Role.ADMIN,
      isActive: true,
      emailVerified: true,
    },
  });

  // (b) Staff: Samira Khan
  await prisma.user.upsert({
    where: { email: 'staff@brightloop.test' },
    update: { passwordHash: demoPasswordHash },
    create: {
      id: 'usr-staff-samira',
      email: 'staff@brightloop.test',
      name: 'Samira Khan, Ops Lead',
      passwordHash: demoPasswordHash,
      role: Role.STAFF,
      isActive: true,
      emailVerified: true,
    },
  });

  // (c) Finance Lead: David Park
  await prisma.user.upsert({
    where: { email: 'finance@brightloop.test' },
    update: { passwordHash: demoPasswordHash },
    create: {
      id: 'usr-finance-david',
      email: 'finance@brightloop.test',
      name: 'David Park, Finance Lead',
      passwordHash: demoPasswordHash,
      role: Role.STAFF,
      isActive: true,
      emailVerified: true,
    },
  });

  // (d) Customer: Priya Sharma of Acme Software
  const acmeCustomer = await prisma.customer.upsert({
    where: { id: 'cust-acme-software' },
    update: { creditBalance: new Decimal(12500.0) },
    create: {
      id: 'cust-acme-software',
      name: 'Priya Sharma',
      email: 'customer@acmesoftware.test',
      phone: '+919876543210',
      company: 'Acme Software',
      gstin: '29ABCDE1234F1Z5',
      currency: 'INR',
      creditBalance: new Decimal(12500.0),
      billingAddress: {
        line1: 'Indiranagar Tech Enclave, 100ft Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        country: 'IN',
      },
    },
  });

  await prisma.user.upsert({
    where: { email: 'customer@acmesoftware.test' },
    update: { passwordHash: demoPasswordHash, customerId: acmeCustomer.id },
    create: {
      id: 'usr-customer-priya',
      email: 'customer@acmesoftware.test',
      name: 'Priya Sharma, CTO of Acme Software',
      passwordHash: demoPasswordHash,
      role: Role.CUSTOMER,
      isActive: true,
      emailVerified: true,
      customerId: acmeCustomer.id,
      whatsappOptIn: true,
    },
  });

  // 14 Additional Customers (15 total)
  console.log('Seeding Customers...');
  const otherCustomerNames = [
    { id: 'cust-zeta', name: 'Zeta Dynamics', email: 'billing@zetadynamics.test', company: 'Zeta Dynamics' },
    { id: 'cust-hyperscale', name: 'HyperScale Labs', email: 'finance@hyperscale.test', company: 'HyperScale Labs' },
    { id: 'cust-apex', name: 'Apex Cloud Tech', email: 'accounts@apexcloud.test', company: 'Apex Cloud Tech' },
    { id: 'cust-fintech', name: 'FinTech Horizon', email: 'pay@fintechhorizon.test', company: 'FinTech Horizon' },
    { id: 'cust-bluesky', name: 'BlueSky Retail', email: 'admin@blueskyretail.test', company: 'BlueSky Retail' },
    { id: 'cust-orbit', name: 'Orbit Logix', email: 'billing@orbitlogix.test', company: 'Orbit Logix' },
    { id: 'cust-quantum', name: 'Quantum Data AI', email: 'accounts@quantumai.test', company: 'Quantum Data AI' },
    { id: 'cust-pulse', name: 'Pulse Media', email: 'finance@pulsemedia.test', company: 'Pulse Media' },
    { id: 'cust-starlight', name: 'Starlight Bio', email: 'billing@starlightbio.test', company: 'Starlight Bio' },
    { id: 'cust-veritas', name: 'Veritas Sec', email: 'ops@veritassec.test', company: 'Veritas Sec' },
    { id: 'cust-omni', name: 'Omni Global', email: 'finance@omniglobal.test', company: 'Omni Global' },
    { id: 'cust-catalyst', name: 'Catalyst Health', email: 'accounts@catalysthealth.test', company: 'Catalyst Health' },
    { id: 'cust-terra', name: 'Terra Networks', email: 'billing@terranetworks.test', company: 'Terra Networks' },
    { id: 'cust-nexus', name: 'Nexus IoT', email: 'finance@nexusiot.test', company: 'Nexus IoT' },
  ];

  const allCustomers = [acmeCustomer];
  for (const c of otherCustomerNames) {
    const cust = await prisma.customer.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        email: c.email,
        company: c.company,
        gstin: '29AABCS1429B1ZB',
        currency: 'INR',
        creditBalance: new Decimal(0),
        billingAddress: { line1: 'MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', country: 'IN' },
      },
    });
    allCustomers.push(cust);
  }

  // 6. Subscriptions (25+ Subscriptions)
  console.log('Seeding Subscriptions...');
  const subscriptionList: any[] = [];
  const planKeys = ['plan-starter', 'plan-growth', 'plan-scale', 'plan-enterprise', 'plan-daily', 'plan-weekly'];

  // (a) 12 Active Subscriptions whose nextBillingDate is TODAY (anchor(0))
  for (let i = 1; i <= 12; i++) {
    const cust = allCustomers[(i - 1) % allCustomers.length];
    const planKey = planKeys[(i - 1) % planKeys.length];
    const sub = await prisma.subscription.upsert({
      where: { id: `sub-active-today-${i}` },
      update: { nextBillingDate: anchor(0) },
      create: {
        id: `sub-active-today-${i}`,
        number: `SUB-TODAY-${String(i).padStart(3, '0')}`,
        customerId: cust.id,
        planId: plans[planKey].id,
        status: SubscriptionStatus.ACTIVE,
        startDate: anchor(-30),
        nextBillingDate: anchor(0), // DUE TODAY
        createdAt: anchor(-30),
      },
    });

    await prisma.subscriptionLine.upsert({
      where: { id: `subline-today-${i}` },
      update: {},
      create: {
        id: `subline-today-${i}`,
        subscriptionId: sub.id,
        productId: 'prod-billing',
        quantity: 1,
        unitPrice: plans[planKey].price,
        description: `${plans[planKey].name} subscription`,
        amount: plans[planKey].price,
        taxRuleId: tax18.id,
      },
    });
    subscriptionList.push(sub);
  }

  // (b) 6 Active Subscriptions mid-cycle (nextBillingDate in 10-20 days)
  for (let i = 1; i <= 6; i++) {
    const cust = allCustomers[(i + 2) % allCustomers.length];
    const planKey = planKeys[(i + 1) % planKeys.length];
    const sub = await prisma.subscription.upsert({
      where: { id: `sub-active-mid-${i}` },
      update: { nextBillingDate: anchor(15) },
      create: {
        id: `sub-active-mid-${i}`,
        number: `SUB-MID-${String(i).padStart(3, '0')}`,
        customerId: cust.id,
        planId: plans[planKey].id,
        status: SubscriptionStatus.ACTIVE,
        startDate: anchor(-15),
        nextBillingDate: anchor(15),
        createdAt: anchor(-15),
      },
    });

    await prisma.subscriptionLine.upsert({
      where: { id: `subline-mid-${i}` },
      update: {},
      create: {
        id: `subline-mid-${i}`,
        subscriptionId: sub.id,
        productId: 'prod-billing',
        quantity: 1,
        unitPrice: plans[planKey].price,
        description: `${plans[planKey].name} mid-cycle`,
        amount: plans[planKey].price,
        taxRuleId: tax18.id,
      },
    });
    subscriptionList.push(sub);
  }

  // (c) 4 Paused Subscriptions (one paused 65 days ago for leakage condition 6)
  const pauseReasons = ['SEASONAL_PAUSE', 'PAYMENT_PENDING', 'CUSTOMER_REQUEST', 'SEASONAL_PAUSE'];
  for (let i = 1; i <= 4; i++) {
    const cust = allCustomers[(i + 4) % allCustomers.length];
    const daysPaused = i === 1 ? 65 : 20; // 65 days triggers Leakage condition 6
    const sub = await prisma.subscription.upsert({
      where: { id: `sub-paused-${i}` },
      update: {},
      create: {
        id: `sub-paused-${i}`,
        number: `SUB-PAUSED-${String(i).padStart(3, '0')}`,
        customerId: cust.id,
        planId: plans['plan-starter'].id,
        status: SubscriptionStatus.PAUSED,
        isPaused: true,
        pausedAt: anchor(-daysPaused),
        startDate: anchor(-120),
        closeReason: pauseReasons[i - 1],
        createdAt: anchor(-120),
      },
    });
    subscriptionList.push(sub);
  }

  // (d) 3 Closed Subscriptions
  const closeReasons = ['UPGRADED', 'CHURNED_PRICE', 'COMPLETED_CYCLES'];
  for (let i = 1; i <= 3; i++) {
    const cust = allCustomers[(i + 6) % allCustomers.length];
    const sub = await prisma.subscription.upsert({
      where: { id: `sub-closed-${i}` },
      update: {},
      create: {
        id: `sub-closed-${i}`,
        number: `SUB-CLOSED-${String(i).padStart(3, '0')}`,
        customerId: cust.id,
        planId: plans['plan-growth'].id,
        status: SubscriptionStatus.CLOSED,
        startDate: anchor(-180),
        closedAt: anchor(-10),
        closeReason: closeReasons[i - 1],
        createdAt: anchor(-180),
      },
    });
    subscriptionList.push(sub);
  }

  // (e) 1 Never Invoiced Active Subscription (Leakage Condition 1)
  const neverInvoicedSub = await prisma.subscription.upsert({
    where: { id: 'sub-never-invoiced-1' },
    update: {},
    create: {
      id: 'sub-never-invoiced-1',
      number: 'SUB-LEAK-NEVERINV',
      customerId: acmeCustomer.id,
      planId: plans['plan-scale'].id,
      status: SubscriptionStatus.ACTIVE,
      startDate: anchor(-45),
      nextBillingDate: anchor(-15),
      createdAt: anchor(-45),
    },
  });
  subscriptionList.push(neverInvoicedSub);

  // (f) 1 Expired But Active Subscription (Leakage Condition 4)
  const expiredActiveSub = await prisma.subscription.upsert({
    where: { id: 'sub-expired-active-1' },
    update: {},
    create: {
      id: 'sub-expired-active-1',
      number: 'SUB-LEAK-EXPIRED',
      customerId: allCustomers[1].id,
      planId: plans['plan-growth'].id,
      status: SubscriptionStatus.ACTIVE,
      startDate: anchor(-365),
      expiryDate: anchor(-5), // Expired 5 days ago
      nextBillingDate: anchor(25),
      createdAt: anchor(-365),
    },
  });
  subscriptionList.push(expiredActiveSub);

  // 7. Invoices & Payments (40+ Invoices)
  console.log('Seeding Invoices and Payments...');
  const allInvoices: any[] = [];
  const paymentMethods = [PaymentMethod.UPI, PaymentMethod.CARD, PaymentMethod.BANK_TRANSFER, PaymentMethod.RAZORPAY];

  // (a) 15 PAID Invoices with Payments
  for (let i = 1; i <= 15; i++) {
    const cust = allCustomers[(i - 1) % allCustomers.length];
    const sub = subscriptionList[(i - 1) % subscriptionList.length];
    const amount = new Decimal(2999.0);
    const tax = amount.times(0.18);
    const total = amount.plus(tax);

    const inv = await prisma.invoice.upsert({
      where: { id: `inv-paid-${i}` },
      update: {},
      create: {
        id: `inv-paid-${i}`,
        number: `INV-DEMO-${String(i).padStart(3, '0')}`,
        subscriptionId: sub.id,
        customerId: cust.id,
        status: InvoiceStatus.PAID,
        periodStart: anchor(-60 + i),
        periodEnd: anchor(-30 + i),
        issueDate: anchor(-30 + i),
        dueDate: anchor(-15 + i),
        paidAt: anchor(-14 + i),
        subtotal: amount,
        taxTotal: tax,
        discountTotal: new Decimal(0),
        total,
        amountPaid: total,
        amountDue: new Decimal(0),
      },
    });

    await prisma.invoiceLine.upsert({
      where: { id: `invline-paid-${i}` },
      update: {},
      create: {
        id: `invline-paid-${i}`,
        invoiceId: inv.id,
        productId: 'prod-billing',
        description: 'Cloud Billing Engine',
        quantity: 1,
        unitPrice: amount,
        lineSubtotal: amount,
        taxRatePercent: new Decimal(18.0),
        taxAmount: tax,
        lineTotal: total,
      },
    });

    await prisma.payment.upsert({
      where: { id: `pay-demo-${i}` },
      update: {},
      create: {
        id: `pay-demo-${i}`,
        invoiceId: inv.id,
        customerId: cust.id,
        method: paymentMethods[(i - 1) % paymentMethods.length],
        status: PaymentStatus.RECORDED,
        amount: total,
        paidAt: anchor(-14 + i),
        externalRef: `TXN1000000${String(i).padStart(2, '0')}`,
      },
    });

    allInvoices.push(inv);
  }

  // (b) 15 OVERDUE Invoices (CONFIRMED, dueDate in past, amountDue > 0)
  for (let i = 1; i <= 15; i++) {
    const cust = allCustomers[(i + 1) % allCustomers.length];
    const sub = subscriptionList[(i + 1) % subscriptionList.length];
    const amount = new Decimal(9999.0);
    const tax = amount.times(0.18);
    const total = amount.plus(tax);
    const overdueDays = 3 + (i * 2); // 5 to 33 days overdue

    const inv = await prisma.invoice.upsert({
      where: { id: `inv-overdue-${i}` },
      update: { dueDate: anchor(-overdueDays) },
      create: {
        id: `inv-overdue-${i}`,
        number: `INV-DEMO-${String(15 + i).padStart(3, '0')}`,
        subscriptionId: sub.id,
        customerId: cust.id,
        status: InvoiceStatus.CONFIRMED,
        periodStart: anchor(-overdueDays - 30),
        periodEnd: anchor(-overdueDays),
        issueDate: anchor(-overdueDays - 15),
        dueDate: anchor(-overdueDays), // OVERDUE
        sentAt: anchor(-overdueDays - 14),
        subtotal: amount,
        taxTotal: tax,
        discountTotal: new Decimal(0),
        total,
        amountPaid: new Decimal(0),
        amountDue: total,
      },
    });

    // For invoice #3, set taxRatePercent to 0% to trigger Leakage Condition 3 (WRONG_TAX)
    const isWrongTax = i === 3;
    await prisma.invoiceLine.upsert({
      where: { id: `invline-overdue-${i}` },
      update: {},
      create: {
        id: `invline-overdue-${i}`,
        invoiceId: inv.id,
        productId: 'prod-billing',
        description: 'Growth Plan License',
        quantity: 1,
        unitPrice: amount,
        lineSubtotal: amount,
        taxRatePercent: isWrongTax ? new Decimal(0.0) : new Decimal(18.0),
        taxAmount: isWrongTax ? new Decimal(0.0) : tax,
      },
    });

    allInvoices.push(inv);
  }

  // Ensure Acme Software has an overdue invoice to trigger Leakage Condition 5 (Credit Balance > 0 with Overdue Invoice)
  const acmeOverdueInv = await prisma.invoice.upsert({
    where: { id: 'inv-acme-overdue' },
    update: { dueDate: anchor(-10) },
    create: {
      id: 'inv-acme-overdue',
      number: 'INV-DEMO-031',
      subscriptionId: subscriptionList[0].id,
      customerId: acmeCustomer.id,
      status: InvoiceStatus.CONFIRMED,
      periodStart: anchor(-40),
      periodEnd: anchor(-10),
      issueDate: anchor(-25),
      dueDate: anchor(-10),
      sentAt: anchor(-24),
      subtotal: new Decimal(9999.0),
      taxTotal: new Decimal(1799.82),
      discountTotal: new Decimal(0),
      total: new Decimal(11798.82),
      amountPaid: new Decimal(0),
      amountDue: new Decimal(11798.82),
    },
  });
  allInvoices.push(acmeOverdueInv);

  // (c) 6 CONFIRMED Invoices due in next 7 days
  for (let i = 1; i <= 6; i++) {
    const cust = allCustomers[(i + 3) % allCustomers.length];
    const sub = subscriptionList[(i + 3) % subscriptionList.length];
    const amount = new Decimal(2999.0);
    const tax = amount.times(0.18);
    const total = amount.plus(tax);

    const inv = await prisma.invoice.upsert({
      where: { id: `inv-confirmed-soon-${i}` },
      update: {},
      create: {
        id: `inv-confirmed-soon-${i}`,
        number: `INV-DEMO-${String(31 + i).padStart(3, '0')}`,
        subscriptionId: sub.id,
        customerId: cust.id,
        status: InvoiceStatus.CONFIRMED,
        periodStart: anchor(-25),
        periodEnd: anchor(5),
        issueDate: anchor(-5),
        dueDate: anchor(i), // Due in 1 to 6 days
        sentAt: i <= 3 ? anchor(-4) : null, // sentAt is null for i > 3 -> Triggers UNSENT_INVOICE leakage!
        subtotal: amount,
        taxTotal: tax,
        discountTotal: new Decimal(0),
        total,
        amountPaid: new Decimal(0),
        amountDue: total,
      },
    });

    await prisma.invoiceLine.upsert({
      where: { id: `invline-confirmed-${i}` },
      update: {},
      create: {
        id: `invline-confirmed-${i}`,
        invoiceId: inv.id,
        productId: 'prod-billing',
        description: 'Starter Subscription',
        quantity: 1,
        unitPrice: amount,
        lineSubtotal: amount,
        taxRatePercent: new Decimal(18.0),
        taxAmount: tax,
      },
    });

    allInvoices.push(inv);
  }

  // (d) 4 DRAFT Invoices (including 1 stuck draft created 14 days ago)
  for (let i = 1; i <= 4; i++) {
    const cust = allCustomers[(i + 5) % allCustomers.length];
    const sub = subscriptionList[(i + 5) % subscriptionList.length];
    const isStuck = i === 1;
    const createdAt = isStuck ? anchor(-14) : anchor(-1);

    const inv = await prisma.invoice.upsert({
      where: { id: `inv-draft-${i}` },
      update: { createdAt },
      create: {
        id: `inv-draft-${i}`,
        number: `INV-DEMO-${String(37 + i).padStart(3, '0')}`,
        subscriptionId: sub.id,
        customerId: cust.id,
        status: InvoiceStatus.DRAFT,
        periodStart: anchor(-15),
        periodEnd: anchor(15),
        issueDate: createdAt,
        dueDate: anchor(15),
        createdAt,
        subtotal: new Decimal(2999.0),
        taxTotal: new Decimal(539.82),
        discountTotal: new Decimal(0),
        total: new Decimal(3538.82),
        amountPaid: new Decimal(0),
        amountDue: new Decimal(3538.82),
      },
    });
    allInvoices.push(inv);
  }

  // Apply expired discount to invoice to trigger Leakage Condition 2 (EXPIRED_DISCOUNT_APPLIED)
  await prisma.discountUsage.upsert({
    where: { id: 'disc-usage-leak-1' },
    update: {},
    create: {
      id: 'disc-usage-leak-1',
      discountId: 'disc-expired',
      invoiceId: allInvoices[0].id,
      amount: new Decimal(500.0),
      appliedAt: anchor(-2),
    },
  });

  // 8. Payment Rescue: 5 Failure Attempts
  console.log('Seeding Payment Rescue Cases...');
  const failureKinds = [
    FailureKind.EXPIRED_CARD,
    FailureKind.INSUFFICIENT_FUNDS,
    FailureKind.MANDATE_LIMIT,
    FailureKind.BANK_ERROR,
    FailureKind.GENERIC,
  ];

  for (let i = 0; i < failureKinds.length; i++) {
    await prisma.paymentAttempt.upsert({
      where: { id: `pay-attempt-fail-${i + 1}` },
      update: {},
      create: {
        id: `pay-attempt-fail-${i + 1}`,
        invoiceId: allInvoices[15 + i].id,
        attemptNo: 1,
        status: 'FAILED',
        failureKind: failureKinds[i],
        failureMessage: `Automated transaction failed due to ${failureKinds[i]}`,
        nextRetryAt: anchor(1),
        at: anchor(-1),
      },
    });
  }

  // 9. Mandates (8 mandates: 5 ACTIVE, 1 PAUSED, 1 REVOKED, 1 EXPIRED)
  console.log('Seeding Mandates...');
  const mandateStatuses = [
    MandateStatus.ACTIVE,
    MandateStatus.ACTIVE,
    MandateStatus.ACTIVE,
    MandateStatus.ACTIVE,
    MandateStatus.ACTIVE,
    MandateStatus.PAUSED,
    MandateStatus.REVOKED,
    MandateStatus.EXPIRED,
  ];

  for (let i = 0; i < mandateStatuses.length; i++) {
    await prisma.mandate.upsert({
      where: { id: `mandate-demo-${i + 1}` },
      update: {},
      create: {
        id: `mandate-demo-${i + 1}`,
        customerId: allCustomers[i % allCustomers.length].id,
        provider: 'RAZORPAY',
        providerMandateId: `man_razorpay_${i + 1}`,
        channel: 'UPI',
        maxAmount: new Decimal(50000.0),
        status: mandateStatuses[i],
        startsAt: anchor(-180),
        expiresAt: anchor(180),
      },
    });
  }

  // 10. Plan Change Requests (4 pending requests: 1 UPGRADE, 1 DOWNGRADE, 1 SEAT_CHANGE, 1 PAUSE)
  console.log('Seeding Plan Change Requests...');
  const planChangeKinds = [
    PlanChangeKind.UPGRADE,
    PlanChangeKind.DOWNGRADE,
    PlanChangeKind.SEAT_CHANGE,
    PlanChangeKind.PAUSE,
  ];

  for (let i = 0; i < planChangeKinds.length; i++) {
    await prisma.planChangeRequest.upsert({
      where: { id: `plan-change-demo-${i + 1}` },
      update: {},
      create: {
        id: `plan-change-demo-${i + 1}`,
        subscriptionId: subscriptionList[i].id,
        requestedById: 'usr-admin-alex',
        kind: planChangeKinds[i],
        status: PlanChangeStatus.REQUESTED,
        toPlanId: plans['plan-scale'].id,
        newQuantity: planChangeKinds[i] === PlanChangeKind.SEAT_CHANGE ? 10 : null,
        previewSnapshot: {
          currentPlan: 'Starter',
          newPlan: 'Scale',
          proratedDifference: '4500.00',
        },
      },
    });
  }

  // 11. MrrSnapshot (6 months leading up to current month)
  console.log('Seeding MRR Snapshots...');
  const mrrSeries = [
    { monthOffset: -5, mrr: 120000, newMrr: 120000, count: 15 },
    { monthOffset: -4, mrr: 180000, newMrr: 65000, count: 22 },
    { monthOffset: -3, mrr: 240000, newMrr: 70000, count: 30 },
    { monthOffset: -2, mrr: 310000, newMrr: 80000, count: 42 },
    { monthOffset: -1, mrr: 390000, newMrr: 95000, count: 55 },
    { monthOffset: 0, mrr: 480000, newMrr: 110000, count: 70 },
  ];

  for (const m of mrrSeries) {
    const monthDate = new Date(NOW.getFullYear(), NOW.getMonth() + m.monthOffset, 1);
    await prisma.mrrSnapshot.upsert({
      where: { month: monthDate },
      update: {},
      create: {
        month: monthDate,
        mrr: new Decimal(m.mrr),
        newMrr: new Decimal(m.newMrr),
        expansionMrr: new Decimal(25000),
        contractionMrr: new Decimal(10000),
        churnedMrr: new Decimal(15000),
        activeCount: m.count,
      },
    });
  }

  // 12. ForecastSnapshot (3 months: 0, +1, +2)
  console.log('Seeding Forecast Snapshots...');
  const forecastSeries = [
    { monthOffset: 0, rev: 520000, coll: 480000 },
    { monthOffset: 1, rev: 580000, coll: 540000 },
    { monthOffset: 2, rev: 650000, coll: 610000 },
  ];

  for (const f of forecastSeries) {
    const monthDate = new Date(NOW.getFullYear(), NOW.getMonth() + f.monthOffset, 1);
    await prisma.forecastSnapshot.upsert({
      where: { month_createdAt: { month: monthDate, createdAt: anchor(-1) } },
      update: {},
      create: {
        month: monthDate,
        expectedRevenue: new Decimal(f.rev),
        expectedCollections: new Decimal(f.coll),
        createdAt: anchor(-1),
        assumptions: {
          growthRate: '15%',
          churnRate: '3%',
          model: 'Holt-Winters Exponential Smoothing',
        },
      },
    });
  }

  // 13. Revenue Leakage Findings (6 distinct findings)
  console.log('Seeding Revenue Leakage Findings...');
  const leakageDefs = [
    { kind: LeakageFindingKind.NEVER_INVOICED, entity: 'Subscription', entityId: neverInvoicedSub.id, atRisk: 29999, detail: { reason: 'Active subscription with 0 invoices generated.' } },
    { kind: LeakageFindingKind.EXPIRED_DISCOUNT_APPLIED, entity: 'DiscountUsage', entityId: 'disc-usage-leak-1', atRisk: 500, detail: { reason: 'Expired discount WELCOME20 applied after endsAt date.' } },
    { kind: LeakageFindingKind.WRONG_TAX, entity: 'InvoiceLine', entityId: 'invline-overdue-3', atRisk: 1799.82, detail: { reason: 'Standard SaaS product invoiced at 0% tax instead of 18% GST.' } },
    { kind: LeakageFindingKind.EXPIRED_BUT_ACTIVE, entity: 'Subscription', entityId: expiredActiveSub.id, atRisk: 9999, detail: { reason: 'Subscription passed expiryDate without renewal or termination.' } },
    { kind: LeakageFindingKind.STUCK_DRAFT, entity: 'Invoice', entityId: 'inv-draft-1', atRisk: 3538.82, detail: { reason: 'Invoice in DRAFT state for over 14 days without confirmation.' } },
    { kind: LeakageFindingKind.UNSENT_INVOICE, entity: 'Invoice', entityId: 'inv-confirmed-soon-4', atRisk: 3538.82, detail: { reason: 'Confirmed invoice has not been delivered to customer.' } },
  ];

  for (const l of leakageDefs) {
    await prisma.leakageFinding.upsert({
      where: {
        kind_entity_entityId: {
          kind: l.kind,
          entity: l.entity,
          entityId: l.entityId,
        },
      },
      update: {},
      create: {
        kind: l.kind,
        entity: l.entity,
        entityId: l.entityId,
        amountAtRisk: new Decimal(l.atRisk),
        detail: l.detail,
      },
    });
  }

  console.log('\n======================================================');
  console.log(' BillPilot Demo Seed Completed Successfully!');
  console.log(' Cast Accounts (Password: Demo@12345!):');
  console.log('  - Admin:    admin@brightloop.test (Alex Chen)');
  console.log('  - Staff:    staff@brightloop.test (Samira Khan)');
  console.log('  - Finance:  finance@brightloop.test (David Park)');
  console.log('  - Customer: customer@acmesoftware.test (Priya Sharma)');
  console.log('======================================================\n');
}

// Standalone execution
if (require.main === module || process.argv[1]?.endsWith('seed-demo.ts')) {
  const p = new PrismaClient();
  seedDemo(p)
    .catch((err) => {
      console.error('Demo seeding failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await p.$disconnect();
    });
}
