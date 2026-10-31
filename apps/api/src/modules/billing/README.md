# Billing Module (Person B)

## Implemented
- IInvoiceService implementation
- Idempotent invoice generation with unique constraint `(subscriptionId, periodStart, periodEnd)`
- Robust recurring billing math handling end-of-month dates (e.g. Jan 31 -> Feb 28 -> Mar 31)
- Sequential catch-up of missed billing periods without double-billing
- Number of cycles limit with automatic subscription completion
- Configurable document numbering patterns (e.g. `INV-{year}-{seq:6}`)
- Contextual derived display statuses: `DRAFT`, `CONFIRMED`, `SENT`, `PARTIAL`, `PAID`, `OVERDUE`, `CANCELLED`, `REVERSED`
- Immutability of line items on confirmed and paid invoices
- Complete tax engine supporting inclusive and exclusive taxation with up to 2 tax rules per line (e.g., CGST + SGST) and itemized tax breakdown
- Deterministic monetary calculation with HALF_UP rounding
- PDF generation for invoices and credit notes using pdfkit
- Standalone credit note creation with invoice balance deduction and customer credit overflow
- Batch bulk operations: confirm, send, cancel with per-item status reporting
- Portal invoice view tracking
