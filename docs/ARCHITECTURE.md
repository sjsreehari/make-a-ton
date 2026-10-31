# System Architecture (ARCHITECTURE.md)

BillPilot is structured as an enterprise-grade monorepo designed for high throughput, strict security boundaries, and rapid parallel feature delivery across four engineering owners.

```
+-------------------------------------------------------------+
|                     WEB (Next.js 15)                        |
|              Tailwind CSS + Recharts (:3000)                |
+------------------------------+------------------------------+
                               | REST (Bearer JWT)
                               v
+-------------------------------------------------------------+
|                    API (NestJS 10) (:4000)                  |
|                                                             |
|  [Auth/Users]   [Catalog]   [Subscriptions]   [Audit]       |
|  [Billing]      [Discounts] [Tax]             [Proration]   |
|  [Payments]     [Rescue]    [Reconcile]       [Paylinks]    |
|  [Notifications][WhatsApp]  [Insights/MRR]    [AI Assist]   |
+---------------+--------------+---------------+--------------+
                |              |               |
       Prisma 5 |      ioredis |        BullMQ |
                v              v               v
+---------------+----+   +-----+--------+   +--+--------------+
| PostgreSQL 16      |   | Redis 7      |   | Background Queue|
| - Base Tables      |   | - Cache (60s)|   | - Domain events |
| - Read-only Views  |   | - Idempotency|   | - Retries/Rescue|
+--------------------+   +--------------+   +-----------------+
```

## Layers & Components

1. **Frontend App (`apps/web`)**
   - Built with Next.js 15 App Router, TypeScript, Tailwind CSS.
   - Design system matches router UI: responsive sidebar, card containers, dialog modals, tooltips.
   - Role-based routing: automatically routes staff to `/dashboard` and customers to `/my/subscriptions`.
   - Real-time performance badge tracking page load duration in milliseconds.

2. **Backend API (`apps/api`)**
   - Built with NestJS 10, TypeScript strict mode, Zod validation pipes.
   - Global JwtAuthGuard and RolesGuard default to deny.
   - Interceptors inject `X-Request-Id` and `X-Response-Time` on all responses.
   - Multi-file Prisma schemas (`a_core.prisma`, `b_billing.prisma`, `c_payments.prisma`, `d_insights.prisma`).

3. **Background Services & Queues**
   - BullMQ handles persistent asynchronous jobs (e.g. WhatsApp message dispatch, payment retries).
   - `@nestjs/schedule` runs nightly billing cron and overdue status checks.
   - Redis provides 60-second caching for dashboard aggregates, invalidated by domain events.
