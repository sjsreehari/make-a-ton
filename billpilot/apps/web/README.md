# BillPilot Web Application (`apps/web`)

Modern Next.js 14 front-end application for **BillPilot**, the end-to-end subscription billing, dunning recovery, and revenue automation system.

---

## 📁 Directory Structure & Architecture

```
apps/web/
├── .env.example               # Frontend environment template
├── next.config.mjs            # Next.js configuration and API proxy rewrites
├── package.json               # Package metadata and workspace dependencies
├── postcss.config.mjs         # PostCSS plugins (Tailwind & Autoprefixer)
├── tailwind.config.ts         # Tailwind CSS styling configuration
├── tsconfig.json              # TypeScript configuration extending root
├── public/                    # Static public assets (icons, images)
└── src/
    ├── app/                   # Next.js App Router
    │   ├── globals.css        # Tailwind directives and CSS variables
    │   ├── layout.tsx         # Root HTML layout & fonts
    │   ├── page.tsx           # Product overview landing page
    │   │
    │   ├── (auth)/            # Authentication Route Group
    │   │   └── login/         # Sign-in console for Admin, Staff, & Customer
    │   │
    │   ├── (staff)/           # Staff Operations Console (Layout + Sidebar + Header)
    │   │   ├── layout.tsx     # Staff operational shell layout
    │   │   ├── dashboard/     # MRR overview, active subscriptions, billing health
    │   │   ├── subscriptions/ # Subscription lifecycle management
    │   │   ├── products/      # Product catalog and billable modules
    │   │   ├── plans/         # Recurring cadences and pricing plans
    │   │   ├── quotation-templates/ # Custom enterprise quote proposals
    │   │   ├── staff/         # Role-based access control (ADMIN / STAFF)
    │   │   ├── audit-log/     # Immutable billing & change audit trail
    │   │   ├── invoices/      # GST invoices, credit notes, and ledgers
    │   │   ├── discounts/     # Coupon codes and automated discount rules
    │   │   ├── taxes/         # 18% GST (CGST/SGST/IGST) tax rules
    │   │   ├── payments/      # Razorpay payment orders & webhooks
    │   │   ├── reconcile/     # Bank reconciliation & payout matchers
    │   │   ├── rescue/        # Dunning waterfall & churn recovery engine
    │   │   ├── whatsapp/      # Twilio WhatsApp conversational bot
    │   │   ├── notifications/ # Mailhog SMTP & SMS alert templates
    │   │   ├── insights/      # Cohort retention curves & expansion
    │   │   ├── mrr/           # MRR movement waterfall
    │   │   ├── leakage/       # Unbilled usage & failed renewal detector
    │   │   └── assistant/     # AI Billing Assistant (Claude 3.5 Sonnet)
    │   │
    │   └── (portal)/          # Customer Self-Service Portal
    │       ├── layout.tsx     # Customer portal header & navigation
    │       ├── my/subscriptions/ # Customer active plans & plan change
    │       ├── my/invoices/      # GST tax invoice downloads & receipts
    │       ├── my/payments/      # Saved cards & UPI autopay e-mandates
    │       └── my/savings/       # AI annual commitment discount suggestions
    │
    ├── components/
    │   ├── layout/            # Layout wrappers (Sidebar, Header, Nav)
    │   └── ui/                # Reusable design system primitives
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── input.tsx
    │       └── stats-card.tsx
    ├── hooks/                 # Custom React hooks (useAuth, etc.)
    ├── lib/                   # Utility helpers & API client
    │   ├── api-client.ts      # Typed REST client with bearer token handling
    │   └── utils.ts           # Tailwind merge & currency formatters (INR)
    └── types/                 # Frontend state and session interfaces
```

---

## ⚙️ Attributes & Configuration

| Attribute | Details |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + Lucide Icons |
| **Monorepo Package** | `@billpilot/web` (managed by Turborepo & pnpm workspaces) |
| **Default Port** | `3000` (API backend on `4000`) |
| **API Integration** | Connects to `@billpilot/api` via `NEXT_PUBLIC_API_URL` |
| **Shared Contracts** | Integrates with `@billpilot/shared` for Zod schemas & enums |

---

## 🚀 Available Scripts

From the repository root or inside `apps/web`:

- `pnpm --filter @billpilot/web dev` : Start local dev server on http://localhost:3000
- `pnpm --filter @billpilot/web build` : Build production optimized Next.js bundle
- `pnpm --filter @billpilot/web start` : Start production server
- `pnpm --filter @billpilot/web typecheck` : Verify TypeScript types
