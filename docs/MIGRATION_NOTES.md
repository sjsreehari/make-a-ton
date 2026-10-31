# BillPilot Migration Notes: PostgreSQL to MySQL 8.0 & Redis/BullMQ Removal

## Inventory (Task 1)

### 1. Redis and BullMQ Inventory
Search query: `redis|bullmq|ioredis|@nestjs/bullmq|InjectQueue|Processor|new Queue|new Worker`

| Location | Content / Context | Decision | Status |
|---|---|---|---|
| `.env.example:5-6` | `REDIS_URL=redis://localhost:6379` | **Remove** (No external Redis required) | [x] |
| `apps/api/package.json:19` | `"@nestjs/bullmq": "^12.0.0"` | **Remove** dependency | [x] |
| `apps/api/package.json:32` | `"bullmq": "^5.16.0"` | **Remove** dependency | [x] |
| `apps/api/package.json:36` | `"ioredis": "^5.4.1"` | **Remove** dependency | [x] |
| `apps/api/src/app.module.ts:7,10,69,74` | `BullModule.forRootAsync`, `RedisModule` imports | **Remove** BullModule and RedisModule | [x] |
| `apps/api/src/common/events/event-bus.module.ts:2` | BullModule queue registration | **Remove** BullModule queue registration | [x] |
| `apps/api/src/common/events/event-bus.service.ts:3,4,13,23` | `@InjectQueue(DOMAIN_EVENTS_QUEUE)`, `Queue`, `this.queue.add` | **Rewrite** to use JobQueueService / EventEmitter2 | [x] |
| `apps/api/src/common/redis/cache.service.ts` | Redis-backed CacheService | **Rewrite** into in-process `TtlCacheService` | [x] |
| `apps/api/src/common/redis/redis.constants.ts` | `REDIS_CLIENT` token | **Remove** / alias | [x] |
| `apps/api/src/common/redis/redis.module.ts` | RedisModule provider setup | **Remove** / Replace with in-process cache | [x] |
| `apps/api/src/common/redis/redis.service.ts` | `RedisService` client wrapper | **Rewrite** into in-process `TtlCacheService` | [x] |
| `apps/api/src/modules/health/health.controller.ts:17-31` | Health check verifying Redis connectivity | **Rewrite** to check MySQL only; report status: 'ok' | [x] |
| `apps/api/src/modules/notifications/notifications.service.ts:3,39` | CacheService dedupeKey check | **Rewrite** to use Job dedupeKey / in-process cache | [x] |
| `apps/api/src/modules/reports/reports.service.ts:5` | CacheService for dashboard reports | **Rewrite** to use in-process `TtlCacheService` | [x] |
| `apps/api/src/modules/whatsapp/phone.service.ts:3,58` | CacheService for phone verification OTP | **Rewrite** to use in-process `TtlCacheService` | [x] |
| `docker-compose.yml:20-27` | `redis:7` container service definition | **Remove** | [x] |
| `packages/shared/src/events.ts:1` | Comment referring to BullMQ job names | **Rewrite** documentation comment | [ ] |
| `scripts/verify-all-modules.ts:314` | Health verification checking Redis service | **Rewrite** to verify MySQL service | [ ] |
| `apps/web/src/app/enterprise/page.tsx:135,138,195` | Marketing mentions of BullMQ and Redis | **Rewrite** copy | [ ] |
| Documentation files (`PROJECT.txt`, `README.md`, `docs/*`) | Architectural references to Redis & BullMQ | **Rewrite** in Task 7 | [ ] |

---

### 2. PostgreSQL-Specific SQL & Syntax Inventory
Search query: `postgres|pg_|ILIKE|RETURNING|::[a-z]+|statement_timeout|insensitive|information_schema|\$queryRaw|\$executeRaw|\$queryRawUnsafe`

| Location | Content / Context | Decision | Status |
|---|---|---|---|
| `.env.example:2-3` | PostgreSQL URLs for `DATABASE_URL` and read-only | **Rewrite** to `mysql://billpilot:billpilot@localhost:3306/billpilot` | [ ] |
| `docker-compose.yml:2-15` | `postgres:16` service and `pgdata` volume | **Rewrite** to `mysql:8.0` service with `mysqldata` | [ ] |
| `docker/postgres/init.sql` | PostgreSQL `pg_roles` and `GRANT` syntax | **Rewrite** into `docker/mysql/init.sql` for MySQL 8 | [x] |
| `apps/api/src/common/prisma/prisma.service.ts:20` | Logger message `'Disconnected from PostgreSQL'` | **Rewrite** to `'Disconnected from MySQL'` | [x] |
| `apps/api/src/modules/ai/guard/sql-validator.service.ts:23-24` | Deny-list checking `pg_`, `information_schema` | **Rewrite** to include MySQL system databases and functions (`sleep(`, `benchmark(`, `sys.`, `performance_schema`, etc.) | [x] |
| `apps/api/src/modules/auth/auth.service.ts:23` | Case-insensitive email uniqueness check | **Keep** logic (MySQL collation `utf8mb4_0900_ai_ci` handles this natively) | [x] |
| `apps/api/src/modules/health/health.controller.ts:20` | `this.prisma.$queryRaw\`SELECT 1\`` | **Keep** (valid on MySQL 8.0) | [x] |
| `apps/web/src/app/globals.css:85` | `::selection` selector | **Keep** (CSS pseudo-element, not SQL) | [x] |
| `apps/web/src/app/enterprise/page.tsx:138,195` | Marketing copy mentions of PostgreSQL 16 | **Rewrite** copy | [ ] |
| Documentation files (`PROJECT.txt`, `README.md`, `docs/*`) | References to PostgreSQL, psql, pgdata | **Rewrite** in Task 7 | [ ] |
| `packages/shared/src/constants.ts:14` | `AI_STATEMENT_TIMEOUT_MS = 3000` | **Keep** (used for MySQL `/*+ MAX_EXECUTION_TIME(3000) */`) | [ ] |

---

## Decisions & Design Notes

1. **Job Queue Architecture**:
   - Implemented a lightweight, durable MySQL-backed job queue via table `Job` in `e_platform.prisma`.
   - Polling workers use `SELECT ... FOR UPDATE SKIP LOCKED` inside a transaction to atomically claim jobs with zero lock contention across concurrent API workers.
   - Idempotency is enforced using unique constraint `dedupeKey VARCHAR(191)` on table `Job`.

2. **In-Process Cache (`TtlCacheService`)**:
   - Replaced Redis `CacheService` with an in-memory `TtlCacheService` with TTL support and prefix invalidation on domain events (`invoice.*`, `payment.*`, `subscription.*`).

3. **Atomic Sequence Generation**:
   - Replaced Prisma upsert increment with MySQL native `INSERT INTO SequenceCounter (key, value) VALUES (?, 1) ON DUPLICATE KEY UPDATE value = LAST_INSERT_ID(value + 1)` and `SELECT LAST_INSERT_ID()`.
