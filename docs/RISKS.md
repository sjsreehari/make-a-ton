# Risks & Mitigations (RISKS.md)

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| **Twilio Sandbox Connectivity Issues** | WhatsApp delivery fails during live judging | Medium | Implement local fallback logger (`NotificationLog`) and mock gateway mode that displays inbound/outbound messages directly on screen. |
| **Anthropic Claude API Quota / Rate Limiting** | AI Finance Assistant fails during demo | Medium | Pre-compile allowlisted SQL query fallback templates for the top 5 demo queries. Query execution still runs against real database views. |
| **Razorpay Webhook Delivery Delays** | Invoice status doesn't flip to PAID on screen | Low | Provide a manual `"Sync Payment Status"` button on the invoice detail page that polls Razorpay API directly as backup. |
| **High Database Load on 5,000+ Subscriptions** | Response time slips past 2.0s threshold | Low | Database schema pre-indexed with composite B-tree indexes; dashboard aggregates cached in Redis with 60s TTL. |
| **Concurrent Discount Over-exhaustion** | Concurrent billing jobs exhaust usage limit | Low | Handled in PostgreSQL transaction with atomic conditional update: `UPDATE Discount SET usedCount = usedCount + 1 WHERE id = $1 AND (usageLimit IS NULL OR usedCount < usageLimit)`. |
| **Double Billing on Rapid Button Clicks** | Duplicate invoices issued to customers | Low | Enforced by compound database unique constraint on `(subscriptionId, periodStart, periodEnd)`. Second click safely catches unique constraint error and returns `{ skipped: true, reason: 'ALREADY_BILLED' }`. |
