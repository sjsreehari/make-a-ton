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
- [ ] Connect Twilio WhatsApp SDK using environment credentials.
- [ ] Implement outbound message templates: `invoice.confirmed`, `receipt.payment`, `reminder.due`.

### Hour 2-3: Inbound Two-Way WhatsApp Bot
- [ ] Webhook `POST /api/v1/webhooks/twilio/whatsapp`:
  - Validate Twilio request signature.
  - Match caller phone number against verified `User.phone`.
  - Intent classification: `BALANCE`, `INVOICE`, `WHY_HIGHER`, `PAUSE`, `RENEW`, `CANCEL`, `HELP`.
  - Enforce confirmation reply ("Reply YES to confirm") for destructive actions (PAUSE, CANCEL).

### Hour 3-4: MRR/ARR Dashboard & Cash-Flow Forecast
- [ ] Implement `monthlyValue(subscription)` normalization:
  - DAILY * 30, WEEKLY * 52/12, MONTHLY * 1, YEARLY / 12.
- [ ] Calculate live MRR movements: New, Expansion, Contraction, Churned.
- [ ] Nightly BullMQ cron writing `MrrSnapshot` and live Recharts trend visual.

### Hour 4-5: Revenue Leakage Detector
- [ ] Leakage detection rules:
  - `NEVER_INVOICED`: Active subscriptions missing any invoice.
  - `EXPIRED_DISCOUNT_APPLIED`: Invoices created with expired discounts.
  - `WRONG_TAX`: Line tax not matching current product tax rule.
  - `EXPIRED_BUT_ACTIVE`: Subscriptions past expiryDate that haven't transitioned CLOSED.
  - `STUCK_DRAFT`: Draft invoices older than 3 days.
- [ ] Calculate `amountAtRisk` and provide 1-click remediation actions calling respective modules via service contracts.

### Hour 5-6: AI Finance Assistant (Text-to-SQL) & NL Quotation
- [ ] Implement AI Finance Assistant endpoint `POST /api/v1/ai/assistant`:
  - Connect via Anthropic Claude SDK with system prompt locked to `v_*` views.
  - Validate generated SQL: starts with SELECT or WITH, single statement, only references allowlisted views.
  - Execute using `DATABASE_URL_READONLY` with `statement_timeout = 3000ms` and `LIMIT 200`.
  - Format response: SQL snippet + table results + 1-line natural language summary.
- [ ] Implement Natural Language to Quotation endpoint `POST /api/v1/ai/quote`:
  - Claude tool calling for customer/product/plan lookup.
  - Creates DRAFT subscription only.

### Hour 6-7: Integration & Demo Prep
- [ ] Verify live phone receiving WhatsApp messages.
- [ ] Rehearse 1:15 - 2:00 and 3:30 - 4:15 sections of demo script.
