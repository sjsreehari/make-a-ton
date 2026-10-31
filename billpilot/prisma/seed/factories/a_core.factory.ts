import { PrismaClient, Role, BillingPeriod, ProductType, SubscriptionStatus, PaymentTerm } from '@prisma/client';
import { hash } from 'argon2';
import Decimal from 'decimal.js';
import namesData from '../data/names.json';
import plansData from '../data/plans.json';
import productsData from '../data/products.json';

export async function seedCore(prisma: PrismaClient, scale: number) {
  console.log('Seeding A: Core (Users, Customers, Products, Plans, Subscriptions)...');

  // Tax rules
  const taxRules = await Promise.all([
    prisma.taxRule.upsert({
      where: { id: 'taxrule-gst-5' },
      update: {},
      create: { id: 'taxrule-gst-5', name: 'GST 5%', ratePercent: new Decimal('5.00'), isActive: true },
    }),
    prisma.taxRule.upsert({
      where: { id: 'taxrule-gst-12' },
      update: {},
      create: { id: 'taxrule-gst-12', name: 'GST 12%', ratePercent: new Decimal('12.00'), isActive: true },
    }),
    prisma.taxRule.upsert({
      where: { id: 'taxrule-gst-18' },
      update: {},
      create: { id: 'taxrule-gst-18', name: 'GST 18%', ratePercent: new Decimal('18.00'), isActive: true },
    }),
  ]);

  // Mandatory seed users
  const adminHash = await hash('Admin@12345!');
  const staffHash = await hash('Staff@12345!');
  const custHash = await hash('Cust@12345!');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@brightloop.test' },
    update: {},
    create: {
      email: 'admin@brightloop.test',
      passwordHash: adminHash,
      name: 'Admin User',
      role: Role.ADMIN,
      isActive: true,
      emailVerified: true,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@brightloop.test' },
    update: {},
    create: {
      email: 'staff@brightloop.test',
      passwordHash: staffHash,
      name: 'Staff User',
      role: Role.STAFF,
      isActive: true,
      emailVerified: true,
    },
  });

  const cust1 = await prisma.customer.upsert({
    where: { id: 'customer-seed-001' },
    update: {},
    create: {
      id: 'customer-seed-001',
      name: 'Acme Corp',
      email: 'cust1@brightloop.test',
      company: 'Acme Corp',
      currency: 'INR',
      creditBalance: new Decimal(0),
    },
  });

  await prisma.user.upsert({
    where: { email: 'cust1@brightloop.test' },
    update: {},
    create: {
      email: 'cust1@brightloop.test',
      passwordHash: custHash,
      name: 'Customer One',
      role: Role.CUSTOMER,
      isActive: true,
      emailVerified: true,
      customerId: cust1.id,
    },
  });

  // Plans
  const plans = [];
  for (const p of plansData) {
    const plan = await prisma.plan.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        name: p.name,
        price: new Decimal(p.price),
        billingPeriod: p.billingPeriod as BillingPeriod,
        minQuantity: p.minQuantity,
        autoClose: p.autoClose,
        closable: p.closable,
        pausable: p.pausable,
        renewable: p.renewable,
        isActive: p.isActive,
      },
    });
    plans.push(plan);
  }

  // Products and variants
  const products = [];
  for (const prod of productsData) {
    const product = await prisma.product.upsert({
      where: { id: prod.id },
      update: {},
      create: {
        id: prod.id,
        name: prod.name,
        type: prod.type as ProductType,
        salesPrice: new Decimal(prod.salesPrice),
        costPrice: new Decimal(prod.costPrice),
        taxRuleId: prod.taxRuleId,
        notes: prod.notes,
        isActive: true,
      },
    });
    products.push(product);

    for (const v of prod.variants) {
      await prisma.variant.upsert({
        where: {
          productId_attribute_value: {
            productId: product.id,
            attribute: v.attribute,
            value: v.value,
          },
        },
        update: {},
        create: {
          productId: product.id,
          attribute: v.attribute,
          value: v.value,
          extraPrice: new Decimal(v.extraPrice),
        },
      });
    }
  }

  // 50 Customers
  const customerList = [cust1];
  const customerBatch = [];
  for (let i = 2; i <= 50; i++) {
    const company = namesData[(i - 1) % namesData.length];
    customerBatch.push({
      id: `customer-seed-${String(i).padStart(3, '0')}`,
      name: `${company} Rep`,
      email: `customer${i}@brightloop.test`,
      company: company,
      currency: 'INR',
      creditBalance: new Decimal(0),
    });
  }
  await prisma.customer.createMany({ data: customerBatch, skipDuplicates: true });
  const allCustomers = await prisma.customer.findMany({ take: 50 });

  // Subscriptions (200 or scale)
  const statuses: SubscriptionStatus[] = [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.CONFIRMED,
    SubscriptionStatus.CLOSED,
    SubscriptionStatus.DRAFT,
  ];
  const terms: PaymentTerm[] = [PaymentTerm.NET_15, PaymentTerm.NET_30, PaymentTerm.IMMEDIATE];

  const now = new Date();
  const subBatch = [];
  for (let i = 0; i < scale; i++) {
    const cust = allCustomers[i % allCustomers.length];
    const plan = plans[i % plans.length];
    const status = statuses[i % statuses.length];
    const term = terms[i % terms.length];
    const startDate = new Date(now.getTime() - Math.floor(Math.random() * 90) * 86400000);
    const expiryDate = status === SubscriptionStatus.CLOSED
      ? new Date(startDate.getTime() + 30 * 86400000)
      : new Date(startDate.getTime() + 365 * 86400000);
    const nextBillingDate = status === SubscriptionStatus.ACTIVE ? new Date(now.getTime() + 15 * 86400000) : null;

    subBatch.push({
      id: `sub-seed-${String(i + 1).padStart(7, '0')}`,
      number: `SUB-2026-${String(i + 1).padStart(6, '0')}`,
      customerId: cust.id,
      planId: plan.id,
      status,
      startDate,
      expiryDate,
      nextBillingDate,
      paymentTerm: term,
      isPaused: false,
      createdAt: startDate,
      updatedAt: startDate,
    });
  }

  for (let i = 0; i < subBatch.length; i += 200) {
    await prisma.subscription.createMany({
      data: subBatch.slice(i, i + 200),
      skipDuplicates: true,
    });
  }

  // Subscription lines
  const lines = [];
  for (let i = 0; i < subBatch.length; i++) {
    const sub = subBatch[i];
    const product = products[i % products.length];
    const qty = (i % 3) + 1;
    const unitPrice = product.salesPrice;
    lines.push({
      id: `subline-seed-${String(i + 1).padStart(7, '0')}`,
      subscriptionId: sub.id,
      productId: product.id,
      description: product.name,
      quantity: qty,
      unitPrice,
      taxRuleId: taxRules[2].id, // 18%
      amount: new Decimal(unitPrice).times(qty),
    });
  }

  for (let i = 0; i < lines.length; i += 500) {
    await prisma.subscriptionLine.createMany({
      data: lines.slice(i, i + 500),
      skipDuplicates: true,
    });
  }

  return { admin, staff, customers: allCustomers, plans, products, subscriptions: subBatch };
}

