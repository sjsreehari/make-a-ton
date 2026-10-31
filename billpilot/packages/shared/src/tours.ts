export interface TourStep {
  page: string;
  targetId: string;
  title: string;
  text: string;
}

export interface GuidedTour {
  id: string;
  title: string;
  description: string;
  steps: TourStep[];
}

export const TOURS: Record<string, GuidedTour> = {
  'create-plan': {
    id: 'create-plan',
    title: 'Create a Billing Plan',
    description: 'Learn how to define a recurring subscription plan',
    steps: [
      {
        page: '/plans',
        targetId: 'create-plan-btn',
        title: 'Open Plan Creator',
        text: 'Click here to start configuring a new subscription plan with specific pricing and cadence.',
      },
      {
        page: '/plans',
        targetId: 'plan-form',
        title: 'Configure Cadence & Terms',
        text: 'Specify billing interval (Monthly/Yearly), auto-close options, and base price for this plan.',
      },
    ],
  },

  'create-product-with-variant': {
    id: 'create-product-with-variant',
    title: 'Create Product with Variant',
    description: 'Add a sellable software/service item with custom attribute variations',
    steps: [
      {
        page: '/products',
        targetId: 'create-product-btn',
        title: 'Add New Product',
        text: 'Click here to add a new core product or add-on to your catalog.',
      },
    ],
  },

  'build-subscription-from-template': {
    id: 'build-subscription-from-template',
    title: 'Build Subscription from Template',
    description: 'Quickly generate a customer quotation using predefined line templates',
    steps: [
      {
        page: '/subscriptions',
        targetId: 'sub-template-select',
        title: 'Select Quotation Template',
        text: 'Choose a pre-built template to auto-populate product lines and default discount scopes.',
      },
    ],
  },

  'run-billing': {
    id: 'run-billing',
    title: 'Run Periodic Billing',
    description: 'Execute automated billing run to generate invoices for due subscriptions',
    steps: [
      {
        page: '/invoices',
        targetId: 'run-billing-btn',
        title: 'Execute Billing Run',
        text: 'Trigger billing calculation across all active subscriptions with pending billable periods.',
      },
    ],
  },

  'record-payment': {
    id: 'record-payment',
    title: 'Record Offline Payment',
    description: 'Log bank transfers, cheques, or cash received against open invoices',
    steps: [
      {
        page: '/payments',
        targetId: 'record-payment-btn',
        title: 'Record Payment',
        text: 'Enter the transaction amount, payment reference, and match it to open invoices.',
      },
    ],
  },

  'read-the-dashboard': {
    id: 'read-the-dashboard',
    title: 'Read the Dashboard',
    description: 'Overview of key performance metrics, MRR, and outstanding cash flow',
    steps: [
      {
        page: '/dashboard',
        targetId: 'dashboard-metrics',
        title: 'Primary Metrics',
        text: 'Review real-time MRR, active subscription count, and overdue receivables aging.',
      },
    ],
  },

  'use-reconciliation': {
    id: 'use-reconciliation',
    title: 'Reconciliation Workflow',
    description: 'Match bank transaction feeds with existing invoices and payment records',
    steps: [
      {
        page: '/reconcile',
        targetId: 'reconcile-table',
        title: 'Transaction Matches',
        text: 'Review confidence scores and approve or reject suggested bank statement matches.',
      },
    ],
  },

  'portal-pay-invoice': {
    id: 'portal-pay-invoice',
    title: 'Pay an Invoice',
    description: 'Customer walkthrough to view and pay an outstanding invoice',
    steps: [
      {
        page: '/my/invoices',
        targetId: 'pay-invoice-btn',
        title: 'Pay Online',
        text: 'Click here to pay securely via UPI, Card, or Netbanking using Razorpay.',
      },
    ],
  },

  'portal-change-plan': {
    id: 'portal-change-plan',
    title: 'Request Plan Change',
    description: 'Customer walkthrough to request subscription upgrades or downgrades',
    steps: [
      {
        page: '/my/subscriptions',
        targetId: 'change-plan-btn',
        title: 'Request Change',
        text: 'Submit a plan change request. Any proration adjustment will be computed automatically.',
      },
    ],
  },
};
