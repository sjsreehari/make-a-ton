// Mirrors Prisma enums. Frontend uses these; never imports @prisma/client.

export const Role = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const ProductType = {
  SOFTWARE: 'SOFTWARE',
  SERVICE: 'SERVICE',
  ADDON: 'ADDON',
  SUPPORT: 'SUPPORT',
} as const;
export type ProductType = (typeof ProductType)[keyof typeof ProductType];

export const BillingPeriod = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
} as const;
export type BillingPeriod = (typeof BillingPeriod)[keyof typeof BillingPeriod];

export const SubscriptionStatus = {
  DRAFT: 'DRAFT',
  QUOTATION: 'QUOTATION',
  CONFIRMED: 'CONFIRMED',
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
} as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const PaymentTerm = {
  IMMEDIATE: 'IMMEDIATE',
  NET_7: 'NET_7',
  NET_15: 'NET_15',
  NET_30: 'NET_30',
  NET_60: 'NET_60',
} as const;
export type PaymentTerm = (typeof PaymentTerm)[keyof typeof PaymentTerm];

export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const DiscountType = {
  FIXED: 'FIXED',
  PERCENTAGE: 'PERCENTAGE',
} as const;
export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

export const DiscountScope = {
  PRODUCT: 'PRODUCT',
  SUBSCRIPTION: 'SUBSCRIPTION',
} as const;
export type DiscountScope = (typeof DiscountScope)[keyof typeof DiscountScope];

export const PaymentMethod = {
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  UPI: 'UPI',
  CARD: 'CARD',
  CHEQUE: 'CHEQUE',
  RAZORPAY: 'RAZORPAY',
  OTHER: 'OTHER',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
  RECORDED: 'RECORDED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const Channel = {
  WHATSAPP: 'WHATSAPP',
  EMAIL: 'EMAIL',
} as const;
export type Channel = (typeof Channel)[keyof typeof Channel];

export const NotificationStatus = {
  QUEUED: 'QUEUED',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  SKIPPED: 'SKIPPED',
} as const;
export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus];

export const FindingKind = {
  NEVER_INVOICED: 'NEVER_INVOICED',
  EXPIRED_DISCOUNT_APPLIED: 'EXPIRED_DISCOUNT_APPLIED',
  WRONG_TAX: 'WRONG_TAX',
  EXPIRED_BUT_ACTIVE: 'EXPIRED_BUT_ACTIVE',
  STUCK_DRAFT: 'STUCK_DRAFT',
  UNSENT_INVOICE: 'UNSENT_INVOICE',
} as const;
export type FindingKind = (typeof FindingKind)[keyof typeof FindingKind];

export const RiskBand = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;
export type RiskBand = (typeof RiskBand)[keyof typeof RiskBand];

export const PlanChangeKind = {
  UPGRADE: 'UPGRADE',
  DOWNGRADE: 'DOWNGRADE',
  SEAT_CHANGE: 'SEAT_CHANGE',
  PAUSE: 'PAUSE',
  RESUME: 'RESUME',
  CANCEL: 'CANCEL',
} as const;
export type PlanChangeKind = (typeof PlanChangeKind)[keyof typeof PlanChangeKind];

export const FailureKind = {
  EXPIRED_CARD: 'EXPIRED_CARD',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  MANDATE_LIMIT: 'MANDATE_LIMIT',
  BANK_ERROR: 'BANK_ERROR',
  GENERIC: 'GENERIC',
} as const;
export type FailureKind = (typeof FailureKind)[keyof typeof FailureKind];

export const MatchStatus = {
  AUTO_MATCHED: 'AUTO_MATCHED',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
  UNMATCHED: 'UNMATCHED',
} as const;
export type MatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus];

export const DisputeStatus = {
  OPEN: 'OPEN',
  UNDER_REVIEW: 'UNDER_REVIEW',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
} as const;
export type DisputeStatus = (typeof DisputeStatus)[keyof typeof DisputeStatus];

export const MandateStatus = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  REVOKED: 'REVOKED',
  EXPIRED: 'EXPIRED',
} as const;
export type MandateStatus = (typeof MandateStatus)[keyof typeof MandateStatus];

export const PaymentLinkStatus = {
  CREATED: 'CREATED',
  SENT: 'SENT',
  PAID: 'PAID',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;
export type PaymentLinkStatus = (typeof PaymentLinkStatus)[keyof typeof PaymentLinkStatus];
