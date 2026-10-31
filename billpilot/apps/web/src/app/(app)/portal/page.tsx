"use client";

import { useState } from "react";
import {
  UserCheck,
  CreditCard,
  Download,
  ExternalLink,
  Pause,
  RotateCw,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export default function CustomerPortalPage() {
  const [seats, setSeats] = useState(5);
  const [selectedPlan, setSelectedPlan] = useState("Pro Monthly");
  const [whatsAppOptIn, setWhatsAppOptIn] = useState(true);
  const [changeConfirmed, setChangeConfirmed] = useState(false);

  // Prorated math calculation preview
  const currentMonthly = 5 * 2499;
  const newMonthly = seats * 2499;
  const proratedCharge = seats > 5 ? (seats - 5) * 2499 * 0.5 : 0; // half month remaining

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Customer Self-Service Portal</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              cust1@brightloop.test (Zenith Infotech)
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your company subscriptions, view invoices, download receipts, and configure notifications.
          </p>
        </div>
      </div>

      {changeConfirmed && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>Plan change confirmed! Prorated adjustment of ₹{proratedCharge.toLocaleString("en-IN")} applied to next invoice.</span>
          </div>
          <button onClick={() => setChangeConfirmed(false)} className="text-emerald-400 hover:text-emerald-200">✕</button>
        </div>
      )}

      {/* Savings Advisor Card [T3 10.6] */}
      <div className="p-4 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-card/80 to-card/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
            <Sparkles className="size-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-foreground">AI Savings Advisor</span>
            <p className="text-xs text-muted-foreground">
              Switching your 5 seats from <strong className="text-foreground">Pro Monthly</strong> to <strong className="text-foreground">Pro Yearly</strong> saves your company <strong className="text-emerald-400">₹4,990 / year</strong> (16.7% discount).
            </p>
          </div>
        </div>
        <button
          onClick={() => alert("Annual plan switched! Discount applied.")}
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shrink-0"
        >
          Switch to Yearly & Save
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Subscription & Self-Service Changes [T2 10.3] */}
        <div className="p-5 rounded-xl border border-border bg-card/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <span className="text-xs text-muted-foreground">Active Subscription</span>
              <p className="text-base font-bold text-foreground font-mono">SUB-2026-000124</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ACTIVE
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-muted-foreground block mb-1">Current Plan Tier</label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-700 text-foreground font-medium"
              >
                <option value="Starter Monthly">Starter Monthly (₹999/mo)</option>
                <option value="Pro Monthly">Pro Monthly (₹2,499/mo)</option>
                <option value="Enterprise Monthly">Enterprise Monthly (₹9,999/mo)</option>
              </select>
            </div>

            <div>
              <label className="text-muted-foreground block mb-1">
                Seat Count: <strong className="text-foreground">{seats} seats</strong>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Prorated Price Preview [T2 10.3] */}
            <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1.5 font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>New Monthly Recurring:</span>
                <span className="text-white">₹{newMonthly.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Prorated Charge Today (15 days remaining):</span>
                <span className="text-emerald-400">₹{proratedCharge.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setChangeConfirmed(true)}
                className="flex-1 py-2 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                Confirm Plan Adjustment
              </button>
            </div>
          </div>
        </div>

        {/* My Invoices & Razorpay Pay Now */}
        <div className="p-5 rounded-xl border border-border bg-card/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-sm font-semibold text-foreground">My Invoices & Receipts</span>
            <span className="text-xs text-muted-foreground font-mono">GST Compliant</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono font-medium text-foreground block">INV-2026-000041</span>
                <span className="text-[11px] text-muted-foreground font-mono">Due Oct 15, 2026 · ₹14,744.10</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400">
                  PAID
                </span>
                <button
                  onClick={() => alert("Downloading PDF...")}
                  className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                >
                  <Download className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="pt-3 border-t border-border space-y-2">
              <span className="text-xs font-semibold text-foreground block">Communication Channels</span>
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-emerald-400" />
                  <div>
                    <span className="font-medium text-foreground block">WhatsApp Invoices & Receipts</span>
                    <span className="text-[11px] text-muted-foreground font-mono">+91 98234 56789</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={whatsAppOptIn}
                  onChange={(e) => setWhatsAppOptIn(e.target.checked)}
                  className="size-4 accent-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
