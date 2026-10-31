# API Conventions (API_CONVENTIONS.md)

## 1. Protocol & Paths
- Base URL prefix: `/api/v1`
- Content-Type: `application/json` for requests and responses.
- Dates & Times: Formatted as ISO-8601 UTC strings (`2026-10-31T06:12:00.000Z`).
- Currency & Monetary values: Formatted as decimal strings with 2 decimal places (e.g., `"4999.00"`).

## 2. Pagination Standard
All list endpoints MUST paginate. No unconstrained rows are returned.
- Query parameters: `?page=1&limit=20` (max limit: 100) or `?cursor=<id>` for high-volume logs.
- Response envelope:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5230,
    "totalPages": 262,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextCursor": null
  }
}
```

## 3. Error Envelope
All errors are normalized through the global `HttpExceptionFilter`:
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Input validation failed",
    "details": [
      { "field": "password", "message": "Password must be at least 9 characters" }
    ],
    "requestId": "be8a13b3-ca95-4ef3-92da-54002dd11e30"
  }
}
```

Standard Error Codes:
- `VALIDATION_FAILED`: Request payload failed Zod schema checks.
- `UNAUTHENTICATED`: Bearer token missing, invalid, or expired.
- `FORBIDDEN`: Role lacks sufficient privileges for the target endpoint.
- `NOT_FOUND`: Resource could not be found.
- `CONFLICT`: Unique constraint violation or illegal transition state.
- `ILLEGAL_TRANSITION`: State machine refused entity status change.
- `DUPLICATE_BILLING`: Subscription already billed for target period.
- `DISCOUNT_EXHAUSTED`: Discount usage limit reached or expired.
- `PAYMENT_EXCEEDS_BALANCE`: Payment rejected by invoice balance check.
- `WEBHOOK_SIGNATURE_INVALID`: Webhook HMAC-SHA256 signature mismatch.
- `RATE_LIMITED`: Throttler triggered (10 req/min limit on auth).
- `INTERNAL`: Unhandled server exception.

## 4. Headers
- `X-Request-Id`: Unique request tracing UUID.
- `X-Response-Time`: Server processing latency in milliseconds (e.g. `12ms`).
- `Idempotency-Key`: Supported on `/invoices/run-billing` and `/payments`.
