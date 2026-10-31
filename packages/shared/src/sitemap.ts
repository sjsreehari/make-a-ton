import { Role } from './enums.js';

export interface SitemapFilter {
  key: string;
  values: string[];
}

export interface SitemapTarget {
  id: string;
  label: string;
  description: string;
}

export interface SitemapEntry {
  id: string;
  path: string;
  title: string;
  description: string;
  roles: Role[];
  filters?: SitemapFilter[];
  targets?: SitemapTarget[];
  tours?: string[];
}

export const SITEMAP: SitemapEntry[] = [
  // Staff Pages
  {
    id: 'staff-dashboard',
    path: '/dashboard',
    title: 'Dashboard',
    description: 'Executive overview of revenue, subscriptions, and billing health',
    roles: [Role.ADMIN, Role.STAFF],
    targets: [{ id: 'dashboard-metrics', label: 'Key Metrics', description: 'Real-time revenue & subscription counters' }],
    tours: ['read-the-dashboard'],
  },
  {
    id: 'staff-invoices',
    path: '/invoices',
    title: 'Invoices',
    description: 'Manage, confirm, send, and monitor invoices and overdue receivables',
    roles: [Role.ADMIN, Role.STAFF],
    filters: [
      { key: 'status', values: ['DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED', 'OVERDUE'] },
    ],
    targets: [{ id: 'run-billing-btn', label: 'Run Billing', description: 'Trigger automatic billing run' }],
    tours: ['run-billing'],
  },
  {
    id: 'staff-subscriptions',
    path: '/subscriptions',
    title: 'Subscriptions',
    description: 'Customer subscription lifecycle, active plans, and billing schedules',
    roles: [Role.ADMIN, Role.STAFF],
    filters: [{ key: 'status', values: ['DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'CLOSED'] }],
    targets: [{ id: 'sub-template-select', label: 'Template Selector', description: 'Choose quotation template' }],
    tours: ['build-subscription-from-template'],
  },
  {
    id: 'staff-plans',
    path: '/plans',
    title: 'Plans',
    description: 'Configure recurring pricing plans and billing cadences',
    roles: [Role.ADMIN, Role.STAFF],
    targets: [
      { id: 'create-plan-btn', label: 'Create Plan', description: 'Open plan creation dialog' },
      { id: 'plan-form', label: 'Plan Details', description: 'Plan pricing and cadence parameters' },
    ],
    tours: ['create-plan'],
  },
  {
    id: 'staff-products',
    path: '/products',
    title: 'Products & Catalog',
    description: 'Manage sellable items, services, add-ons, and pricing variants',
    roles: [Role.ADMIN, Role.STAFF],
    targets: [{ id: 'create-product-btn', label: 'Create Product', description: 'Add new product or variant' }],
    tours: ['create-product-with-variant'],
  },
  {
    id: 'staff-payments',
    path: '/payments',
    title: 'Payments',
    description: 'Record incoming offline payments, view Razorpay transactions, and payment statuses',
    roles: [Role.ADMIN, Role.STAFF],
    targets: [{ id: 'record-payment-btn', label: 'Record Payment', description: 'Manually record offline payment' }],
    tours: ['record-payment'],
  },
  {
    id: 'staff-reconcile',
    path: '/reconcile',
    title: 'Bank Reconciliation',
    description: 'Match bank transactions against recorded invoices and payments',
    roles: [Role.ADMIN, Role.STAFF],
    targets: [{ id: 'reconcile-table', label: 'Match Table', description: 'Transaction reconciliation interface' }],
    tours: ['use-reconciliation'],
  },
  {
    id: 'staff-mrr',
    path: '/mrr',
    title: 'MRR & Analytics',
    description: 'Monthly recurring revenue breakdowns, expansion, churn, and forecasts',
    roles: [Role.ADMIN, Role.STAFF],
  },
  {
    id: 'staff-assistant',
    path: '/assistant',
    title: 'Loop AI Assistant',
    description: 'Interactive natural-language queries, data exploration, and automated tours',
    roles: [Role.ADMIN, Role.STAFF],
  },
  {
    id: 'staff-audit-log',
    path: '/audit-log',
    title: 'Audit Log',
    description: 'Security and change history for all system entities',
    roles: [Role.ADMIN],
  },

  // Customer Portal Pages
  {
    id: 'portal-invoices',
    path: '/my/invoices',
    title: 'My Invoices',
    description: 'View billing history, download receipts, and pay outstanding balances',
    roles: [Role.CUSTOMER],
    targets: [{ id: 'pay-invoice-btn', label: 'Pay Now', description: 'Pay invoice via instant payment link' }],
    tours: ['portal-pay-invoice'],
  },
  {
    id: 'portal-subscriptions',
    path: '/my/subscriptions',
    title: 'My Subscriptions',
    description: 'Manage active subscriptions, view renewal dates, or change plans',
    roles: [Role.CUSTOMER],
    targets: [{ id: 'change-plan-btn', label: 'Change Plan', description: 'Request plan upgrade or downgrade' }],
    tours: ['portal-change-plan'],
  },
  {
    id: 'portal-payments',
    path: '/my/payments',
    title: 'My Payments',
    description: 'Payment receipts and transaction history',
    roles: [Role.CUSTOMER],
  },
  {
    id: 'portal-savings',
    path: '/my/savings',
    title: 'My Savings',
    description: 'Discount utilization and accumulated savings',
    roles: [Role.CUSTOMER],
  },
];

