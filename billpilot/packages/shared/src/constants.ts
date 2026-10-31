export const MAX_PAGINATION_LIMIT = 100;
export const DEFAULT_PAGINATION_LIMIT = 20;
export const SUBSCRIPTION_NUMBER_PREFIX = 'SUB';
export const INVOICE_NUMBER_PREFIX = 'INV';
export const CREDIT_MEMO_PREFIX = 'CM';
export const ACCESS_TOKEN_COOKIE = 'bp_refresh';
export const DOMAIN_EVENTS_QUEUE = 'domain-events';
export const BILLING_JOB_QUEUE = 'billing';
export const RESCUE_JOB_QUEUE = 'rescue';
export const DUNNING_JOB_QUEUE = 'dunning';
export const RECONCILE_JOB_QUEUE = 'reconcile';
export const DEFAULT_CURRENCY = 'INR';
export const MAX_AI_QUERY_RESULTS = 200;
export const AI_STATEMENT_TIMEOUT_MS = 3000;
export const RESET_TOKEN_EXPIRES_MINUTES = 30;
export const PRORATION_ROUNDING_SCALE = 2;
export const PAYMENT_TERM_DAYS: Record<string, number> = {
  IMMEDIATE: 0,
  NET_7: 7,
  NET_15: 15,
  NET_30: 30,
  NET_60: 60,
};
