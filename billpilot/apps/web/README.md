# BillPilot Web Application (`apps/web`)

Modern Next.js front-end client for **BillPilot**, the automated subscription billing and dunning platform.

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
    ├── app/                   # Next.js App Router (Routes & Layouts)
    │   ├── (auth)/
    │   │   └── login/         # Authentication & sign-in screen
    │   ├── (dashboard)/       # Protected management dashboard
    │   │   ├── layout.tsx     # Shell layout with Sidebar and Header
    │   │   ├── dashboard/     # Metric KPIs, MRR & dunning recovery stats
    │   │   ├── subscriptions/ # Subscription lifecycle management
    │   │   ├── invoices/      # GST invoices, ledger & payment tracking
    │   │   └── customers/     # Customer directory & communications
    │   ├── globals.css        # Global CSS variables & Tailwind directives
    │   ├── layout.tsx         # Root HTML layout & fonts
    │   └── page.tsx           # Product overview & welcome portal
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
