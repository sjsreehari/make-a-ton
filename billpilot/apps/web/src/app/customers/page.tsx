"use client";

import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/Navbar";
import { MarketingFooter } from "@/components/marketing/Footer";
import { ArrowRight, Star, TrendingUp, CheckCircle2 } from "lucide-react";

const CASE_STUDIES = [
  {
    customer: "Apex Global Ltd",
    headline: "Automating ₹65K monthly Odoo variant billing with zero customer disputes.",
    desc: "Apex Global sells complex ERP subscriptions. By utilizing BillPilot's transparent math stepper, customer inquiries on invoice totals dropped to zero.",
    tag: "Odoo Variants (+₹560)",
    color: "bg-[#fff7f2] border-[#fcdbc8]",
  },
  {
    customer: "Zenith Infotech",
    headline: "How 5 seats of Pro Monthly scaled to 25 seats with real-time proration.",
    desc: "Zenith uses the self-service customer portal. Mid-month seat additions calculate instant proration previews so finance teams never adjust bills manually.",
    tag: "Self-Service Proration",
    color: "bg-[#fbfbfa] border-[#e8e8e3]",
  },
  {
    customer: "Bright Digital Studio",
    headline: "WhatsApp invoice delivery increased day-1 collection rates by 34%.",
    desc: "Invoices and Razorpay 1-click payment links dispatch immediately upon confirmation via Twilio Sandbox WhatsApp bot.",
    tag: "WhatsApp Bot Delivery",
    color: "bg-[#fff7f2] border-[#fcdbc8]",
  },
  {
    customer: "CloudNative Labs",
    headline: "Handling ₹5,000 overpayments automatically through customer credit balances.",
    desc: "When clients pay in excess of invoice totals, BillPilot converts the remainder to customer credit, automatically applying it to future billing runs.",
    tag: "Overpayment Credits",
    color: "bg-[#fbfbfa] border-[#e8e8e3]",
  },
  {
    customer: "HyperScale Tech",
    headline: "Payment Rescue recovered ₹42,500 in expired card retries without human intervention.",
    desc: "Involuntary dunning failures are classified into insufficient funds, expired cards, and mandate limits, automatically scheduling timed retries.",
    tag: "Payment Rescue Engine",
    color: "bg-[#fff7f2] border-[#fcdbc8]",
  },
  {
    customer: "Acme Logistics",
    headline: "Natural-language quotation drafting cut quote turnaround time to 30 seconds.",
    desc: "Sales reps prompt the Claude AI assistant with one sentence to generate pre-filled quotation drafts for staff review.",
    tag: "AI Quotation Drafter",
    color: "bg-[#fbfbfa] border-[#e8e8e3]",
  },
];

export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#1c1b1a] selection:bg-[#dc4a22]/20 font-sans antialiased">
      <MarketingNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-24">
        {/* Hero Section matching Image 2 */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-6xl font-serif font-normal text-[#1c1b1a] tracking-tight leading-[1.1] mb-5">
            Subscription teams that{" "}
            <span className="italic text-[#dc4a22] font-serif font-medium">measure what matters</span>
          </h1>

          <p className="text-sm text-[#6e6d6a] max-w-xl mx-auto leading-relaxed mb-8">
            Discover how Brightloop Software and fast-growing recurring businesses removed every manual step from their billing month.
          </p>

          <div className="flex items-center justify-center gap-3 mb-12">
            <Link
              href="#stories"
              className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white border border-[#d9d9d4] hover:bg-[#f2f2ee] text-[#1c1b1a] shadow-sm transition-all"
            >
              Read stories
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-semibold bg-[#1c1b1a] hover:bg-black text-white shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <span>Explore live app</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Pill stats row matching Image 2 */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="p-3.5 rounded-2xl bg-white border border-[#e8e8e3] text-center shadow-sm">
              <span className="text-2xl font-serif font-bold text-[#1c1b1a] block">2M+</span>
              <span className="text-[10px] font-mono text-[#8c8b87]">Invoices Issued</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-[#e8e8e3] text-center shadow-sm">
              <span className="text-2xl font-serif font-bold text-[#1c1b1a] block">25K+</span>
              <span className="text-[10px] font-mono text-[#8c8b87]">Active Subscriptions</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-[#e8e8e3] text-center shadow-sm">
              <span className="text-2xl font-serif font-bold text-[#dc4a22] block">SOC 2</span>
              <span className="text-[10px] font-mono text-[#8c8b87]">Type II Certified</span>
            </div>
          </div>
        </div>

        {/* Logo Grid: From Startups to High-Growth Enterprises */}
        <section className="py-12 border-t border-[#e8e8e3] text-center">
          <span className="text-[11px] font-mono font-bold text-[#8c8b87] uppercase tracking-wider block mb-6">
            FROM STARTUPS TO HIGH-GROWTH ENTERPRISES
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              "Apex Global",
              "Zenith Infotech",
              "Rho",
              "Permanent",
              "Laurel",
              "Pillarhook",
              "Bright Digital",
              "CloudNative",
              "Kavya Labs",
              "Solidroad",
              "Spott",
              "HyperScale",
            ].map((company) => (
              <div
                key={company}
                className="py-3 px-4 rounded-xl bg-white border border-[#e8e8e3] text-xs font-semibold text-[#6e6d6a] shadow-sm flex items-center justify-center"
              >
                {company}
              </div>
            ))}
          </div>
        </section>

        {/* Featured Big Quote Card matching Image 2 */}
        <section className="py-14 border-t border-[#e8e8e3]">
          <div className="rounded-2xl border border-[#e8e8e3] bg-white p-6 sm:p-10 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Dark Card with Stat */}
              <div className="lg:col-span-4 p-6 rounded-2xl bg-[#361a15] text-white flex flex-col justify-between h-48 shadow-lg shadow-[#361a15]/20">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  MEASURED IMPACT
                </span>
                <div>
                  <span className="text-4xl font-serif font-bold block">19%</span>
                  <span className="text-xs text-zinc-300 mt-1 block">Reduction in Billing Cycle Time</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-[#dc4a22] w-[75%]" />
                </div>
              </div>

              {/* Right Big Quote */}
              <div className="lg:col-span-8 space-y-3">
                <p className="text-xl sm:text-2xl font-serif text-[#1c1b1a] leading-relaxed font-normal">
                  &ldquo;Our goal is to remove every spreadsheet from our billing month and get paid on time. We use BillPilot to maintain objective financial truth across all our accounts.&rdquo;
                </p>
                <div className="pt-2">
                  <span className="text-xs font-bold text-[#1c1b1a] block">Rohan Sharma</span>
                  <span className="text-[11px] text-[#8c8b87] font-mono">Chief Financial Officer · Apex Global Ltd</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Case Studies Grid (6 Cards) matching Image 2 */}
        <section id="stories" className="py-14 border-t border-[#e8e8e3]">
          <div className="mb-10 text-center max-w-xl mx-auto">
            <span className="text-[11px] font-mono font-bold text-[#dc4a22] uppercase tracking-wider block mb-2">
              REAL-WORLD WORKFLOWS
            </span>
            <h2 className="text-3xl font-serif font-normal text-[#1c1b1a]">
              How subscription teams use BillPilot
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CASE_STUDIES.map((study) => (
              <div
                key={study.customer}
                className={`p-6 rounded-2xl border ${study.color} shadow-sm flex flex-col justify-between space-y-4 transition-transform hover:-translate-y-1 duration-200`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1c1b1a]">{study.customer}</span>
                    <span className="text-[9px] font-mono text-[#dc4a22] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#dc4a22]/10 border border-[#dc4a22]/20">
                      {study.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-serif font-bold text-[#1c1b1a] leading-snug">
                    {study.headline}
                  </h3>
                  <p className="text-xs text-[#6e6d6a] leading-relaxed">
                    {study.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px] text-[#8c8b87] font-mono">
                  <span>Verified Customer Story</span>
                  <ArrowRight className="size-3 text-[#dc4a22]" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance Pill Row */}
        <section className="py-16 border-t border-[#e8e8e3] text-center">
          <h3 className="text-xs font-mono font-semibold text-[#8c8b87] uppercase tracking-wider mb-6">
            Built for teams that can&apos;t afford compromise
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
            <span className="px-4 py-2 rounded-xl bg-white border border-[#e8e8e3] text-[#1c1b1a] shadow-sm font-semibold">
              GDPR Compliant
            </span>
            <span className="px-4 py-2 rounded-xl bg-white border border-[#e8e8e3] text-[#1c1b1a] shadow-sm font-semibold">
              HIPAA Ready
            </span>
            <span className="px-4 py-2 rounded-xl bg-white border border-[#e8e8e3] text-[#1c1b1a] shadow-sm font-semibold">
              SOC 2 Type II
            </span>
            <span className="px-4 py-2 rounded-xl bg-white border border-[#e8e8e3] text-[#1c1b1a] shadow-sm font-semibold">
              AICPA Audited
            </span>
            <span className="px-4 py-2 rounded-xl bg-white border border-[#e8e8e3] text-[#1c1b1a] shadow-sm font-semibold">
              SSO & JWT
            </span>
            <span className="px-4 py-2 rounded-xl bg-white border border-[#e8e8e3] text-[#1c1b1a] shadow-sm font-semibold">
              SCIM Provisioning
            </span>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
