"use client";

import { useState } from "react";
import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/Navbar";
import { MarketingFooter } from "@/components/marketing/Footer";
import { Check, ArrowRight, Sparkles } from "lucide-react";

export default function PricingPage() {
  const [productTab, setProductTab] = useState<"PLATFORM" | "RESCUE">("PLATFORM");
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

  const isYearly = billingCycle === "YEARLY";

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#1c1b1a] selection:bg-[#dc4a22]/20 font-sans antialiased">
      <MarketingNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-24">
        {/* Header Section */}
        <div className="text-left mb-10">
          <h1 className="text-4xl sm:text-5xl font-serif font-normal text-[#1c1b1a] tracking-tight mb-3">
            Pricing
          </h1>
          <p className="text-sm text-[#6e6d6a] max-w-xl leading-relaxed">
            Plans for your subscription team and your billing automation. Choose a product to find your fit.
          </p>
        </div>

        {/* Product and Billing Cycle Selector Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e8e8e3] mb-8">
          {/* Left Pill Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#f0f0eb] border border-[#e0e0da]">
            <button
              onClick={() => setProductTab("PLATFORM")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                productTab === "PLATFORM"
                  ? "bg-white text-[#1c1b1a] shadow-sm font-semibold"
                  : "text-[#6e6d6a] hover:text-[#1c1b1a]"
              }`}
            >
              BillPilot Platform
            </button>
            <button
              onClick={() => setProductTab("RESCUE")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                productTab === "RESCUE"
                  ? "bg-white text-[#1c1b1a] shadow-sm font-semibold"
                  : "text-[#6e6d6a] hover:text-[#1c1b1a]"
              }`}
            >
              WhatsApp & Rescue Engine
            </button>
          </div>

          {/* Right Monthly/Yearly Switcher */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-[#dc4a22]">
              Save 16.7% with yearly billing
            </span>
            <div className="flex items-center p-1 rounded-lg bg-[#f0f0eb] border border-[#e0e0da]">
              <button
                onClick={() => setBillingCycle("MONTHLY")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  billingCycle === "MONTHLY"
                    ? "bg-white text-[#1c1b1a] shadow-sm font-semibold"
                    : "text-[#6e6d6a] hover:text-[#1c1b1a]"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("YEARLY")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  billingCycle === "YEARLY"
                    ? "bg-white text-[#1c1b1a] shadow-sm font-semibold"
                    : "text-[#6e6d6a] hover:text-[#1c1b1a]"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#8c8b87] font-mono mb-8">
          Subscription intelligence for your team. Start free and scale with your recurring revenue.
        </p>

        {/* 3 Pricing Cards Grid matching Image 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Card 1: Starter */}
          <div className="p-7 rounded-2xl border border-[#e8e8e3] bg-white shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#1c1b1a]">Starter</h3>
              <p className="text-xs text-[#6e6d6a] mt-1 mb-6">
                Ideal for basic usage or teams under 5.
              </p>

              <div className="mb-6">
                <span className="text-4xl font-serif font-bold text-[#1c1b1a]">₹0</span>
                <span className="text-xs text-[#8c8b87] block mt-1 font-mono">Free to get started</span>
              </div>

              <Link
                href="/login"
                className="w-full block text-center py-2 px-4 rounded-full text-xs font-semibold bg-white border border-[#d9d9d4] hover:bg-[#f2f2ee] text-[#1c1b1a] transition-colors mb-8 shadow-sm"
              >
                Get Started
              </Link>

              <ul className="space-y-3 text-xs text-[#6e6d6a]">
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#1c1b1a] shrink-0" />
                  <span>Up to 100 active subscriptions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#1c1b1a] shrink-0" />
                  <span>Automated invoice auto-generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#1c1b1a] shrink-0" />
                  <span>GST tax calculation (18%, 12%, 0%)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#1c1b1a] shrink-0" />
                  <span>Customer self-service portal</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#1c1b1a] shrink-0" />
                  <span>Immutable audit log (30 days)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#1c1b1a] shrink-0" />
                  <span>Email notifications via Mailhog</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: Pro (Featured with Dark Button) */}
          <div className="p-7 rounded-2xl border border-[#dc4a22]/30 bg-white shadow-md shadow-[#dc4a22]/5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#dc4a22] text-white text-[9px] font-mono uppercase tracking-wider px-3 py-0.5 rounded-bl-lg font-bold">
              POPULAR
            </div>

            <div>
              <h3 className="text-xl font-serif font-bold text-[#1c1b1a]">Pro</h3>
              <p className="text-xs text-[#6e6d6a] mt-1 mb-6">
                Ideal for small teams aiming for steady expansion.
              </p>

              <div className="mb-6">
                <span className="text-4xl font-serif font-bold text-[#1c1b1a]">
                  {isYearly ? "₹20,825" : "₹2,499"}
                </span>
                <span className="text-xs text-[#6e6d6a] font-mono ml-1">/seat</span>
                <span className="text-xs text-[#8c8b87] block mt-1 font-mono">
                  {isYearly ? "Billed annually (save ₹4,990)" : "Per month, billed monthly"}
                </span>
              </div>

              <Link
                href="/login"
                className="w-full block text-center py-2 px-4 rounded-full text-xs font-semibold bg-[#1c1b1a] hover:bg-black text-white transition-colors mb-8 shadow-sm"
              >
                Get Started
              </Link>

              <ul className="space-y-3 text-xs text-[#6e6d6a]">
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#dc4a22] shrink-0 font-bold" />
                  <span className="text-[#1c1b1a] font-medium">Unlimited subscriptions & seats</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#dc4a22] shrink-0 font-bold" />
                  <span>Odoo product variant add-ons (+₹560)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#dc4a22] shrink-0 font-bold" />
                  <span>Idempotent bulk billing run (0 duplicates)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#dc4a22] shrink-0 font-bold" />
                  <span>Razorpay payment links & verified webhooks</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#dc4a22] shrink-0 font-bold" />
                  <span>Bank CSV fuzzy matching & reconciliation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#dc4a22] shrink-0 font-bold" />
                  <span>&quot;Why is my bill ₹X?&quot; math explainer</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#dc4a22] shrink-0 font-bold" />
                  <span>Payment Rescue & automated retry engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#dc4a22] shrink-0 font-bold" />
                  <span>Prorated plan change preview</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3: Enterprise */}
          <div className="p-7 rounded-2xl border border-[#e8e8e3] bg-white shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#1c1b1a]">Enterprise</h3>
              <p className="text-xs text-[#6e6d6a] mt-1 mb-6">
                Ideal for larger teams aiming for optimization.
              </p>

              <div className="mb-6">
                <span className="text-4xl font-serif font-bold text-[#1c1b1a]">Custom</span>
                <span className="text-xs text-[#8c8b87] block mt-1 font-mono">Pricing tailored to your team</span>
              </div>

              <Link
                href="/login"
                className="w-full block text-center py-2 px-4 rounded-full text-xs font-semibold bg-white border border-[#d9d9d4] hover:bg-[#f2f2ee] text-[#1c1b1a] transition-colors mb-8 shadow-sm"
              >
                Get Started
              </Link>

              <ul className="space-y-3 text-xs text-[#6e6d6a]">
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#1c1b1a] shrink-0" />
                  <span>Two-Way WhatsApp billing bot</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#1c1b1a] shrink-0" />
                  <span>AI Finance Assistant (Text-to-SQL)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#1c1b1a] shrink-0" />
                  <span>Revenue Leakage Detector (1-click fixes)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#1c1b1a] shrink-0" />
                  <span>High-concurrency discount locks</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#1c1b1a] shrink-0" />
                  <span>Dedicated database & read-only views</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#1c1b1a] shrink-0" />
                  <span>Custom invoicing & payment terms</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#1c1b1a] shrink-0" />
                  <span>99.99% uptime SLA & dedicated Slack channel</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
