# BillPilot — Subscription Management System

> **"We removed every manual step in the billing month."**
> Built by **Brightloop Software** · Hackathon project

---

## Quick Start

```bash
# 1. Clone and set up environment
git clone <repo> billpilot && cd billpilot
cp .env.example .env
# Edit .env with your secrets (JWT secrets at minimum)

# 2. Start local infrastructure (PostgreSQL + Redis)
#    Option A — Docker (recommended if Docker Desktop is installed):
docker compose up -d

#    Option B — Homebrew (if Docker is unavailable on macOS):
brew install postgresql@16 redis
brew services start postgresql@16
brew services start redis
# Then create the database:
psql -U $(whoami) -d postgres -c "CREATE ROLE billpilot WITH LOGIN PASSWORD 'billpilot' SUPERUSER CREATEDB;"
psql -U $(whoami) -d postgres -c "CREATE DATABASE billpilot OWNER billpilot;"

# 3. Install dependencies
pnpm install

# 4. Database setup — run migrations then seed
pnpm db:migrate
pnpm db:seed

# For 5 000+ subscriptions and ~60 000 invoices (performance demo):
pnpm db:seed -- --scale=5000

# 5. Start dev servers  (API → :4000 · Web → :3000)
pnpm dev
```

---

## Services & Web Pages

| Route | Page | Purpose & Design |
|---|---|---|
| **`/`** | **Main Landing Page** | Warm cream editorial aesthetic (`#fbfbfa` & `#dc4a22`), mascot on stool, 2M+ stat pill, infinity loop, dashboard window, unit economics table, terminal + bill explainer stepper, mascot row, interactive leakage scanner try-it box, CFO testimonial, ARR hockey-stick curve, dark `#0e0e0d` footer. |
| **`/pricing`** | **Pricing & Tiers** | BillPilot Platform vs Rescue Engine switcher, Monthly vs Yearly (-16.7%), 3 pricing cards: Starter (₹0), Pro (₹2,499/seat), Enterprise (Custom). |
| **`/enterprise`** | **Enterprise & Security** | Terracotta wireframe graphic, SOC 2/GDPR/HIPAA compliance pill row, hub-and-spoke architecture, 2M+ stats, on-premise & granular RBAC. |
| **`/customers`** | **Customer Stories** | 2M+/25K+/SOC 2 pill, 12-logo grid, 19% cycle time quote card, 6 customer case study cards (Apex Global, Zenith Infotech, etc.). |
| **`/roi`** | **Revenue ROI & Economics** | 3.2x / +31% / -38% stats, financial integrity safeguards (composite locks, atomic discounts, read-only AI views), 62% Razorpay vs 38% Bank CSV split, churn breakdown. |
| **`/portal`** | **Customer Portal** | Self-service billing, active subscriptions, invoice downloads, Razorpay payments, live proration simulation for seat changes. |
| **`/dashboard`** | **Operations Hub** | Executive MRR/ARR, leakage alerts, billing run trigger, quick actions, collection charts. |
| **`/subscriptions`** | **Subscriptions** | Lifecycle state transitions (Draft → Quotation → Confirmed → Active → Closed), pause/resume/early-close/renew. |
| **`/invoices`** | **Invoices & Billing** | GST-compliant invoices, status pills, PDF receipts, WhatsApp dispatch triggers. |
| **`/billing-run`** | **Bulk Billing Run** | Idempotent billing execution, pre-run anomaly checks, live execution audit log. |
| **`/payments`** | **Reconciliation** | Razorpay webhooks, Bank CSV fuzzy statement matching, credit balance allocations. |
| **`/catalog`** | **Products & Plans** | Odoo variants (+₹560), margin analysis, plan-product bundles. |
| **`/quotes`** | **Quotation Templates** | One-click draft quotes, natural-language AI quotation drafter. |
| **`/discounts-taxes`** | **Taxes & Discounts** | 18% GST splits (CGST + SGST vs IGST), concurrency-safe discount vouchers. |
| **`/leakage`** | **Revenue Leakage** | Automated scanner for uninvoiced contracts, orphaned discounts, 1-click remediation. |
| **`/payment-rescue`** | **Payment Rescue** | Dunning retry scheduler, card failure categorization, recovered MRR tracking. |
| **`/ai-assistant`** | **AI Finance Assistant** | Natural-language queries, read-only Postgres views, SQL validator. |
| **`/communications`** | **WhatsApp Bot** | Twilio Sandbox bot logs, two-way commands, receipt dispatching. |
| **`/audit`** | **Audit Trail** | Immutable record of who changed what, timestamp, diff, and domain event emitter. |
| **`/login` / `/signup`** | **Auth Pages** | Argon2 password security, live password strength checklist, JWT session management. |
| **`:4000/api/docs`** | **Swagger API** | Interactive OpenAPI documentation for all 21 modular NestJS endpoints. |

---

## Seed Accounts

| Email                     | Password       | Role       |
|---------------------------|----------------|------------|
| `admin@brightloop.test`   | `Admin@12345!` | **ADMIN**  |
| `staff@brightloop.test`   | `Staff@12345!` | **STAFF**  |
| `cust1@brightloop.test`   | `Cust@12345!`  | **CUSTOMER** |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                        │
│  Next.js 15 (App Router · Tailwind CSS · Recharts)             │
│  :3000                                                          │
└─────────────────┬───────────────────────────────────────────────┘
                  │ REST (Bearer JWT)
┌─────────────────▼───────────────────────────────────────────────┐
│  NestJS 10 API  :4000                                           │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌─────────────────┐  │
│  │ Auth     │ │ Billing  │ │ Payments  │ │ Notifications   │  │
│  │ Users    │ │ Discounts│ │ Razorpay  │ │ WhatsApp        │  │
│  │ Catalog  │ │ Tax      │ │ Reconcile │ │ AI Assistant    │  │
│  │ Subs     │ │ Proration│ │ Rescue    │ │ MRR / Leakage   │  │
│  └──────────┘ └──────────┘ └───────────┘ └─────────────────┘  │
│  ┌──────────────┐  ┌───────────┐  ┌──────────────────────────┐  │
│  │ PostgreSQL 16│  │ Redis 7   │  │ BullMQ (job queues)      │  │
│  │ Prisma 5     │  │ (cache)   │  │ @nestjs/schedule (cron)  │  │
│  └──────────────┘  └───────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         ▲                    ▲
Inbound webhooks:    Outbound integrations:
Razorpay · Twilio    Twilio (WhatsApp) · Razorpay · Anthropic AI
```

---

## Monorepo Layout

```
billpilot/
├── apps/
│   ├── api/          NestJS backend (Person A, B, C, D modules)
│   └── web/          Next.js frontend
├── packages/
│   └── shared/       Zod schemas, enums, event types, contracts
├── prisma/
│   ├── schema/       Multi-file Prisma schema (one per owner)
│   └── seed/         Factories + seed orchestrator
├── docker/           Postgres init SQL (read-only role + views)
├── docs/             DECISIONS.md, ARCHITECTURE.md, EVENTS.md …
├── docker-compose.yml
└── .env.example
```

---

## Feature Overview

### Must-ship (original brief — REQ)
- ✅ Sign-up with email + strong password (shared Zod schema, client + server)
- ✅ Login / refresh / logout · Forgot-password with expiring token
- ✅ Three roles: ADMIN, STAFF, CUSTOMER — every route role-guarded
- ✅ Products with variants (brand = Odoo +₹560)
- ✅ Plans with billing periods and lifecycle switches
- ✅ Quotation templates → Subscription (SUB-2026-000001 number)
- ✅ Status machine: Draft → Quotation → Confirmed → Active → Closed
- ✅ Pause / Resume / Early-close / Renew / Auto-close
- ✅ Invoice auto-generation with idempotency (unique constraint + transaction)
- ✅ Bulk billing run + manual button; "already billed" on double-click
- ✅ Tax calculation per line (inclusive / exclusive), 2 dp rounding
- ✅ Invoice PDF, confirm, cancel, send
- ✅ Discounts: fixed/%, conditions, usage limit (concurrency-safe UPDATE)
- ✅ Payments: partial + overpayment → credit balance
- ✅ Dashboard: active subs, revenue, owed, overdue — < 2 s at 5 000+ rows

### Tier 1 (must-ship wins)
- ✅ WhatsApp invoice delivery + receipt + reminders (Twilio Sandbox)
- ✅ Razorpay payment link with HMAC-verified, replay-safe webhook
- ✅ MRR / ARR dashboard with movement chart
- ✅ Audit log — who changed what and when
- ✅ Load-time badge in the footer
- ✅ 5 000+ subscriptions seed with `--scale=5000`

### Tier 2 (wow)
- AI Finance Assistant (text-to-SQL, read-only views, SQL validator)
- Natural-language → Quotation via Claude tool-calling
- Revenue Leakage Detector with one-click fixes
- Payment Rescue Engine (failure classification + retry scheduler)
- Bank CSV reconciliation (fuzzy matching, net-of-fee)
- "Why is my bill ₹X?" explainer stepper
- Proration preview for plan changes

### Tier 3 (polish / cut first)
- Dry-run billing, mandates, margin screen, multi-currency
- Cash-flow forecast, Savings Advisor, dark mode

---

## WhatsApp Sandbox Setup

1. Send `join <sandbox-code>` to **+1 415 523 8886** on WhatsApp
2. Set `TWILIO_WEBHOOK_BASE_URL` in `.env` to your ngrok URL
3. In Twilio console, set the sandbox webhook to:
   `$TWILIO_WEBHOOK_BASE_URL/api/v1/webhooks/twilio/whatsapp`

Two-way bot commands: `balance` · `invoice` · `pause` · `renew` · `cancel` · `help`  
Destructive actions (pause, cancel) require a `YES` confirmation reply.

---

## Ownership

| Person | Branch               | Owns |
|--------|----------------------|------|
| **A**  | `feat/core`          | Auth, Users, Catalog, Subscriptions, Dashboard, Audit, Portal shell |
| **B**  | `feat/billing`       | Invoices, Tax, Discounts, Proration, Disputes |
| **C**  | `feat/payments`      | Payments, Razorpay, Reconciliation, Rescue, Mandates |
| **D**  | `feat/insights-comms`| Notifications, WhatsApp, MRR, Leakage, AI Assistant |

---

## Key Commands

```bash
pnpm dev               # Start all (turbo)
pnpm db:migrate        # Run Prisma migrations
pnpm db:seed           # Seed with default data
pnpm db:seed -- --scale=5000   # Seed 5 000+ subscriptions
pnpm db:reset          # Reset DB and re-seed
pnpm db:studio         # Open Prisma Studio
pnpm db:generate       # Regenerate Prisma client
pnpm test              # Run all tests (vitest)
pnpm lint              # Lint all packages
pnpm typecheck         # Type-check all packages
pnpm perf:check        # Hit key endpoints, fail if p95 > 1 500 ms
```

---

## Performance Budget

Every page and API endpoint must respond in **under 2 seconds** with 5 000+ subscriptions.

Techniques used:
- Composite indexes on all hot query paths (see schema)
- Keyset pagination on invoices and audit logs (`?cursor=`)
- Redis caching on report aggregates (60 s TTL, invalidated on events)
- `SELECT` only needed columns; no N+1 queries
- `X-Response-Time` header on every response
- Load-time badge in the web footer

---

## Security

- JWT: 15-min access token + 7-day httpOnly refresh token
- Passwords: argon2 hash; strength rules enforced client + server (shared Zod)
- Role guard on every route (default deny; `@Public()` to opt out)
- Customer queries scoped by `customerId` from JWT, never from request params
- Webhook signatures: HMAC-SHA256 timing-safe compare (Razorpay + Twilio)
- Webhook replay safety: `WebhookEvent` table with unique event ID
- AI assistant: read-only Postgres role, allowlisted views only, SQL validation, row limit + timeout
- Rate limiting: 10 req/min on auth endpoints (@nestjs/throttler)
- Forgot-password: always returns 200 (no user enumeration)

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| **Frontend** | Next.js 15 (App Router) + TypeScript + Tailwind CSS + Recharts |
| **Backend** | NestJS 10 + TypeScript + Zod validation |
| **Database** | PostgreSQL 16 + Prisma 5 (multi-file schema) |
| **Queue** | Redis 7 + BullMQ + @nestjs/schedule |
| **Auth** | JWT (argon2 passwords) |
| **PDF** | pdfkit |
| **Email** | nodemailer → Mailhog (local) |
| **WhatsApp** | Twilio Sandbox |
| **Payments** | Razorpay (test mode) |
| **AI** | Anthropic Claude (claude-sonnet-4-5) |
| **Monorepo** | pnpm workspaces + Turborepo |
| **Testing** | Vitest + Supertest + Playwright |
