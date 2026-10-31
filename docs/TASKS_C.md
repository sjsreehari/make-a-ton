# Person C: Payments & Reconciliation Engineering Tasks (TASKS_C.md)

**Branch**: `feat/payments`
**Scope**: Payments, Razorpay, Webhook Replay Safety, Bank Reconciliation, Payment Rescue, Mandates

---

### Hour 0-1: Contracts & Data Model
- [x] Review `c_payments.prisma` and relationships with Invoice.
- [x] Implement `IPaymentService` interface contract skeleton.

### Hour 1-2: Core Payment Recording
- [x] Implement `PaymentService.record`:
  - Lock invoice row FOR UPDATE.
  - Reject if DRAFT or CANCELLED.
  - Apply `min(amount, amountDue)` to invoice balance.
  - Credit remainder to `Customer.creditBalance`.
  - Flip status to PAID if `amountDue == 0`.
  - Emit `payment.recorded` and `invoice.paid`.
  - Idempotent on unique `externalRef`.

### Hour 2-3: Razorpay Payment Links & Webhook
- [ ] Implement Razorpay link generation (`POST /api/v1/paylinks`):
  - Generate Razorpay payment link with invoice metadata and shortUrl.
  - Store in `PaymentLink` table.
- [ ] Public Webhook handler `POST /api/v1/webhooks/razorpay`:
  - Verify `X-Razorpay-Signature` using raw body and timing-safe compare.
  - Save `WebhookEvent(id)` to ledger first (ignore on duplicate key).
  - Handle `payment_link.paid` and call `PaymentService.record`.

### Hour 3-4: Payment Rescue Engine
- [ ] Failure classification: `EXPIRED_CARD`, `INSUFFICIENT_FUNDS`, `MANDATE_LIMIT`, `BANK_ERROR`, `GENERIC`.
- [ ] Retry scheduler: BullMQ delayed jobs for `INSUFFICIENT_FUNDS` (24h/72h) and `BANK_ERROR` (1h).
- [ ] Create manual `"Fail this payment"` demo button and calculate `"Rs recovered"` live counter.

### Hour 4-5: Bank Statement Reconciliation
- [ ] CSV upload endpoint `POST /api/v1/reconcile/upload`.
- [ ] Fuzzy matching algorithm:
  - `score = 0.5 * amountMatch + 0.3 * refContainsInv + 0.2 * nameSimilarity`
  - Net-of-fee detection: if variance between 0.5% and 3%, record `feeDetected`.
  - Score >= 0.9 -> Auto-match and record payment.
  - Score 0.6 - 0.9 -> Route to Review Queue.
- [ ] Reconciliation review UI with one-click match/reject buttons.

### Hour 5-6: e-Mandates & Dunning
- [ ] Mandate registration and pre-billing limit verification.
- [ ] Dunning schedule escalation steps: D-3, D0, D+3, D+7, D+15 auto-pause.
- [ ] Voluntary vs involuntary churn categorization on closed subscriptions.

### Hour 6-7: Integration & Demo Prep
- [ ] Test live Razorpay test payment and webhook transition.
- [ ] Rehearse 2:00 - 3:30 section of demo script.
