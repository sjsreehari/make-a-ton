"use client";

import { useState } from "react";
import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/Navbar";
import { MarketingFooter } from "@/components/marketing/Footer";
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  Layers,
  FileText,
  CreditCard,
  Bot,
  AlertTriangle,
  TrendingUp,
  Smartphone,
  Sparkles,
  PlayCircle,
  BarChart3,
  Lock,
  RefreshCw,
  FileCheck2,
  Users,
  Check,
  ShieldCheck,
  Clock,
  Terminal,
  Calculator,
  Search,
  ExternalLink,
} from "lucide-react";

export default function LandingPage() {
  const [activeStoryDay, setActiveStoryDay] = useState(0);
  const [demoSeats, setDemoSeats] = useState(10);
  const [includeOdoo, setIncludeOdoo] = useState(true);
  const [scanQuery, setScanQuery] = useState("");
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Math for the interactive billing calculator
  const baseRate = 2499; // Pro Monthly
  const odooRate = includeOdoo ? 560 : 0;
  const unitPrice = baseRate + odooRate;
  const subtotal = demoSeats * unitPrice;
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult("Scanned 5,240 subscriptions: 3 uninvoiced active contracts found (₹42,000) · 2 expired discounts still active (₹18,500) · 1-click remediation ready.");
    }, 900);
  };

  const STORY_STEPS = [
    {
      day: "Day 1",
      title: "Onboarding & Access Control",
      badge: "ROLE-BASED SECURITY",
      desc: "Admin provisions staff roles. Customers sign up with strict enterprise password hashing (argon2, length ≥ 9, uppercase, lowercase, special character). Customer data is isolated strictly by customerId on the server.",
      stat: "100% server-enforced scoping",
    },
    {
      day: "Day 5",
      title: "Quotation from Template & Odoo Variant",
      badge: "QUOTATION ENGINE",
      desc: "Staff pre-fills complex enterprise quotes in 1-click. Configured variants (e.g. Brand: Odoo +₹560/seat) are calculated dynamically with sales margins. Or staff says it to the AI in one sentence.",
      stat: "Instant margin verification",
    },
    {
      day: "Day 15",
      title: "Confirmed Subscription & Lifecycle State",
      badge: "STATE MACHINE",
      desc: "Quote moves Draft → Quotation → Confirmed → Active. Allowed switches (pause, early-close, renew, auto-close) are strictly checked against plan rules before any lifecycle transition executes.",
      stat: "SUB-2026-000123 number generated",
    },
    {
      day: "Billing Day",
      title: "Automated Idempotent Billing Run",
      badge: "ZERO DUPLICATES",
      desc: "Scheduled cron or manual bulk billing iterates through all due subscriptions. Pre-run dry check flags anomalies (>30% jump, missing tax). Composite DB constraint guarantees zero duplicates.",
      stat: "482 created · 4,758 skipped · 0 failed",
    },
    {
      day: "Instant Delivery",
      title: "WhatsApp Dispatch & Razorpay Link",
      badge: "OMNICHANNEL COMMS",
      desc: "The moment an invoice is confirmed, customer receives an automated WhatsApp message with GST-ready PDF invoice and a Razorpay 1-click payment link. Customers can reply 'why is my bill higher?' for an instant breakdown.",
      stat: "Twilio Sandbox + Razorpay verified",
    },
    {
      day: "Cash in Bank",
      title: "Webhook Auto-Reconcile & Recovery",
      badge: "AUTOMATED SETTLEMENT",
      desc: "Customer pays via UPI or card. Webhook HMAC signature is verified, invoice flips to PAID, receipt is dispatched, and bank CSV statement is fuzzy-matched. Failed payments enter smart retry rescue.",
      stat: "₹42,500 involuntary churn saved",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#1c1b1a] selection:bg-[#dc4a22]/20 font-sans antialiased overflow-x-hidden">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#fbfbfa]/90 border-b border-[#e8e8e3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="size-7 rounded-lg bg-[#dc4a22] flex items-center justify-center text-white shadow-sm shadow-[#dc4a22]/30">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 19 21 12 17 5 21 12 2" />
                </svg>
              </div>
              <span className="font-bold text-base tracking-tight text-[#1c1b1a]">
                billpilot
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#6e6d6a]">
              <a href="#story" className="hover:text-[#1c1b1a] transition-colors">Lifecycle</a>
              <a href="#features" className="hover:text-[#1c1b1a] transition-colors">Modules</a>
              <a href="#margins" className="hover:text-[#1c1b1a] transition-colors">Margins</a>
              <a href="#explainer" className="hover:text-[#1c1b1a] transition-colors">Bill Explainer</a>
              <a href="#leakage" className="hover:text-[#1c1b1a] transition-colors">Leakage Detector</a>
              <Link href="/portal" className="text-[#dc4a22] font-semibold hover:underline">Customer Portal</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-full text-xs font-medium text-[#6e6d6a] hover:text-[#1c1b1a] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#1c1b1a] hover:bg-black text-white shadow-sm transition-all transform hover:-translate-y-0.5"
            >
              <span>Launch App</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Cute Mascot */}
      <section className="pt-16 pb-14 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        {/* Cute Mascot Stool Illustration */}
        <div className="flex justify-center mb-6">
          <div className="relative group">
            {/* Mascot Character Representation */}
            <div className="size-20 rounded-full bg-gradient-to-tr from-[#dc4a22] via-[#e55931] to-[#f2744c] flex items-center justify-center shadow-xl shadow-[#dc4a22]/25 relative mx-auto transform transition-transform group-hover:scale-105 duration-300">
              {/* Cute Eyes & Smile */}
              <div className="flex items-center gap-3 relative z-10">
                <div className="size-3 rounded-full bg-[#1c1b1a] flex items-center justify-center">
                  <div className="size-1 rounded-full bg-white ml-0.5 mb-0.5" />
                </div>
                <div className="size-3 rounded-full bg-[#1c1b1a] flex items-center justify-center">
                  <div className="size-1 rounded-full bg-white ml-0.5 mb-0.5" />
                </div>
              </div>
              <div className="absolute bottom-4 w-3.5 h-1.5 rounded-full border-b-2 border-[#1c1b1a]" />
              {/* Cute Pilot Earflap / Wings */}
              <div className="absolute -left-1.5 top-6 size-3.5 rounded-full bg-[#b83815]" />
              <div className="absolute -right-1.5 top-6 size-3.5 rounded-full bg-[#b83815]" />
            </div>

            {/* Little Stool Legs */}
            <div className="flex justify-center gap-4 -mt-2">
              <div className="w-1.5 h-6 bg-[#d1cfc7] rounded-full transform -rotate-12" />
              <div className="w-1.5 h-6 bg-[#d1cfc7] rounded-full" />
              <div className="w-1.5 h-6 bg-[#d1cfc7] rounded-full transform rotate-12" />
            </div>

            {/* Decorative Floating Coins */}
            <div className="absolute -left-10 top-4 size-6 rounded-full bg-[#f4ebcf] border border-[#d9ceab] flex items-center justify-center text-[10px] font-mono font-bold text-[#8c783e] shadow-sm">
              ₹
            </div>
            <div className="absolute -right-8 top-8 size-5 rounded-full bg-[#f4ebcf] border border-[#d9ceab] flex items-center justify-center text-[9px] font-mono font-bold text-[#8c783e] shadow-sm">
              ₹
            </div>
          </div>
        </div>

        {/* Hero Headline in Editorial Serif */}
        <h1 className="text-4xl sm:text-6xl font-serif tracking-tight text-[#1c1b1a] leading-[1.1] mb-5 font-normal">
          Turn your subscription team <br className="hidden sm:inline" />
          into a <span className="italic font-serif font-medium text-[#dc4a22]">revenue factory</span>
        </h1>

        <p className="text-sm sm:text-base text-[#6e6d6a] max-w-2xl mx-auto leading-relaxed mb-8">
          We removed every manual step in the billing month, from the quote to the cash in the bank. Automated idempotent invoices, WhatsApp dunning, and AI finance assistant.
        </p>

        {/* Hero Buttons */}
        <div className="flex items-center justify-center gap-3 mb-14">
          <Link
            href="/portal"
            className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white border border-[#d9d9d4] hover:bg-[#f2f2ee] text-[#1c1b1a] shadow-sm transition-all"
          >
            Customer Portal
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-semibold bg-[#1c1b1a] hover:bg-black text-white shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <span>Launch Operations</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Trusted By Strip */}
        <p className="text-[11px] font-mono text-[#8c8b87] uppercase tracking-wider mb-4">
          Trusted by high-growth recurring software teams at Brightloop
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-[#8c8b87] mb-12">
          <span>Apex Global Ltd</span>
          <span>Zenith Infotech</span>
          <span>Bright Digital</span>
          <span>CloudNative Labs</span>
          <span>HyperScale Tech</span>
          <span>Acme Logistics</span>
        </div>

        {/* Floating Pill Statistics Box */}
        <div className="rounded-2xl border border-[#e8e8e3] bg-white shadow-xl shadow-[#1c1b1a]/5 p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-[#e8e8e3]">
            <div className="pt-2 sm:pt-0">
              <span className="text-3xl font-serif font-bold text-[#1c1b1a] block">2M+</span>
              <span className="text-[11px] text-[#6e6d6a] mt-1 block">Invoices Processed</span>
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-4">
              <span className="text-3xl font-serif font-bold text-[#1c1b1a] block">25K+</span>
              <span className="text-[11px] text-[#6e6d6a] mt-1 block">Active Subscriptions</span>
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-4">
              <span className="text-3xl font-serif font-bold text-[#dc4a22] block">100%</span>
              <span className="text-[11px] text-[#6e6d6a] mt-1 block">Zero Duplicate Billing</span>
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-4">
              <span className="text-3xl font-serif font-bold text-[#1c1b1a] block">8002</span>
              <span className="text-[11px] text-[#6e6d6a] mt-1 block">Bank CSV Reconciliations</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Infinity Loop Workflow */}
      <section id="story" className="py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-[#e8e8e3]">
        <div className="max-w-2xl mb-12">
          <span className="text-[11px] font-mono font-bold text-[#dc4a22] uppercase tracking-wider block mb-2">
            REVENUE LEAKAGE DETECTOR
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#1c1b1a] leading-tight">
            Find where cash is leaking, from quote to production.
          </h2>
          <p className="text-xs text-[#6e6d6a] mt-2">
            BillPilot continuously audits contract expiration, tax configurations, and uninvoiced usage to plug silent revenue drains.
          </p>
        </div>

        {/* Visual Infinity Loop Diagram Graphic */}
        <div className="rounded-2xl border border-[#e8e8e3] bg-[#f4f4f0] p-8 sm:p-12 relative overflow-hidden text-center">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center relative z-10">
            <div className="p-4 rounded-xl bg-white border border-[#e0e0da] shadow-sm">
              <span className="text-[10px] font-mono text-[#8c8b87] block">INPUT</span>
              <span className="text-xs font-semibold text-[#1c1b1a] mt-1 block">Quotation & Odoo Addon</span>
            </div>

            <div className="hidden sm:flex justify-center text-[#8c8b87]">
              <ArrowRight className="size-4" />
            </div>

            {/* Glowing Orange Hub */}
            <div className="p-5 rounded-2xl bg-[#dc4a22] text-white shadow-lg shadow-[#dc4a22]/30 transform scale-105">
              <span className="text-[10px] font-mono uppercase tracking-wider block text-white/80">CORE ENGINE</span>
              <span className="text-sm font-bold block mt-1">Idempotent Billing Run</span>
              <span className="text-[10px] block mt-0.5 text-white/90">0 Duplicates · 0 Skips</span>
            </div>

            <div className="hidden sm:flex justify-center text-[#8c8b87]">
              <ArrowRight className="size-4" />
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#e0e0da] shadow-sm">
              <span className="text-[10px] font-mono text-[#8c8b87] block">SETTLED</span>
              <span className="text-xs font-semibold text-[#1c1b1a] mt-1 block">WhatsApp PDF + Razorpay</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Mockup Dashboard Window */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-[#e8e8e3]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[11px] font-mono font-bold text-[#dc4a22] uppercase tracking-wider block">
              OPERATIONAL VELOCITY
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#1c1b1a] leading-tight">
              Turn AI adoption into engineering output.
            </h2>
            <p className="text-xs text-[#6e6d6a] leading-relaxed">
              Every state change writes an immutable audit record and fires a typed domain event. Automated schedulers close expired contracts, trigger 7-day dunning notices, and auto-reconcile bank transfers.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#dc4a22] hover:underline"
              >
                <span>Explore the operations dashboard</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* Clean macOS Mockup Window */}
          <div className="lg:col-span-7 rounded-2xl border border-[#e8e8e3] bg-white shadow-xl shadow-[#1c1b1a]/5 overflow-hidden">
            <div className="px-4 py-3 border-b border-[#f0f0eb] bg-[#fbfbfa] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-[#e0564c]" />
                <div className="size-2.5 rounded-full bg-[#f4b840]" />
                <div className="size-2.5 rounded-full bg-[#5fc454]" />
                <span className="text-[10px] font-mono text-[#8c8b87] ml-2">billpilot_operations_v2</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ● LIVE RUN
              </span>
            </div>

            <div className="p-4 sm:p-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#f0f0eb] text-[#8c8b87] pb-2">
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Plan / Variant</th>
                    <th className="pb-2 font-medium">Monthly Rate</th>
                    <th className="pb-2 font-medium">Collection</th>
                    <th className="pb-2 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f7f7f4]">
                  <tr>
                    <td className="py-3 font-semibold text-[#1c1b1a]">Apex Global Ltd</td>
                    <td className="py-3 text-[#6e6d6a]">Odoo Subscription (+₹560)</td>
                    <td className="py-3 font-mono font-medium">₹65,596.20</td>
                    <td className="py-3">
                      <div className="w-20 h-1.5 rounded-full bg-[#f0f0eb] overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[95%]" />
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        PAID
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-[#1c1b1a]">Zenith Infotech</td>
                    <td className="py-3 text-[#6e6d6a]">Pro Monthly (5 seats)</td>
                    <td className="py-3 font-mono font-medium">₹14,744.10</td>
                    <td className="py-3">
                      <div className="w-20 h-1.5 rounded-full bg-[#f0f0eb] overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[100%]" />
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        PAID
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-[#1c1b1a]">Kavya Enterprises</td>
                    <td className="py-3 text-[#6e6d6a]">Starter Monthly (3 seats)</td>
                    <td className="py-3 font-mono font-medium">₹3,536.40</td>
                    <td className="py-3">
                      <div className="w-20 h-1.5 rounded-full bg-[#f0f0eb] overflow-hidden">
                        <div className="h-full bg-amber-500 w-[45%]" />
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                        OVERDUE (3d)
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Unit Economics & Margins [REQ 2.6] */}
      <section id="margins" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-[#e8e8e3]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[11px] font-mono font-bold text-[#dc4a22] uppercase tracking-wider block">
              UNIT ECONOMICS & MARGINS
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#1c1b1a] leading-tight">
              Get more output from every AI dollar.
            </h2>
            <p className="text-xs text-[#6e6d6a] leading-relaxed">
              Every plan and product variant maintains real-time cost versus sales price visibility. The margin-aware discount simulator blocks coupons below minimum profitability thresholds.
            </p>
            <div className="flex gap-6 pt-2">
              <div>
                <span className="text-2xl font-serif font-bold text-[#1c1b1a] block">60M+</span>
                <span className="text-[10px] font-mono text-[#8c8b87]">Total API Invocations</span>
              </div>
              <div>
                <span className="text-2xl font-serif font-bold text-[#1c1b1a] block">25K</span>
                <span className="text-[10px] font-mono text-[#8c8b87]">Active Seats</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-2xl border border-[#e8e8e3] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f0eb] text-xs font-semibold text-[#1c1b1a]">
              <span>Plan & Product Tier</span>
              <span>Profit Margin (%)</span>
            </div>
            <div className="space-y-4 pt-4 text-xs">
              <div>
                <div className="flex justify-between font-mono text-[11px] mb-1">
                  <span className="font-semibold text-[#1c1b1a]">Odoo Subscription Monthly (+₹560 variant)</span>
                  <span className="text-emerald-600 font-bold">83.3% Margin</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#f0f0eb] overflow-hidden">
                  <div className="h-full bg-[#dc4a22] w-[83.3%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-mono text-[11px] mb-1">
                  <span className="font-semibold text-[#1c1b1a]">Pro Monthly (₹2,499.00 base)</span>
                  <span className="text-emerald-600 font-bold">82.0% Margin</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#f0f0eb] overflow-hidden">
                  <div className="h-full bg-[#dc4a22] w-[82.0%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-mono text-[11px] mb-1">
                  <span className="font-semibold text-[#1c1b1a]">Starter Monthly (₹999.00)</span>
                  <span className="text-emerald-600 font-bold">84.0% Margin</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#f0f0eb] overflow-hidden">
                  <div className="h-full bg-[#dc4a22] w-[84.0%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-mono text-[11px] mb-1">
                  <span className="font-semibold text-[#1c1b1a]">Enterprise Monthly (₹9,999.00)</span>
                  <span className="text-emerald-600 font-bold">77.5% Margin</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#f0f0eb] overflow-hidden">
                  <div className="h-full bg-[#dc4a22] w-[77.5%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Terminal + "Why is my bill ₹X?" Interactive Widget [REQ 4.9] */}
      <section id="explainer" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-[#e8e8e3]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-mono font-bold text-[#dc4a22] uppercase tracking-wider block mb-2">
            TRANSPARENT BILL MATH
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#1c1b1a] leading-tight">
            Match every prompt to the right model. Match every bill to the right payment.
          </h2>
          <p className="text-xs text-[#6e6d6a] mt-2">
            No more customers calling support asking &quot;why is my bill this amount?&quot;. Transparent math stepper pre-calculated dynamically.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Dark CLI Terminal Mockup on Left */}
          <div className="lg:col-span-6 rounded-2xl bg-[#141413] border border-[#2b2b28] text-white p-5 font-mono text-xs shadow-2xl space-y-3">
            <div className="flex items-center gap-1.5 pb-3 border-b border-[#2b2b28]">
              <div className="size-2.5 rounded-full bg-[#e0564c]" />
              <div className="size-2.5 rounded-full bg-[#f4b840]" />
              <div className="size-2.5 rounded-full bg-[#5fc454]" />
              <span className="text-[11px] text-[#8c8b87] ml-2">billpilot-cli ~ billing-run</span>
            </div>

            <div className="space-y-1.5 text-[11px] text-zinc-300">
              <p className="text-zinc-500">$ pnpm billpilot:run-billing --period=2026-10</p>
              <p className="text-emerald-400">✔ Composite lock acquired on (subscriptionId, billingPeriodStart)</p>
              <p className="text-zinc-300">✔ 482 invoices generated atomically</p>
              <p className="text-amber-400">✔ 4,758 skipped (&quot;already billed&quot; - 0 duplicates)</p>
              <p className="text-indigo-400">✔ Dispatched 482 WhatsApp PDF receipts via Twilio</p>
              <p className="text-cyan-400">✔ Razorpay webhook HMAC verified (100% replay-safe)</p>
              <p className="text-zinc-500 pt-1">Execution completed in 312ms · 0 errors</p>
            </div>
          </div>

          {/* Interactive Math Stepper on Right */}
          <div className="lg:col-span-6 rounded-2xl border border-[#e8e8e3] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f0eb]">
              <span className="text-xs font-semibold text-[#1c1b1a]">Live Stepper Simulator</span>
              <span className="text-[10px] font-mono text-[#dc4a22] bg-[#dc4a22]/10 px-2 py-0.5 rounded font-semibold">
                Pro Monthly Plan
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium text-[#1c1b1a] mb-1">
                  <span>Quantity / Seats:</span>
                  <span className="font-mono text-[#dc4a22] font-bold">{demoSeats} seats</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={demoSeats}
                  onChange={(e) => setDemoSeats(Number(e.target.value))}
                  className="w-full accent-[#dc4a22]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#f7f7f4] border border-[#e8e8e3] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#1c1b1a] block">Brand: Odoo Integration</span>
                  <span className="text-[11px] text-[#6e6d6a]">+₹560.00 / seat variant add-on</span>
                </div>
                <input
                  type="checkbox"
                  checked={includeOdoo}
                  onChange={(e) => setIncludeOdoo(e.target.checked)}
                  className="size-4 accent-[#dc4a22]"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#fbfbfa] border border-[#e8e8e3] text-xs font-mono space-y-1.5">
                <div className="flex justify-between text-[#6e6d6a]">
                  <span>1. Base Plan Rate:</span>
                  <span className="text-[#1c1b1a]">₹{baseRate}.00</span>
                </div>
                <div className="flex justify-between text-[#6e6d6a]">
                  <span>2. Odoo Variant:</span>
                  <span className="text-[#dc4a22]">+₹{odooRate}.00</span>
                </div>
                <div className="flex justify-between text-[#6e6d6a] pt-1.5 border-t border-[#e8e8e3]">
                  <span>Subtotal ({demoSeats} seats):</span>
                  <span className="text-[#1c1b1a] font-semibold">₹{subtotal.toLocaleString("en-IN")}.00</span>
                </div>
                <div className="flex justify-between text-[#6e6d6a]">
                  <span>3. GST Tax (18% split):</span>
                  <span className="text-[#1c1b1a]">+₹{gst.toLocaleString("en-IN")}.00</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#1c1b1a] pt-2 border-t border-[#d9d9d4]">
                  <span>Total Due:</span>
                  <span className="text-[#dc4a22]">₹{total.toLocaleString("en-IN")}.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Mascot Lineup & WhatsApp Bot */}
      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto text-center border-t border-[#e8e8e3]">
        <h2 className="text-2xl sm:text-3xl font-serif text-[#1c1b1a] mb-2 font-normal">
          Agent Weekly & WhatsApp Billing Bot
        </h2>
        <p className="text-xs text-[#6e6d6a] mb-8">
          Customers manage balances, renew contracts, and download invoices directly from WhatsApp.
        </p>

        {/* Mascot Row */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 mb-10 overflow-x-auto py-2">
          {["Wave", "Quote", "Audit", "Pay", "Bot"].map((role, i) => (
            <div key={role} className="flex flex-col items-center group">
              <div className="size-12 rounded-full bg-[#dc4a22] flex items-center justify-center text-white shadow-md shadow-[#dc4a22]/20 transform transition-transform group-hover:-translate-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="size-1.5 rounded-full bg-white" />
                  <div className="size-1.5 rounded-full bg-white" />
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#8c8b87] mt-1.5">{role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Section 6: Interactive Try-It Leakage Scanner Box */}
      <section id="leakage" className="py-16 px-4 sm:px-6 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-[#e8e8e3] bg-white p-6 sm:p-8 shadow-xl shadow-[#1c1b1a]/5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#f0f0eb]">
            <div className="size-2 rounded-full bg-[#dc4a22]" />
            <span className="text-xs font-semibold text-[#1c1b1a]">Try the Revenue Leakage Scanner</span>
          </div>

          <form onSubmit={handleScan} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter subscription volume (e.g. 5000 subscriptions)..."
              value={scanQuery}
              onChange={(e) => setScanQuery(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-[#f7f7f4] border border-[#e8e8e3] text-[#1c1b1a] placeholder:text-[#8c8b87] focus:outline-none focus:ring-1 focus:ring-[#dc4a22]"
            />
            <button
              type="submit"
              disabled={isScanning}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#dc4a22] hover:bg-[#c83c16] text-white transition-colors disabled:opacity-50"
            >
              {isScanning ? "Scanning..." : "Scan Now →"}
            </button>
          </form>

          {scanResult && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-mono animate-in fade-in">
              {scanResult}
            </div>
          )}

          <div className="space-y-1.5 text-[11px] text-[#6e6d6a] pt-1">
            <p>• Detects uninvoiced active subscriptions in real-time</p>
            <p>• Flags expired discount vouchers still applied</p>
            <p>• Simulates 1-click automatic remediation</p>
          </div>
        </div>
      </section>

      {/* Section 7: Editorial Testimonial & Metric Curve */}
      <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-[#e8e8e3]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <p className="text-2xl sm:text-3xl font-serif text-[#1c1b1a] leading-tight font-normal">
              &ldquo;We use BillPilot to get an objective measurement and keep our billing honest.&rdquo;
            </p>
            <span className="text-xs font-mono text-[#8c8b87] block">
              Chief Financial Officer · Brightloop Software
            </span>
            <div className="flex gap-8 pt-4">
              <div>
                <span className="text-3xl font-serif font-bold text-[#1c1b1a] block">40%</span>
                <span className="text-[11px] text-[#6e6d6a] mt-0.5 block">Cycle Time Cut</span>
              </div>
              <div>
                <span className="text-3xl font-serif font-bold text-[#1c1b1a] block">14 days</span>
                <span className="text-[11px] text-[#6e6d6a] mt-0.5 block">Faster Collections</span>
              </div>
            </div>
          </div>

          {/* Hockey Stick Curve Visualization */}
          <div className="p-6 rounded-2xl border border-[#e8e8e3] bg-white shadow-sm flex flex-col justify-between h-56">
            <div className="flex justify-between text-xs text-[#8c8b87]">
              <span>Recurring Collections Velocity</span>
              <span className="text-emerald-600 font-mono font-bold">+184% ARR</span>
            </div>
            {/* SVG Curve */}
            <div className="h-32 w-full flex items-end">
              <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dc4a22" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#dc4a22" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,90 Q80,85 150,60 T300,10 L300,100 L0,100 Z"
                  fill="url(#curveGrad)"
                />
                <path
                  d="M0,90 Q80,85 150,60 T300,10"
                  fill="none"
                  stroke="#dc4a22"
                  strokeWidth="3"
                />
              </svg>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-[#8c8b87]">
              <span>Day 1: Spreadsheets</span>
              <span>Day 30: 100% Automated</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Trust Badges */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto text-center border-t border-[#e8e8e3]">
        <h3 className="text-xs font-mono font-semibold text-[#8c8b87] uppercase tracking-wider mb-6">
          Built for teams that can&apos;t afford compromise
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-full bg-white border border-[#e8e8e3] text-[#1c1b1a]">SOC 2 Ready</span>
          <span className="px-3 py-1.5 rounded-full bg-white border border-[#e8e8e3] text-[#1c1b1a]">GSTIN Compliant</span>
          <span className="px-3 py-1.5 rounded-full bg-white border border-[#e8e8e3] text-[#1c1b1a]">Razorpay Verified</span>
          <span className="px-3 py-1.5 rounded-full bg-white border border-[#e8e8e3] text-[#1c1b1a]">Twilio Sandbox</span>
          <span className="px-3 py-1.5 rounded-full bg-white border border-[#e8e8e3] text-[#1c1b1a]">Argon2 Hashed</span>
          <span className="px-3 py-1.5 rounded-full bg-white border border-[#e8e8e3] text-[#1c1b1a]">Decimal(14,2) Exact</span>
        </div>
      </section>

      {/* Giant Dark Weave-Style Footer */}
      <footer className="bg-[#0e0e0d] text-white pt-20 pb-12 px-4 sm:px-6 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
            <div>
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-3 font-semibold">
                Operations
              </span>
              <ul className="space-y-2 text-zinc-400">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/subscriptions" className="hover:text-white transition-colors">Subscriptions</Link></li>
                <li><Link href="/invoices" className="hover:text-white transition-colors">Invoices & Billing</Link></li>
                <li><Link href="/billing-run" className="hover:text-white transition-colors">Bulk Billing Run</Link></li>
                <li><Link href="/payments" className="hover:text-white transition-colors">Reconciliation</Link></li>
              </ul>
            </div>

            <div>
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-3 font-semibold">
                Commerce
              </span>
              <ul className="space-y-2 text-zinc-400">
                <li><Link href="/catalog" className="hover:text-white transition-colors">Plans & Products</Link></li>
                <li><Link href="/quotes" className="hover:text-white transition-colors">Quotation Templates</Link></li>
                <li><Link href="/discounts-taxes" className="hover:text-white transition-colors">GST Tax Rules</Link></li>
                <li><Link href="/discounts-taxes" className="hover:text-white transition-colors">Discounts & Margins</Link></li>
              </ul>
            </div>

            <div>
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-3 font-semibold">
                Automation
              </span>
              <ul className="space-y-2 text-zinc-400">
                <li><Link href="/ai-assistant" className="hover:text-white transition-colors">AI Finance Assistant</Link></li>
                <li><Link href="/leakage" className="hover:text-white transition-colors">Leakage Detector</Link></li>
                <li><Link href="/payment-rescue" className="hover:text-white transition-colors">Payment Rescue</Link></li>
                <li><Link href="/communications" className="hover:text-white transition-colors">WhatsApp Bot</Link></li>
              </ul>
            </div>

            <div>
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-3 font-semibold">
                Self-Service
              </span>
              <ul className="space-y-2 text-zinc-400">
                <li><Link href="/portal" className="hover:text-white transition-colors">Customer Portal</Link></li>
                <li><Link href="/portal" className="hover:text-white transition-colors">Proration Previews</Link></li>
                <li><Link href="/audit" className="hover:text-white transition-colors">Audit Trail</Link></li>
                <li><Link href="/settings" className="hover:text-white transition-colors">Staff Settings</Link></li>
              </ul>
            </div>

            <div>
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-3 font-semibold">
                Brightloop
              </span>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                BillPilot was built for the 7-hour Hackathon challenge to remove every manual step in recurring billing.
              </p>
            </div>
          </div>

          {/* Huge Stylized Watermark Logo */}
          <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-6">
            <span className="text-5xl sm:text-7xl font-bold tracking-tighter text-zinc-900 select-none font-sans">
              billpilot
            </span>
            <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All systems normal
              </span>
              <span>© 2026 Brightloop Software</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
