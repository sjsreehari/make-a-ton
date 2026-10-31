# Person D Tasks & Tracking — AI Assistant (Loop)

## Missing `data-tour` Target IDs
The following target IDs are referenced in tours (`packages/shared/src/tours.ts`) but belong to pages owned by Person A, B, or C:
- [ ] `create-plan-btn` (Person A: Plans page)
- [ ] `plan-form` (Person A: Plans page)
- [ ] `create-product-btn` (Person A: Products page)
- [ ] `sub-template-select` (Person A: Subscriptions page)
- [ ] `run-billing-btn` (Person B: Invoices page)
- [ ] `record-payment-btn` (Person C: Payments page)
- [ ] `dashboard-metrics` (Person A: Dashboard)
- [ ] `reconcile-table` (Person C: Reconcile page)
- [ ] `pay-invoice-btn` (Person C: Customer Portal Invoices)
- [ ] `change-plan-btn` (Person A: Customer Portal Subscriptions)

## Expense Table Status
- Currently, no dedicated `Expense` model exists in `prisma/schema`.
- `expense_summary` tool is configured to return:
  `{ available: false, reason: "Expense tracking table is not configured in this release." }`

## Mascot Animation Roadmap
- **Phase 1 (Current)**: Static lightweight CSS-only ball implementing states `idle | listening | thinking | talking | moving | pointing | happy | oops`.
- **Phase 2 (Future)**: Replace `Mascot.tsx` with Framer Motion animations, SVG artwork, and travel-to-target path coordinates. No changes needed to chat logic.
