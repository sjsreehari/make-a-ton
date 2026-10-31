# Person A: Core Engineering Tasks (TASKS_A.md)

**Branch**: `feat/core`
**Scope**: Auth, Users, Catalog, Subscriptions, Dashboard, Audit Log, Portal Shell, Docker, Performance

---

### Hour 0-1: Foundation & Shared Review
- [x] Review Prisma multi-file schema (`a_core.prisma`) and verify relations with B, C, D.
- [x] Verify Docker Compose setup (Postgres 16, Redis 7, Mailhog).
- [x] Validate `@billpilot/shared` contract interfaces.

### Hour 1-2: Auth, RBAC & Customer Profiles
- [x] Complete `POST /api/v1/auth/signup` with shared passwordSchema (>=9 chars, upper, lower, special).
- [x] Implement `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, and refresh token rotation.
- [ ] Implement `POST /api/v1/auth/forgot-password` and `POST /api/v1/auth/reset-password` via Mailhog.
  - *Acceptance Criteria*: Reset token expires in 30 mins, single use, generic 200 response.
- [x] Enforce role-guarding across all routes with `@Roles('ADMIN')` and `@Roles('STAFF')`.
- [ ] Build Staff Management UI: Admin creates staff users with role selection and status toggle.

### Hour 2-3: Catalog & Subscriptions State Machine
- [x] Product CRUD with variants (attribute + value + extraPrice, e.g. brand=Odoo +560).
- [x] Plan management with switches: `autoClose`, `closable`, `pausable`, `renewable`.
- [x] Quotation templates prefilling subscription lines and payment terms.
- [x] Subscription state machine: `DRAFT -> QUOTATION -> CONFIRMED -> ACTIVE -> CLOSED`.
  - *Acceptance Criteria*: Illegal transitions return 409 Conflict.
- [ ] Implement Pause & Resume endpoints (pausing sets `isPaused=true`, `pausedAt=now`, stops billing).
- [ ] Implement Early Close and Renewal logic respecting plan switches.

### Hour 3-4: Portal Shell & Staff UI
- [x] Build customer portal layout with responsive sidebar and navigation.
- [x] Build Staff dashboard layout with quick action buttons.
- [ ] Wire Subscriptions list table with status badges and filters (status, plan, customer).
- [ ] Subscription detail page with interactive state transition buttons and audit timeline.

### Hour 4-5: Reporting Dashboard & Redis Caching
- [ ] Implement `GET /api/v1/reports/summary` returning:
  - Active subscriptions count
  - Revenue collected (current period)
  - Amount owed (total outstanding)
  - Overdue invoices count & amount
- [ ] Cache report aggregates in Redis for 60 seconds with filter hash key.
- [ ] Invalidate report cache on `payment.recorded` and `invoice.confirmed` events.
- [ ] CSV and PDF export streaming for report tables.

### Hour 5-6: Audit Log & Performance Tuning
- [x] Verify `AuditLog` records actor, action, before/after JSON for state mutations.
- [ ] Audit Log UI screen with filtering by entity, date, and actor.
- [x] Seed database with 5,000+ subscriptions and ~60,000 invoices (`--scale=5000`).
- [x] Implement footer load-time badge measuring page load latency in milliseconds.
- [ ] Run `pnpm perf:check` script and ensure p95 < 1500ms on all core endpoints.

### Hour 6-7: Deployment & Demo Rehearsal
- [ ] Verify production build (`turbo run build`).
- [ ] Rehearse 5-minute live demo script (0:00 - 0:30 opening flow).
- [ ] Bug squashing and final branch merge into `develop`.
