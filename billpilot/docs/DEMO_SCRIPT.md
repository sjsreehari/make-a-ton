# BillPilot 5-Minute Live Demo Script (DEMO_SCRIPT.md)

This scripted live demonstration showcases Brightloop Software's complete end-to-end journey in under 5 minutes.

## 0:00 - 0:30 | Person A (Core & Performance)
1. Open http://localhost:3000 in dark mode.
2. Note the footer badge: `"5,200 subscriptions — loaded in 340 ms"`.
3. Sign up a new customer account, demonstrating live password rule checks (red crosses turn green as length >= 9, uppercase, lowercase, special character are met).
4. Log in as `admin@brightloop.test`, navigate to Products, and show the `brand = Odoo (+560)` variant.
5. Create a new subscription from the `Standard Net-15` Quotation Template.
6. Progress the subscription through the status machine: `DRAFT -> QUOTATION -> CONFIRMED -> ACTIVE`. Point out the immutable audit log entries recorded at each step.

## 0:30 - 1:15 | Person B (Billing & Invoicing)
1. Switch to the Billing screen and click the manual `"Run billing"` button.
2. Show N invoices generated with taxes (GST 18%) and auto-applied discounts.
3. Click `"Run billing"` again immediately: show that 0 duplicate invoices were created and status reports `"already billed"`.
4. Open the created invoice: show the `"Why is my bill Rs X?"` explainer stepper detailing line calculation, tax breakdown, and variant add-on.
5. Demonstrate the Proration Preview screen for an upgrade from Starter to Pro Monthly.

## 1:15 - 2:00 | Person D (WhatsApp Bot & Notifications)
1. Display the real phone screen receiving a WhatsApp notification with the invoice summary, PDF download link, and Razorpay test payment link.
2. Reply with `"balance"` on WhatsApp: the bot replies instantly with the customer's current outstanding balance.
3. Reply with `"why higher"`: the bot provides a plain-English explanation of the price change.

## 2:00 - 2:45 | Person C (Payments, Razorpay & Webhooks)
1. Click the Razorpay payment link directly from the invoice / WhatsApp message.
2. Complete a test payment using the Razorpay sandbox (UPI / Card).
3. Switch back to BillPilot: show the webhook firing, verifying HMAC-SHA256 signature, recording the payment, and automatically flipping the invoice status to `PAID`.
4. WhatsApp immediately displays the payment receipt message.

## 2:45 - 3:30 | Person C (Payment Rescue & Bank Reconciliation)
1. Click the `"Fail this payment"` demo trigger on an open invoice.
2. Show the Payment Rescue Engine classifying the failure (e.g. `INSUFFICIENT_FUNDS`), scheduling automated delayed retry, and updating the `"Rs recovered"` live counter.
3. Upload a sample bank statement CSV: 18 rows auto-match with confidence > 0.9 (including net-of-fee deductions), while 3 ambiguous items route to the manual review queue.

## 3:30 - 4:15 | Person D (Revenue Leakage & AI Finance Assistant)
1. Open the Revenue Leakage Detector screen: highlights `"Rs 84,200 at risk"` across stuck drafts, expired active subs, and unapplied taxes.
2. Click the 1-click `"Fix"` button to instantly reconcile a finding.
3. Open the AI Finance Assistant tab and ask: `"Which invoices are overdue by more than 15 days?"`.
4. Show the read-only generated SQL query against `v_invoices`, the returned results table, and the natural language summary.

## 4:15 - 4:45 | Closing (All Owners)
Deliver the concluding pitch:
> "Brightloop Software was losing hours every month to manual invoicing, lost payments, and untracked revenue leaks. With BillPilot, we removed every manual step in the billing month."
