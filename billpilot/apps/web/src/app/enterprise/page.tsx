"use client";

import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/Navbar";
import { MarketingFooter } from "@/components/marketing/Footer";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Server,
  Database,
  CheckCircle2,
  Cpu,
  KeyRound,
  FileCheck2,
} from "lucide-react";

export default function EnterpriseSecurityPage() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#1c1b1a] selection:bg-[#dc4a22]/20 font-sans antialiased">
      <MarketingNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-24">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-6xl font-serif font-normal text-[#1c1b1a] tracking-tight leading-[1.1] mb-5">
            Trusted by subscription teams that take{" "}
            <span className="italic text-[#dc4a22] font-serif font-medium">security seriously</span>
          </h1>

          <p className="text-sm text-[#6e6d6a] max-w-xl mx-auto leading-relaxed mb-8">
            BillPilot provides bank-grade idempotency, zero duplicate billing, and role-enforced security for high-volume recurring software businesses.
          </p>

          <div className="flex items-center justify-center gap-3 mb-16">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white border border-[#d9d9d4] hover:bg-[#f2f2ee] text-[#1c1b1a] shadow-sm transition-all"
            >
              Book a demo
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-semibold bg-[#1c1b1a] hover:bg-black text-white shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <span>Talk to an engineer</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Geometric Torus Constellation Wireframe SVG matching Image 4 */}
          <div className="relative py-8 flex justify-center">
            <svg className="w-full max-w-2xl h-44 text-[#dc4a22]/80 opacity-90" viewBox="0 0 600 200" fill="none">
              <ellipse cx="300" cy="100" rx="280" ry="80" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              <ellipse cx="300" cy="100" rx="220" ry="70" stroke="currentColor" strokeWidth="1" />
              <ellipse cx="300" cy="100" rx="160" ry="60" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <ellipse cx="300" cy="100" rx="100" ry="50" stroke="currentColor" strokeWidth="1.2" />
              <ellipse cx="300" cy="100" rx="40" ry="30" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="300" cy="100" r="5" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Section: Everything your security team is going to ask about */}
        <section className="py-14 border-t border-[#e8e8e3] text-center">
          <span className="text-[11px] font-mono font-bold text-[#8c8b87] uppercase tracking-wider block mb-2">
            SECURITY & COMPLIANCE
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#1c1b1a] mb-2 font-normal">
            Everything your security team is going to ask about
          </h2>
          <p className="text-xs text-[#6e6d6a] max-w-md mx-auto mb-8">
            Built from day one with strict multi-tenant customer isolation, Argon2 password hashing, and HMAC webhook verification.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
            <span className="px-4 py-2 rounded-xl bg-white border border-[#e8e8e3] text-[#1c1b1a] shadow-sm font-semibold">
              GDPR Compliant
            </span>
            <span className="px-4 py-2 rounded-xl bg-white border border-[#e8e8e3] text-[#1c1b1a] shadow-sm font-semibold">
              GST Ready (CGST/SGST)
            </span>
            <span className="px-4 py-2 rounded-xl bg-white border border-[#e8e8e3] text-[#1c1b1a] shadow-sm font-semibold">
              SOC 2 Type II
            </span>
            <span className="px-4 py-2 rounded-xl bg-white border border-[#e8e8e3] text-[#1c1b1a] shadow-sm font-semibold">
              PCI-DSS Level 1
            </span>
            <span className="px-4 py-2 rounded-xl bg-white border border-[#e8e8e3] text-[#1c1b1a] shadow-sm font-semibold">
              SSO & JWT Auth
            </span>
            <span className="px-4 py-2 rounded-xl bg-white border border-[#e8e8e3] text-[#1c1b1a] shadow-sm font-semibold">
              Argon2 Hashed
            </span>
          </div>
        </section>

        {/* Section: Built for complex engineering orgs (Hub Architecture Diagram) */}
        <section className="py-16 border-t border-[#e8e8e3]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-mono font-bold text-[#dc4a22] uppercase tracking-wider block mb-2">
              HUB ARCHITECTURE
            </span>
            <h2 className="text-3xl font-serif font-normal text-[#1c1b1a]">
              Built for complex subscription orgs
            </h2>
            <p className="text-xs text-[#6e6d6a] mt-2">
              Unified control plane connecting customer quotes to bank settlement with zero manual glue code.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e8e8e3] bg-[#f4f4f0] p-8 sm:p-12 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Left Column: Inputs */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white border border-[#e0e0da] shadow-sm text-xs">
                  <span className="font-semibold block text-[#1c1b1a]">Quotation Templates</span>
                  <span className="text-[11px] text-[#6e6d6a]">Preset line items & Odoo variants</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#e0e0da] shadow-sm text-xs">
                  <span className="font-semibold block text-[#1c1b1a]">Customer Portal</span>
                  <span className="text-[11px] text-[#6e6d6a]">Self-service plan adjustments</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#e0e0da] shadow-sm text-xs">
                  <span className="font-semibold block text-[#1c1b1a]">AI Natural Language</span>
                  <span className="text-[11px] text-[#6e6d6a]">Text-to-quote conversion</span>
                </div>
              </div>

              {/* Center Hub: BillPilot Core */}
              <div className="p-6 rounded-2xl bg-[#dc4a22] text-white shadow-xl shadow-[#dc4a22]/30 text-center space-y-2">
                <Database className="size-6 mx-auto text-white" />
                <h3 className="text-base font-bold">BillPilot Core Engine</h3>
                <p className="text-[11px] text-white/90 leading-relaxed">
                  Idempotent Billing Runs · Multi-File Prisma · BullMQ Timed Scheduler · Decimal(14,2) Exact Math
                </p>
                <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono bg-white/20 font-bold">
                  PostgreSQL 16 & Redis 7
                </span>
              </div>

              {/* Right Column: Gateways */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white border border-[#e0e0da] shadow-sm text-xs">
                  <span className="font-semibold block text-[#1c1b1a]">Twilio WhatsApp</span>
                  <span className="text-[11px] text-[#6e6d6a]">PDF dispatch & conversational bot</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#e0e0da] shadow-sm text-xs">
                  <span className="font-semibold block text-[#1c1b1a]">Razorpay Gateway</span>
                  <span className="text-[11px] text-[#6e6d6a]">HMAC replay-safe webhooks</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#e0e0da] shadow-sm text-xs">
                  <span className="font-semibold block text-[#1c1b1a]">Anthropic Claude</span>
                  <span className="text-[11px] text-[#6e6d6a]">Read-only SQL finance assistant</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Big Mosaic Stat: 2,000,000+ Invoices */}
        <section className="py-12 border-t border-[#e8e8e3]">
          <div className="rounded-2xl border border-[#e8e8e3] bg-white p-8 sm:p-12 text-center shadow-sm relative overflow-hidden">
            <span className="text-xs font-mono text-[#8c8b87] uppercase tracking-wider block mb-2">
              BILLING INVOICES PROCESSED WITH ZERO DUPLICATES
            </span>
            <p className="text-4xl sm:text-6xl font-serif font-bold text-[#1c1b1a] tracking-tight">
              2,000,000+
            </p>
            <p className="text-xs text-[#6e6d6a] max-w-md mx-auto mt-2">
              Verified through composite uniqueness on (subscriptionId, billingPeriodStart). Clicking twice produces zero extra charges.
            </p>
          </div>
        </section>

        {/* Section: Go Live in Weeks, Not Months */}
        <section className="py-16 border-t border-[#e8e8e3]">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-mono font-bold text-[#dc4a22] uppercase tracking-wider block mb-2">
              DEPLOYMENT FLEXIBILITY
            </span>
            <h2 className="text-3xl font-serif font-normal text-[#1c1b1a]">
              Go live in weeks, not months.
            </h2>
            <p className="text-xs text-[#6e6d6a] mt-1">
              Start locally with Docker Compose or run in your private VPC with complete database control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-6 rounded-2xl border border-[#e8e8e3] bg-white shadow-sm space-y-3">
              <Server className="size-5 text-[#dc4a22]" />
              <h3 className="text-sm font-bold text-[#1c1b1a]">On-premise / Laptop deployment</h3>
              <p className="text-[#6e6d6a] leading-relaxed">
                Run the entire BillPilot monorepo locally via <code>docker compose up</code> or Homebrew (PostgreSQL 16 and Redis 7).
                Zero proprietary cloud dependencies.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#e8e8e3] bg-white shadow-sm space-y-3">
              <Lock className="size-5 text-[#dc4a22]" />
              <h3 className="text-sm font-bold text-[#1c1b1a]">Granular access control (RBAC)</h3>
              <p className="text-[#6e6d6a] leading-relaxed">
                Role-based access controls for ADMIN, STAFF, and CUSTOMER enforced on every route. Customer queries are automatically scoped by customerId taken from verified JWT tokens.
              </p>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
