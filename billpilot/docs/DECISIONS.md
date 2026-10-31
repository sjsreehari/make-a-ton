# Architectural & Technical Decisions (DECISIONS.md)

This log documents explicit architectural choices made to avoid ambiguity during the hackathon sprint.

## ADR 001: Subscription Pausing Implementation
- **Decision**: Pausing is not a distinct enum status on `SubscriptionStatus`. Instead, `status` remains `ACTIVE` with `isPaused = true` and `pausedAt = DateTime`.
- **Reasoning**: A paused subscription is still under an active contractual commitment. Introducing PAUSED as a top-level state would complicate status queries for active customers, churn calculations, and transitions.

## ADR 002: Monetary Calculation Engine
- **Decision**: All money is represented using PostgreSQL `Decimal(14,2)` and manipulated exclusively via `decimal.js` on backend and client formatting helpers. JavaScript `number` (floats) is strictly forbidden for money.
- **Reasoning**: Floating-point rounding errors cause discrepancies in invoices, tax calculations, and partial payment settlements.

## ADR 003: AI Assistant Database Isolation
- **Decision**: The AI Finance Assistant connects exclusively to `DATABASE_URL_READONLY` using the `billpilot_ro` role, which has SELECT permissions ONLY on allowlisted views (`v_invoices`, `v_subscriptions`, `v_payments`, `v_customers`, `v_mrr_monthly`).
- **Reasoning**: Prevents accidental data modification or SQL injection from exfiltrating hashed passwords or customer PII.

## ADR 004: Invoice Generation Idempotency
- **Decision**: Idempotency is enforced by a database compound unique constraint on `(subscriptionId, periodStart, periodEnd)`, combined with pessimistic row-locking (`SELECT FOR UPDATE`) within a single serializable transaction.
- **Reasoning**: Guarantees zero duplicate invoices even under concurrent cron triggers and manual staff "Run billing" clicks.

## ADR 005: Shared Schema Single Source of Truth
- **Decision**: All validation rules (such as password strength and signup requirements) are defined as Zod schemas in `@billpilot/shared` and imported by both the NestJS API and Next.js frontend.
- **Reasoning**: Ensures client-side validation and server-side validation are always in 100% agreement without duplicated logic.
