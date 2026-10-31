# Subscriptions Module (Person A)

## Implemented
- State machine: DRAFT -> QUOTATION -> CONFIRMED -> ACTIVE -> CLOSED
- Illegal transitions throw 409 ILLEGAL_TRANSITION
- Pausing / resuming via plan.pausable validation and isPaused flag
- Auto-advancing sequences / SUB-2026-XXXXXX number generation
- Customer-scoped queries enforced via customerId extracted from JWT
- Implements ISubscriptionService contract

## Next Tasks for Person A
- [ ] Auto-close background job for expired subscriptions
- [ ] Quotation expiration scheduled task

