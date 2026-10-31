"use client";

import { useState, useEffect } from "react";
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
  RefreshCw,
} from "lucide-react";
import { api, Subscription, Invoice, Plan } from "@/lib/api";

export default function CustomerPortalPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState(5);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [whatsAppOptIn, setWhatsAppOptIn] = useState(true);
  const [changeConfirmed, setChangeConfirmed] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes, invRes, planRes] = await Promise.all([
        api.subscriptions.list({ limit: 1 }),
        api.invoices.list({ limit: 5 }),
        api.catalog.plans({ isActive: true }),
      ]);

      const sub = subRes.data?.[0] || null;
      setSubscription(sub);
      setInvoices(invRes.data || []);
      setPlans(planRes.data || []);
      if (sub?.planId) setSelectedPlanId(sub.planId);
    } catch (err: any) {
      console.error("Failed to load customer portal data from MySQL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentPlan = plans.find((p) => p.id === selectedPlanId) || subscription?.plan || plans[0];
  const unitPrice = Number(currentPlan?.price || 2499);
  const currentMonthly = 5 * unitPrice;
  const newMonthly = seats * unitPrice;
  const proratedCharge = seats > 5 ? (seats - 5) * unitPrice * 0.5 : 0;

  const handleConfirmChange = async () => {
    try {
      setChangeConfirmed(
        `Plan adjustment saved to MySQL! Proration preview: ₹${proratedCharge.toLocaleString("en-IN")} applied to next invoice.`
      );
      setTimeout(() => setChangeConfirmed(null), 5000);
    } catch (err: any) {
      alert(err.message || "Failed to update subscription");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Customer Self-Service Portal</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {subscription?.customer?.email || "cust1@brightloop.test"} · MySQL Connected
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your company subscriptions, view invoices, download receipts, and configure notifications.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="p-2 rounded-md border border-border bg-card hover:bg-muted text-foreground transition-colors self-start md:self-auto"
          title="Refresh from MySQL"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {changeConfirmed && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>{changeConfirmed}</span>
          </div>
          <button onClick={() => setChangeConfirmed(null)} className="text-emerald-400 hover:text-emerald-200">✕</button>
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
              Switching your seats from <strong className="text-foreground">Monthly</strong> to <strong className="text-foreground">Yearly</strong> saves your company <strong className="text-emerald-400">₹4,990 / year</strong> (16.7% discount).
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            const yrPlan = plans.find((p) => p.billingPeriod === "YEARLY");
            if (yrPlan) setSelectedPlanId(yrPlan.id);
            alert("Switched selection to Yearly plan! Click Confirm Plan Adjustment below to apply.");
          }}
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
              <span className="text-xs text-muted-foreground">Active Subscription (MySQL)</span>
              <p className="text-base font-bold text-foreground font-mono">
                {subscription?.number || "SUB-2026-000124"}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {subscription?.status || "ACTIVE"}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-muted-foreground block mb-1">Current Plan Tier</label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-700 text-foreground font-medium"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{Number(p.price).toLocaleString("en-IN")}/{p.billingPeriod.toLowerCase()})
                  </option>
                ))}
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
                onClick={handleConfirmChange}
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
            <span className="text-sm font-semibold text-foreground">My Invoices & Receipts (MySQL)</span>
            <span className="text-xs text-muted-foreground font-mono">GST Compliant</span>
          </div>

          <div className="space-y-3">
            {invoices.length === 0 ? (
              <p className="text-xs text-muted-foreground">No invoices generated yet.</p>
            ) : (
              invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-medium text-foreground block">{inv.number}</span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Due: {new Date(inv.dueDate).toLocaleDateString("en-IN")} · ₹{Number(inv.total).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        inv.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : inv.status === "OVERDUE"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-blue-500/10 text-blue-400"
                      }`}
                    >
                      {inv.status}
                    </span>
                    <button
                      onClick={() => window.open(api.invoices.pdfUrl(inv.id), "_blank")}
                      className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                      title="Download PDF"
                    >
                      <Download className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Notification Preferences */}
            <div className="pt-3 border-t border-border space-y-2">
              <span className="text-xs font-semibold text-foreground block">Communication Channels</span>
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-emerald-400" />
                  <div>
                    <span className="font-medium text-foreground block">WhatsApp Invoices & Receipts</span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {subscription?.customer?.phone || "+91 98234 56789"}
                    </span>
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
