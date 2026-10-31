# Person B: Billing & Invoicing Engineering Tasks (TASKS_B.md)

**Branch**: `feat/billing`
**Scope**: Invoicing, Tax calculation, Discounts engine, Proration, Disputes

---

### Hour 0-1: Contracts & Data Model
- [x] Review `b_billing.prisma` schema and unique constraints.
- [x] Implement `IInvoiceService` interface contract skeleton.

### Hour 1-2: Tax Rules & Automatic Calculation
- [x] Tax rules CRUD: name, ratePercent, region, inclusive/exclusive flag.
- [ ] Implement line-item tax computation logic:
  - Exclusive: `taxAmount = lineSubtotal * (rate / 100)`
  - Inclusive: `taxAmount = lineSubtotal - (lineSubtotal / (1 + rate / 100))`
  - Half-up rounding to 2 decimal places per line.

### Hour 2-3: Concurrency-Safe Discount Engine
- [x] Discount management: FIXED vs PERCENTAGE, PRODUCT vs SUBSCRIPTION scope.
- [ ] Atomic conditional usage decrement inside transaction:
  `UPDATE Discount SET usedCount = usedCount + 1 WHERE id = $1 AND (usageLimit IS NULL OR usedCount < usageLimit)`
- [ ] Margin-aware rule check: reject discount if margin drops below plan threshold.

### Hour 3-4: Invoice Auto-Generation & Bulk Run
- [ ] Implement `IInvoiceService.generateFromSubscription` within single serializable transaction:
  1. Pessimistic lock `Subscription` FOR UPDATE.
  2. Skip if not ACTIVE, paused, or nextBillingDate > asOf.
  3. Validate unique `(subscriptionId, periodStart, periodEnd)` — catch P2002 as `{ skipped: true, reason: 'ALREADY_BILLED' }`.
  4. Generate lines + tax + discounts + explainer JSON snapshot.
  5. Advance `nextBillingDate` and close if expired with `autoClose=true`.
  6. Emit `invoice.generated`.
- [ ] Bulk run endpoint `POST /api/v1/invoices/run-billing`:
  - Process batches of 200 subscriptions.
  - Return `{ created: count, skipped: count, failed: count, errors: [] }`.
- [ ] Unskip and pass `idempotency.e2e-spec.ts`.

### Hour 4-5: Invoice Actions, PDF & Explainer
- [ ] Invoice state machine: `DRAFT -> CONFIRMED -> PAID`, `CANCELLED`.
- [ ] Generate printable GST-compliant PDF via `pdfkit` (invoice details, QR code, bank details).
- [ ] Build `"Why is my bill Rs X?"` explainer stepper UI based on stored invoice explainer JSON.
- [ ] Implement Dispute creation flow and auto-bundled evidence packet.

### Hour 5-6: Proration Preview & Self-Service Changes
- [ ] Implement pure proration preview calculation:
  - `unusedCredit = oldDailyRate * remainingDays`
  - `newCharge = newDailyRate * remainingDays`
  - `net = newCharge - unusedCredit` (rounded 2dp)
- [ ] Store `previewSnapshot` on `PlanChangeRequest`.
- [ ] Billing Dry Run preview endpoint with anomaly detection flags (jump > 30%, zero total).

### Hour 6-7: Integration & Demo Prep
- [ ] Verify double-click billing demo with Person A.
- [ ] Rehearse 0:30 - 1:15 section of demo script.
