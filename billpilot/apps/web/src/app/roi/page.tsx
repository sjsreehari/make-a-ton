"use client";

import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/Navbar";
import { MarketingFooter } from "@/components/marketing/Footer";
import {
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Layers,
  BarChart3,
  Percent,
} from "lucide-react";

export default function RoiPage() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#1c1b1a] selection:bg-[#dc4a22]/20 font-sans antialiased">
      <MarketingNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-24">
        {/* Hero Section matching Image 1 */}
        <div className="text-left max-w-4xl mb-12">
          <h1 className="text-4xl sm:text-6xl font-serif font-normal text-[#1c1b1a] tracking-tight leading-[1.1] mb-5">
            Every billing rupee, and{" "}
            <span className="italic text-[#dc4a22] font-serif font-medium">what it brought you</span>
          </h1>

          <p className="text-sm text-[#6e6d6a] max-w-xl leading-relaxed mb-8">
            Cross-reference recurring revenue with collection velocity, proration data, and recovered dunning cash in one view.
          </p>

          <div className="flex items-center gap-3 mb-10">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-semibold bg-[#1c1b1a] hover:bg-black text-white shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <span>Explore Operations ROI</span>
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/portal"
              className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white border border-[#d9d9d4] hover:bg-[#f2f2ee] text-[#1c1b1a] shadow-sm transition-all"
            >
              Customer Portal
            </Link>
          </div>

          {/* Stats Bar Row matching Image 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 rounded-2xl bg-white border border-[#e8e8e3] shadow-sm">
            <div>
              <span className="text-4xl font-serif font-bold text-[#1c1b1a] block">3.2x</span>
              <span className="text-xs text-[#6e6d6a] mt-1 block">Faster Month-End Closing</span>
            </div>
            <div>
              <span className="text-4xl font-serif font-bold text-emerald-600 block">+31%</span>
              <span className="text-xs text-[#6e6d6a] mt-1 block">On-Time Invoice Collections</span>
            </div>
            <div>
              <span className="text-4xl font-serif font-bold text-[#dc4a22] block">-38%</span>
              <span className="text-xs text-[#6e6d6a] mt-1 block">Involuntary Dunning Churn</span>
            </div>
          </div>
        </div>

        {/* Section: Hierarchy of Methods */}
        <section className="py-14 border-t border-[#e8e8e3]">
          <div className="rounded-2xl border border-[#e8e8e3] bg-[#f4f4f0] p-8 sm:p-12">
            <div className="max-w-2xl mb-8">
              <span className="text-[11px] font-mono font-bold text-[#dc4a22] uppercase tracking-wider block mb-2">
                FINANCIAL INTEGRITY SAFEGUARDS
              </span>
              <h2 className="text-3xl font-serif font-normal text-[#1c1b1a]">
                BillPilot uses a hierarchy of safeguards, so every rupee gets attributed.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="p-5 rounded-xl bg-white border border-[#e0e0da] shadow-sm space-y-2">
                <span className="font-mono text-[#dc4a22] font-bold text-[11px] block">01. COMPOSITE KEY LOCKING</span>
                <h3 className="font-bold text-[#1c1b1a]">Zero Duplicate Billing</h3>
                <p className="text-[#6e6d6a] leading-relaxed">
                  Database constraint on (subscriptionId, billingPeriodStart) guarantees only one invoice is ever created per billing cycle.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-[#e0e0da] shadow-sm space-y-2">
                <span className="font-mono text-[#dc4a22] font-bold text-[11px] block">02. CONCURRENCY-SAFE DISCOUNTS</span>
                <h3 className="font-bold text-[#1c1b1a]">Atomic Voucher Limits</h3>
                <p className="text-[#6e6d6a] leading-relaxed">
                  Usage-limited promo codes execute atomic database counter updates, preventing coupon exhaustion leaks even during bulk billing runs.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-[#e0e0da] shadow-sm space-y-2">
                <span className="font-mono text-[#dc4a22] font-bold text-[11px] block">03. ISOLATED READ-ONLY VIEWS</span>
                <h3 className="font-bold text-[#1c1b1a]">Safe AI Finance Assistant</h3>
                <p className="text-[#6e6d6a] leading-relaxed">
                  Text-to-SQL is strictly restricted to read-only views (v_invoices, v_mrr_monthly), executing single-SELECT queries with row limits and zero PII.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Three signals that tell you whether it's working (Progress bar split) */}
        <section className="py-14 border-t border-[#e8e8e3]">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-mono font-bold text-[#dc4a22] uppercase tracking-wider block mb-2">
              COLLECTION SIGNALS
            </span>
            <h2 className="text-3xl font-serif font-normal text-[#1c1b1a]">
              Three signals that tell you not just what was billed, but whether it was collected.
            </h2>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#e8e8e3] shadow-sm space-y-4">
            <div className="flex justify-between text-xs font-semibold text-[#1c1b1a]">
              <span>Settlement Channel Breakdown</span>
              <span className="text-emerald-600 font-mono">₹38,24,500 Total Collected This Month</span>
            </div>

            {/* Progress Split Bar matching Image 1 */}
            <div className="w-full h-3 rounded-full bg-[#f0f0eb] overflow-hidden flex">
              <div className="h-full bg-[#dc4a22] w-[62%]" title="62% Razorpay Instant Settlement" />
              <div className="h-full bg-emerald-500 w-[38%]" title="38% Bank Transfer Reconciled" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
              <div>
                <span className="text-2xl font-serif font-bold text-[#dc4a22] block">62%</span>
                <span className="text-zinc-600 text-[11px]">Razorpay Payment Links (Instant Settlement)</span>
              </div>
              <div>
                <span className="text-2xl font-serif font-bold text-emerald-600 block">38%</span>
                <span className="text-zinc-600 text-[11px]">Bank Statement CSV (Fuzzy Auto-Reconciled)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Distinguishing between Voluntary Changes and Involuntary Failures */}
        <section className="py-14 border-t border-[#e8e8e3]">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-mono font-bold text-[#dc4a22] uppercase tracking-wider block mb-2">
              CHURN SEGREGATION
            </span>
            <h2 className="text-3xl font-serif font-normal text-[#1c1b1a]">
              BillPilot distinguishes between voluntary changes and involuntary payment failures.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#e8e8e3] shadow-sm space-y-3">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                VOLUNTARY
              </span>
              <h3 className="text-base font-bold text-[#1c1b1a]">Customer Portal Self-Service</h3>
              <p className="text-xs text-[#6e6d6a] leading-relaxed">
                When customers upgrade seats or pause plans, they see an exact prorated price preview before confirming. Finance teams never spend hours issuing credit memos manually.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#dc4a22]/30 bg-[#fff7f2] shadow-sm space-y-3">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-[#dc4a22]/10 text-[#dc4a22] border border-[#dc4a22]/20 font-semibold">
                INVOLUNTARY
              </span>
              <h3 className="text-base font-bold text-[#1c1b1a]">Payment Rescue Recovery Engine</h3>
              <p className="text-xs text-[#6e6d6a] leading-relaxed">
                Expired cards and bank errors don&apos;t mean lost revenue. BillPilot automatically classifies failures and executes timed retries, recovering ₹42,500 this week alone.
              </p>
            </div>
          </div>
        </section>

        {/* Section: No Manual Tracking. No Spreadsheets. */}
        <section className="py-14 border-t border-[#e8e8e3]">
          <div className="max-w-2xl mb-8">
            <h2 className="text-3xl font-serif font-normal text-[#1c1b1a]">
              No manual tracking. No spreadsheets built from memory at the end of the quarter.
            </h2>
            <p className="text-xs text-[#6e6d6a] mt-2">
              All metrics update continuously in real-time as invoices are confirmed and settled.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#e8e8e3] shadow-sm">
              <span className="text-4xl font-serif font-bold text-[#1c1b1a] block">₹5.14 Cr</span>
              <span className="text-xs text-[#6e6d6a] mt-1 block">Annualized Recurring Revenue (ARR) Tracked</span>
              <div className="w-full h-2 rounded-full bg-[#f0f0eb] overflow-hidden mt-4">
                <div className="h-full bg-[#dc4a22] w-[88%]" />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#e8e8e3] shadow-sm">
              <span className="text-4xl font-serif font-bold text-emerald-600 block">58%</span>
              <span className="text-xs text-[#6e6d6a] mt-1 block">Reduction in Time Spent on Month-End Reconciliation</span>
              <div className="w-full h-2 rounded-full bg-[#f0f0eb] overflow-hidden mt-4">
                <div className="h-full bg-emerald-500 w-[58%]" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
