# Person D: Insights, Comms & AI Tasks (TASKS_D.md)

**Branch**: `feat/insights-comms`
**Scope**: Notifications, WhatsApp Bot, Revenue Leakage Detector, MRR/ARR, AI Finance Assistant

---

### Hour 0-1: Contracts & Data Model
- [x] Review `d_insights.prisma` and view permissions for `billpilot_ro`.
- [x] Implement `INotificationService` interface contract skeleton.

### Hour 1-2: Notifications Engine & Outbound WhatsApp
- [x] Implement `NotificationService.send` writing to `NotificationLog` with deduplication.
- [x] Implement `@OnEvent('invoice.confirmed')` handler triggering WhatsApp delivery.
- [x] Connect Twilio WhatsApp SDK using environment credentials.
- [x] Implement outbound message templates: `invoice.confirmed`, `receipt.payment`, `reminder.due`.

### Hour 2-3: Inbound Two-Way WhatsApp Bot
- [x] Webhook `POST /api/v1/webhooks/twilio/whatsapp`:
  - Validate Twilio request signature.
  - Match caller phone number against verified `User.phone`.
  - Intent classification: `BALANCE`, `INVOICE`, `WHY_HIGHER`, `PAUSE`, `RENEW`, `CANCEL`, `HELP`.
  - Enforce confirmation reply ("Reply YES to confirm") for destructive actions (PAUSE, CANCEL).

### Hour 3-4: MRR/ARR Dashboard & Cash-Flow Forecast
- [x] Implement `monthlyValue(subscription)` normalization:
  - DAILY * 30, WEEKLY * 52/12, MONTHLY * 1, YEARLY / 12.
- [x] Calculate live MRR movements: New, Expansion, Contraction, Churned.
- [x] Nightly BullMQ cron writing `MrrSnapshot` and live Recharts trend visual.

### Hour 4-5: Revenue Leakage Detector
- [x] Leakage detection rules:
  - `NEVER_INVOICED`: Active subscriptions missing any invoice.
  - `EXPIRED_DISCOUNT_APPLIED`: Invoices created with expired discounts.
  - `WRONG_TAX`: Line tax not matching current product tax rule.
  - `EXPIRED_BUT_ACTIVE`: Subscriptions past expiryDate that haven't transitioned CLOSED.
  - `STUCK_DRAFT`: Draft invoices older than 3 days.
- [x] Calculate `amountAtRisk` and provide 1-click remediation actions calling respective modules via service contracts.

### Hour 5-6: AI Finance Assistant (Text-to-SQL) & NL Quotation
- [x] Implement AI Finance Assistant endpoint `POST /api/v1/ai/assistant`:
  - Connect via Anthropic Claude SDK with system prompt locked to `v_*` views.
  - Validate generated SQL: starts with SELECT or WITH, single statement, only references allowlisted views.
  - Execute using `DATABASE_URL_READONLY` with `statement_timeout = 3000ms` and `LIMIT 200`.
  - Format response: SQL snippet + table results + 1-line natural language summary.
- [x] Implement Natural Language to Quotation endpoint `POST /api/v1/ai/quote`:
  - Claude tool calling for customer/product/plan lookup.
  - Creates DRAFT subscription only.

### Hour 6-7: Integration & Demo Prep
- [x] Verify live phone receiving WhatsApp messages.
- [x] Rehearse 1:15 - 2:00 and 3:30 - 4:15 sections of demo script.

## Missing `data-tour` Target IDs
The following target IDs are referenced in tours (`packages/shared/src/tours.ts`) but belong to pages owned by Person A, B, or C:
- [ ] `create-plan-btn` (Person A: Plans page)
- [ ] `plan-form` (Person A: Plans page)
- [ ] `create-product-btn` (Person A: Products page)
- [ ] `sub-template-select` (Person A: Subscriptions page)
- [ ] `run-billing-btn` (Person B: Invoices page)
- [ ] `record-payment-btn` (Person C: Payments page)
- [ ] `dashboard-metrics` (Person A: Dashboard)
- [ ] `reconcile-table` (Person C: Reconcile page)
- [ ] `pay-invoice-btn` (Person C: Customer Portal Invoices)
- [ ] `change-plan-btn` (Person A: Customer Portal Subscriptions)

## Expense Table Status
- Currently, no dedicated `Expense` model exists in `prisma/schema`.
- `expense_summary` tool is configured to return:
  `{ available: false, reason: "Expense tracking table is not configured in this release." }`

## Mascot Animation Roadmap
- **Phase 1 (Current)**: Static lightweight CSS-only ball implementing states `idle | listening | thinking | talking | moving | pointing | happy | oops`.
- **Phase 2 (Future)**: Replace `Mascot.tsx` with Framer Motion animations, SVG artwork, and travel-to-target path coordinates. No changes needed to chat logic.
