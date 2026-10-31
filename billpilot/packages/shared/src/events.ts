// Domain event names — exact strings used as BullMQ job names and EventEmitter2 events

export const DomainEvent = {
  SUBSCRIPTION_ACTIVATED: 'subscription.activated',
  SUBSCRIPTION_EXPIRING: 'subscription.expiring',
  SUBSCRIPTION_CLOSED: 'subscription.closed',
  INVOICE_GENERATED: 'invoice.generated',
  INVOICE_CONFIRMED: 'invoice.confirmed',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_OVERDUE: 'invoice.overdue',
  PAYMENT_RECORDED: 'payment.recorded',
  PAYMENT_FAILED: 'payment.failed',
  PLAN_CHANGE_REQUESTED: 'plan.change.requested',
  DISCOUNT_EXHAUSTED: 'discount.exhausted',
  BILLING_RUN_COMPLETED: 'billing.run.completed',
} as const;
export type DomainEvent = (typeof DomainEvent)[keyof typeof DomainEvent];

// Payload types

export interface InvoiceEvent {
  invoiceId: string;
  subscriptionId: string;
  customerId: string;
  number: string;
  total: string;
  dueDate: string;
}

export interface PaymentEvent {
  paymentId: string;
  invoiceId: string;
  customerId: string;
  amount: string;
  method: string;
}

export interface PaymentFailedEvent {
  invoiceId: string;
  customerId: string;
  attemptNo: number;
  failureKind: string;
  message: string;
}

export interface SubscriptionEvent {
  subscriptionId: string;
  customerId: string;
  number: string;
  expiryDate?: string;
}

export interface PlanChangeEvent {
  planChangeId: string;
  subscriptionId: string;
  kind: string;
}

export interface BillingRunEvent {
  created: number;
  skipped: number;
  failed: number;
  errors: string[];
}

export type DomainEventPayloadMap = {
  'subscription.activated': SubscriptionEvent;
  'subscription.expiring': SubscriptionEvent;
  'subscription.closed': SubscriptionEvent;
  'invoice.generated': InvoiceEvent;
  'invoice.confirmed': InvoiceEvent;
  'invoice.paid': InvoiceEvent;
  'invoice.overdue': InvoiceEvent;
  'payment.recorded': PaymentEvent;
  'payment.failed': PaymentFailedEvent;
  'plan.change.requested': PlanChangeEvent;
  'discount.exhausted': { discountId: string; code: string };
  'billing.run.completed': BillingRunEvent;
};
