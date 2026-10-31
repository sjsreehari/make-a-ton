# SmartBill
**"We removed every manual step in the billing month."**

BillPilot is a Subscription Management System for the fictional company **Brightloop Software**. It covers the full recurring-revenue lifecycle in one platform:

```
sign-up -> products/plans -> quotes -> subscriptions -> invoices -> payments -> reporting
```

Built for a 7-hour hackathon by four teammates working in parallel on four branches.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Repository Layout](#repository-layout)
4. [Quick Start](#quick-start)
5. [Environment Variables](#environment-variables)
6. [Seeded Accounts](#seeded-accounts)
7. [Scripts](#scripts)
8. [API Overview](#api-overview)
9. [Roles and Access](#roles-and-access)
10. [Team, Branches and Ownership](#team-branches-and-ownership)
11. [Integrations Setup](#integrations-setup)
12. [Testing](#testing)
13. [Performance](#performance)
14. [Docs Index](#docs-index)
15. [Troubleshooting](#troubleshooting)

---

## Features

### Core (mandatory)
- **Auth and RBAC**: sign-up with strong password rules (length >= 9, upper, lower, special), forgot-password via email link (30 min, single use), roles ADMIN / STAFF / CUSTOMER.
- **Catalog**: products, variants (e.g. brand = Odoo adds 560), plans with billing period, min quantity, availability window, and switches (autoClose, closable, pausable, renewable).
- **Quotation templates and subscriptions**: numbered `SUB-2026-000001`, state machine `DRAFT -> QUOTATION -> CONFIRMED -> ACTIVE -> CLOSED` (pause is a flag on ACTIVE).
- **Invoicing**: auto-generation, bulk billing run (BullMQ + manual button), automatic tax, confirm / cancel / send / print PDF. **Idempotent**: no duplicate or skipped billing.
- **Discounts** (admin only): fixed or percentage, minimums, date windows, concurrency-safe usage limits.
- **Payments**: record method/amount/date/note, partial payments, overpayment becomes customer credit, overdue flags.
- **Reporting dashboard**: active subscriptions, revenue collected, amount owed, overdue; filters; Redis-cached; fast with 5,000+ subscriptions.

### Win features
| Tier | Features |
|------|----------|
| 1 (must ship) | WhatsApp invoices/reminders/receipts, Razorpay payment link + signed webhook auto-marking Paid, MRR/ARR dashboard, audit log, 5,000+ seeded subscriptions with load-time badge |
| 2 (wow) | AI Finance Assistant (read-only text-to-SQL), Natural Language to Quotation, Revenue Leakage Detector, Payment Rescue Engine, bank reconciliation with fuzzy matching, "Why is my bill X?" explainer, proration preview |
| 3 (polish) | Dunning + auto-pause, churn-risk score, cash-flow forecast, Customer Savings Advisor, margin-aware discounts, billing dry run, GST-ready invoice, multi-currency, template editor, CSV/PDF exports, dark mode |

If time slips, Tier 3 is cut first, then Tier 2. Never Tier 1 or the core requirements.

---
## Repository Layout

```
billpilot/
  apps/
    api/            NestJS API (port 4000)
    web/            Next.js app (port 3000)
  packages/
    shared/         zod schemas, enums, events, contracts, error codes
    config/         shared eslint / ts presets
  prisma/
    schema/         base + a_core + b_billing + c_payments + d_insights
    migrations/
    seed/           orchestrator, factories, data
  docker/postgres/  init.sql (read-only role for the AI assistant)
  docs/             architecture, decisions, conventions, events, demo, risks, tasks
  docker-compose.yml
  PROJECT.txt
  CODEOWNERS
```

---

## Quick Start

**Prerequisites:** Node 20 (`nvm use`), pnpm, Docker.

```bash
# 1. Clone
git clone <repo-url> billpilot && cd billpilot

# 2. Environment
cp .env.example .env
#    Fill in JWT_ACCESS_SECRET and JWT_REFRESH_SECRET at minimum.
#    Twilio / Razorpay / Anthropic keys are optional until you work on those features.

# 3. Infrastructure (Postgres, Redis, Mailhog)
docker compose up -d

# 4. Install dependencies
pnpm i

# 5. Database
pnpm db:migrate
pnpm db:seed

# 6. Run everything
pnpm dev
```

Then open:

| Service | URL |
|---------|-----|
| Web app | http://localhost:3000 |
| API | http://localhost:4000/api/v1 |
| Swagger docs | http://localhost:4000/api/docs |
| Health check | http://localhost:4000/api/v1/health |
| Mailhog (emails) | http://localhost:8025 |

### Large dataset (performance demo)

```bash
pnpm db:seed --scale=5000     # 5,000+ subscriptions and ~60k invoices
```

---

## Environment Variables

Copy `.env.example` to `.env`. Key variables:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Main Postgres connection |
| `DATABASE_URL_READONLY` | Read-only role used by the AI assistant (views only) |
| `REDIS_URL` | Redis connection |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Token signing secrets |
| `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL` | `15m` / `7d` |
| `APP_URL`, `API_URL` | Web and API base URLs |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` | Mailhog SMTP |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `TWILIO_WEBHOOK_BASE_URL` | WhatsApp |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Payments |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | AI features |
| `BILLING_CRON`, `OVERDUE_CRON` | Scheduled jobs |
| `DEFAULT_CURRENCY`, `COMPANY_NAME`, `COMPANY_GSTIN` | Invoice defaults |

---

## Seeded Accounts

| Role | Email | Password |
|------|-------|----------|
| ADMIN | `admin@brightloop.test` | `Admin@12345!` |
| STAFF | `staff@brightloop.test` | `Staff@12345!` |
| CUSTOMER | `cust1@brightloop.test` | `Cust@12345!` |

Default seed: 3 users, 6 plans, 12 products with variants (including brand=Odoo +560), 3 tax rules (GST 5/12/18), 50 customers, 200 subscriptions in mixed statuses.

---

---

## API Overview

Base path: `/api/v1`. JSON only. Dates are ISO-8601 UTC. Money is a string with 2 decimals.

- **Pagination:** `?page=1&limit=20` (max 100) returns `{ data, meta: { page, limit, total, totalPages } }`. Keyset `?cursor=` on large tables.
- **Sorting / filtering:** `?sort=createdAt:desc&status=ACTIVE&from=&to=`
- **Errors:** `{ "error": { "code", "message", "details", "requestId" } }`
- **Auth:** Bearer JWT with claims `{ sub, role, customerId?, email }`. Deny by default; `@Public()` opts out.
- **Headers:** every response carries `X-Request-Id` and `X-Response-Time`.
- **Idempotency:** `Idempotency-Key` supported on `POST /invoices/run-billing` and `POST /payments`.
- **Rate limit:** auth endpoints 10/min per IP.

Hello-flow endpoints available out of the box:

```
POST /api/v1/auth/signup
POST /api/v1/auth/login
GET  /api/v1/auth/me
GET  /api/v1/health
GET  /api/v1/plans
GET  /api/v1/admin/ping        (ADMIN only)
POST /api/v1/dev/emit-test     (emits invoice.confirmed)
```

Full conventions: [`docs/API_CONVENTIONS.md`](docs/API_CONVENTIONS.md).

---

## Roles and Access

| Feature | ADMIN | STAFF | CUSTOMER |
|---------|:-----:|:-----:|:--------:|
| Users / staff management | W | - | - |
| Products / Plans | W | R | R (public plans) |
| Tax rules | W | R | - |
| Discounts | W | R | - |
| Quotation templates | W | W | - |
| Subscriptions | W | W | R (own) |
| Invoices | W | W | R (own) |
| Payments | W | W | R (own) |
| Dashboard / Reports | W | R | - |
| Audit log | R | - | - |
| AI assistant | W | R (finance only, config flag) | - |
| Reconciliation | W | W | - |

`R` = read, `W` = write, `-` = none. All checks are enforced server-side; customer queries are scoped by `customerId` from the JWT, never from request parameters.

---

## Team, Branches and Ownership

| Person | Branch | API modules | Web routes | Prisma |
|--------|--------|-------------|------------|--------|
| **A** | `feat/core` | auth, users, catalog, subscriptions, reports, audit, common | auth, dashboard, products, plans, quotation-templates, subscriptions, staff, audit-log, portal shell | `a_core.prisma`, seed, docker, CI |
| **B** | `feat/billing` | billing, discounts, proration, tax, disputes | invoices, discounts, taxes, my/invoices | `b_billing.prisma` |
| **C** | `feat/payments` | payments, rescue, reconcile, paylinks, mandates | payments, reconcile, rescue, my/payments | `c_payments.prisma` |
| **D** | `feat/insights-comms` | notifications, whatsapp, insights, ai, forecasts | mrr, leakage, assistant, settings/templates, my/savings | `d_insights.prisma` |

Branches: `main` (protected) <- `develop` (integration) <- the four feature branches.

**Rules**
1. Edit only your own folders.
2. Schema changes must be additive and announced in chat.
3. Call other modules through service contracts and events only (import from module barrels).
4. Rebase onto `develop` hourly.
5. Mock until the real implementation lands.

Your task list lives in `docs/TASKS_A.md` ... `docs/TASKS_D.md`.

---

## Integrations Setup

### Mailhog (email)
Runs via Docker. View sent emails (password reset, invoices) at http://localhost:8025.

### Twilio WhatsApp Sandbox
1. Create a Twilio account and open the WhatsApp Sandbox.
2. Each tester sends the sandbox join code (shown in the console) to the sandbox number from their WhatsApp.
3. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` in `.env`.
4. Expose the API with ngrok: `ngrok http 4000`, set `TWILIO_WEBHOOK_BASE_URL` to the ngrok URL.
5. In the Twilio console set the inbound webhook to `<ngrok-url>/api/v1/webhooks/twilio/whatsapp`.
6. The customer must have `whatsappOptIn = true` and a verified E.164 phone.

### Razorpay (test mode)
1. Get test keys from the Razorpay dashboard; set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
2. Create a webhook pointing to `<ngrok-url>/api/v1/webhooks/razorpay` with events `payment_link.paid` and `payment.captured`.
3. Set `RAZORPAY_WEBHOOK_SECRET` to the secret you chose. Signatures are verified with HMAC-SHA256 on the raw body.

### Anthropic (AI)
Set `ANTHROPIC_API_KEY`. Model is configurable through `ANTHROPIC_MODEL`. The finance assistant only queries allowlisted `v_*` views through the read-only `billpilot_ro` role.

---

## Testing

```bash
pnpm test              # unit + e2e across packages
pnpm -r typecheck
pnpm lint
```

Critical-path tests: password rules, role guard (403), double billing (idempotency), discount exhaustion under concurrency, webhook replay, partial payment, overpayment, proration rounding, AI SQL validator rejecting DELETE and multi-statement queries. One Playwright smoke test covers login.

---

## Performance

Target: p95 under 2 seconds on every page and endpoint with 5,000+ subscriptions and ~60,000 invoices.

- Composite indexes, keyset pagination, narrow selects, no N+1
- Redis caching on reports (60s, invalidated on payment and invoice events)
- gzip compression, Next.js streaming and skeleton loaders
- `X-Response-Time` header; the UI footer shows a "Loaded in N ms" badge
- `pnpm perf:check` enforces the budget

---



## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 5432 / 6379 already in use | Stop local Postgres/Redis or change the ports in `docker-compose.yml` and `.env` |
| `prisma migrate` fails on relations | Run `pnpm prisma validate`; every relation needs both sides defined across schema files |
| Login works but redirects wrongly | Staff go to `/dashboard`, customers to `/my/subscriptions` |
| WhatsApp messages not arriving | Confirm the phone joined the sandbox, opt-in is true, and the ngrok URL is current |
| Razorpay webhook returns 400 | Check `RAZORPAY_WEBHOOK_SECRET` and that the raw body is used for the signature |
| Reset DB cleanly | `pnpm db:reset` |

---

**Brightloop Software** - BillPilot. Built in 7 hours.
