# BillPilot: Demo Script & Architecture Guide

**Branch:** `other-features`  
**Modules Built:** WhatsApp Gateway & Bot, Notification Engine, Revenue Leakage Detector, MRR/ARR Engine, Smart Dunning

---

## 🎯 The Pitch

> *"We removed every manual step in the billing month — from the quote to the cash in the bank."*

BillPilot is an enterprise subscription billing and revenue recovery engine. It eliminates manual invoice chasing, detects hidden revenue leaks before month-end, and lets customers settle bills and manage recurring subscriptions directly over WhatsApp with automated Razorpay links.

---

## 🚀 Live Demo Walkthrough (5-Minute Script)

### Step 1: Live WhatsApp Invoicing & Notification
1. **Trigger:** An invoice is confirmed in the system.
2. **Action:** The system fires `DomainEvent.INVOICE_CONFIRMED`.
3. **Live Result:** The customer's WhatsApp immediately buzzes with:
   - Personalized invoice greeting
   - GST breakdown and total amount
   - Clickable Razorpay online payment link
   - PDF invoice download link

```bash
# Manual test trigger via cURL
curl -X POST http://localhost:4000/api/v1/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "message": "Your BillPilot Invoice INV-2026-001 for ₹18,500 is ready: https://rzp.io/l/demo"}'
```

---

### Step 2: Interactive Two-Way WhatsApp Bot
Show that the bot is an interactive self-service console, but strictly enforces zero-knowledge privacy for unverified numbers.

1. **Unknown Number:**
   - User texts: `"balance"` from an unverified phone.
   - **Bot Reply:** Friendly generic message asking them to log in; **zero customer data leaked**.
2. **Verified Customer:**
   - User texts: `"BALANCE"`
   - **Bot Reply:** *"💰 Total Outstanding Due: ₹21,830.00 across 2 invoices. Available credit: ₹0.00"*
   - User texts: `"INVOICE"`
   - **Bot Reply:** Details of latest invoice with instant paylink.
   - User texts: `"PAUSE"`
   - **Bot Reply:** *"⚠️ Are you sure you want to pause Enterprise Pro? Reply YES to confirm or NO to cancel."*
   - User texts: `"YES"`
   - **Bot Reply:** *"⏸️ Subscription SUB-2026-001 is now paused. Billing suspended."* (Audit log recorded).

---

### Step 3: Revenue Leakage Detector (The Wow Feature)
1. Navigate to **Leakage Detector** (`GET /api/v1/insights/leakage`).
2. Show **"₹X at Risk"** banner (identifying revenue that would have leaked silently):
   - **NEVER_INVOICED:** Active customer subscriptions with 0 invoices generated.
   - **EXPIRED_DISCOUNT_APPLIED:** Promotional discount applied past its validity date.
   - **WRONG_TAX:** Invoice line items billed at 0% instead of standard 18% GST.
   - **EXPIRED_BUT_ACTIVE:** Subscriptions past expiry date still consuming services.
   - **STUCK_DRAFT:** Draft invoices older than 7 days.
   - **UNSENT_INVOICE:** Confirmed invoices that failed delivery.
3. Click **"One-Click Fix"** (`POST /api/v1/insights/leakage/:id/fix`) to resolve the finding in real time.

---

### Step 4: MRR & ARR Waterfall Chart
1. Navigate to **MRR / ARR Dashboard** (`GET /api/v1/insights/mrr`).
2. Demonstrate real-time recurring revenue metrics:
   - **MRR:** Total monthly recurring revenue normalized across Monthly, Weekly, and Annual tiers.
   - **ARR:** MRR × 12.
   - **Movements:** New MRR, Expansion MRR, Contraction MRR, Churned MRR.
   - **Trend History:** Past 6–12 months cohort curves.

---

### Step 5: Automated Dunning Waterfall & Recovery
1. Show **Smart Dunning Overview** (`GET /api/v1/insights/dunning`):
   - Overdue cohort buckets: 1–3 days, 4–7 days, 8–14 days, 15+ days.
   - **"₹ Recovered" Counter:** ₹3,42,000+ collected through automated retries.
2. Click **"Fail this payment" demo button**:
   - Classifies failure (e.g. `INSUFFICIENT_FUNDS`).
   - Automatically kicks off recovery path with WhatsApp top-up link.

---

## ⚙️ Connecting Your Custom Linux WhatsApp Server

The gateway adapter is designed to connect to your custom Linux WhatsApp daemon without requiring code modifications:

1. **Set Environment Variable:**
   ```bash
   WHATSAPP_SERVER_URL=http://<your-linux-server-ip>:5001
   WHATSAPP_SERVER_API_KEY=<optional-bearer-or-api-key>
   ```

2. **Custom Linux Server Inbound Webhook:**
   Configure your Linux server to forward received messages to:
   ```
   POST http://<billpilot-ip>:4000/api/v1/whatsapp/webhook
   Content-Type: application/json

   {
     "from": "+919876543210",
     "body": "balance"
   }
   ```

3. **Custom Linux Server Outbound Endpoint:**
   Your Linux daemon should expose:
   ```
   POST /api/messages/send
   {
     "phone": "+919876543210",
     "message": "Text content"
   }
   ```
   *(If your custom server uses different parameter names or authentication, you can pass them via standard HTTP headers).*

