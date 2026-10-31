import type { SubscriptionStatus, PaymentMethod } from './enums.js';

// Actor type used across service contracts
export interface Actor {
  id: string;
  role: string;
  customerId?: string;
}

// DTO shapes (minimal; owners add fields)
export interface InvoiceDTO {
  id: string;
  number: string;
  subscriptionId: string;
  customerId: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  total: string;
  amountDue: string;
  dueDate: string;
}

export interface BillingRunSummary {
  created: number;
  skipped: number;
  failed: number;
  errors: string[];
  dryRun: boolean;
}

export interface PaymentDTO {
  id: string;
  invoiceId: string;
  customerId: string;
  method: string;
  amount: string;
  paidAt: string;
  status: string;
}

export interface SubscriptionDTO {
  id: string;
  number: string;
  customerId: string;
  planId: string;
  status: string;
  startDate: string;
  isPaused: boolean;
  nextBillingDate?: string;
}

// Service contracts — stubs implement these, owners fill in
export interface IInvoiceService {
  generateFromSubscription(
    subId: string,
    period: { start: Date; end: Date },
    opts?: { dryRun?: boolean; idempotencyKey?: string },
  ): Promise<InvoiceDTO | { skipped: true; reason: string }>;

  runBilling(asOf: Date, opts?: { dryRun?: boolean }): Promise<BillingRunSummary>;

  confirm(id: string): Promise<InvoiceDTO>;
  cancel(id: string, reason: string): Promise<InvoiceDTO>;
  send(id: string): Promise<void>;
  renderPdf(id: string): Promise<Buffer>;
  markPaidIfSettled(id: string): Promise<void>;
}

export interface IPaymentService {
  record(input: {
    invoiceId: string;
    method: PaymentMethod;
    amount: string;
    date: Date;
    note?: string;
    externalRef?: string;
    recordedById?: string;
  }): Promise<PaymentDTO>;
  listForInvoice(invoiceId: string): Promise<PaymentDTO[]>;
  outstanding(customerId?: string): Promise<{ totalDue: string; overdueCount: number }>;
}

export interface INotificationService {
  send(input: {
    channel: 'WHATSAPP' | 'EMAIL';
    template: string;
    to: string;
    data: Record<string, unknown>;
    dedupeKey?: string;
    customerId?: string;
  }): Promise<{ queued: boolean; logId: string }>;
}

export interface ISubscriptionService {
  transition(
    id: string,
    status: SubscriptionStatus,
    actor: Actor,
    reason?: string,
  ): Promise<SubscriptionDTO>;
  pause(id: string, actor: Actor): Promise<SubscriptionDTO>;
  resume(id: string, actor: Actor): Promise<SubscriptionDTO>;
  earlyClose(id: string, actor: Actor, reason: string): Promise<SubscriptionDTO>;
  renew(id: string, actor: Actor): Promise<SubscriptionDTO>;
  getBillable(
    asOf: Date,
    limit: number,
    cursor?: string,
  ): Promise<{ items: SubscriptionDTO[]; nextCursor?: string }>;
}

export interface IAuditService {
  log(entry: {
    actor?: Actor;
    entity: string;
    entityId: string;
    action: string;
    before?: unknown;
    after?: unknown;
    requestId?: string;
  }): Promise<void>;
}
