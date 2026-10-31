# Billing Module (Person B)

## Implemented
- IInvoiceService implementation
- Idempotent invoice generation with unique constraint `(subscriptionId, periodStart, periodEnd)`
- Batch billing run with skip/fail counting and dry run capability
- State transitions: DRAFT -> CONFIRMED -> PAID / CANCELLED
- Domain events emitted: invoice.generated, invoice.confirmed, invoice.paid

## Next Tasks for Person B
- [ ] Connect pdfkit to renderPdf method
- [ ] Automatic discount application inside transaction
- [ ] Idempotency e2e integration test verification
