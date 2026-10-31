"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  Layers,
  FileText,
  AlertTriangle,
  PlayCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  Send,
  RefreshCw,
} from "lucide-react";
import { api, Invoice, Subscription } from "@/lib/api";

export default function DashboardPage() {
  const [billingRunning, setBillingRunning] = useState(false);
  const [billingResult, setBillingResult] = useState<string | null>(null);
  const [reminderSent, setReminderSent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Live Metrics
  const [mrrMetrics, setMrrMetrics] = useState({
    mrr: 0,
    arr: 0,
    newMrr: 0,
    expansionMrr: 0,
    contractionMrr: 0,
    churnedMrr: 0,
    activeCount: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [recentSubscriptions, setRecentSubscriptions] = useState<Subscription[]>([]);
  const [leakageAtRisk, setLeakageAtRisk] = useState<number>(0);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const [mrrRes, invRes, subRes, leakRes] = await Promise.all([
        api.insights.mrr(),
        api.invoices.list({ limit: 5 }),
        api.subscriptions.list({ limit: 5 }),
        api.insights.leakage(),
      ]);

      setMrrMetrics(mrrRes as any);
      setRecentInvoices(invRes.data || []);
      setRecentSubscriptions(subRes.data || []);
      setLeakageAtRisk(leakRes.totalAmountAtRisk || 0);
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      setLoadError(err?.message || "Could not load dashboard data. Try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRunBilling = async () => {
    try {
      setBillingRunning(true);
      const res = await api.invoices.runBilling({ dryRun: false });
      setBillingResult(`Billing run complete. ${res.created} invoices created, ${res.skipped} skipped, ${res.failed} failed.`);
      await fetchDashboardData();
      setTimeout(() => setBillingResult(null), 5000);
    } catch (err: any) {
      alert(err.message || "Failed to execute billing run");
    } finally {
      setBillingRunning(false);
    }
  };

  const handleSendReminder = async (invId: string, invNum: string) => {
    try {
      await api.invoices.send(invId);
      setReminderSent(invNum);
      setTimeout(() => setReminderSent(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to send invoice reminder");
    }
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col gap-6 overflow-y-auto p-4 sm:p-6 xl:p-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Operations Dashboard</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Billing, payments, and subscription activity at a glance.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="p-1.5 rounded-md border border-border bg-card hover:bg-muted text-foreground transition-colors"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/quotes"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors shadow-sm"
          >
            <Layers className="size-3.5 text-indigo-400" />
            New Quote
          </Link>
          <Link
            href="/leakage"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-colors shadow-sm"
          >
            <AlertTriangle className="size-3.5 text-red-400" />
            ₹{leakageAtRisk.toLocaleString("en-IN")} at Risk
          </Link>
          <button
            onClick={handleRunBilling}
            disabled={billingRunning}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            <PlayCircle className={`size-3.5 ${billingRunning ? "animate-spin" : ""}`} />
            {billingRunning ? "Running billing..." : "Run billing"}
          </button>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-amber-200">
          <span>{loadError}</span>
          <button onClick={fetchDashboardData} className="font-medium text-amber-300 underline underline-offset-4">Try again</button>
        </div>
      )}

      {reminderSent && (
        <div role="status" className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
          Reminder sent for {reminderSent}.
        </div>
      )}

      {billingResult && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>{billingResult}</span>
          </div>
          <button onClick={() => setBillingResult(null)} className="text-emerald-400 hover:text-emerald-200">✕</button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="p-4 rounded-xl border border-border bg-card/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Active Subscriptions</span>
            <Layers className="size-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">
            {loading ? "—" : mrrMetrics.activeCount}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
            <span>Current subscriptions</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Monthly Recurring (MRR)</span>
            <TrendingUp className="size-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">
            {loading ? "—" : `₹${Number(mrrMetrics.mrr || 0).toLocaleString("en-IN")}`}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
            <span>Current monthly recurring revenue</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Annual Recurring (ARR)</span>
            <BarChart3 className="size-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">
            {loading ? "—" : `₹${Number(mrrMetrics.arr || 0).toLocaleString("en-IN")}`}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-zinc-400">
            <span>Annualized monthly revenue</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Overdue at Risk</span>
            <Clock className="size-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-400 font-mono">
            {loading ? "—" : `₹${recentInvoices.filter(i => i.status === "OVERDUE").reduce((acc, curr) => acc + Number(curr.amountDue || 0), 0).toLocaleString("en-IN")}`}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-400/80">
            <span>Across the 5 latest invoices</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Revenue Leakage</span>
            <AlertTriangle className="size-4 text-red-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-red-400 font-mono">
            {loading ? "—" : `₹${leakageAtRisk.toLocaleString("en-IN")}`}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-red-400/80">
            <span>Review flagged items</span>
          </div>
        </div>
      </div>

      {/* Live Recent Invoices & Subscriptions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Invoices */}
        <div className="min-w-0 rounded-xl border border-border bg-card/60 p-4 shadow-sm sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-foreground">Recent invoices</h2>
            </div>
            <Link href="/invoices" className="text-xs text-indigo-400 hover:text-indigo-300">
              View all ({recentInvoices.length}) →
            </Link>
          </div>

          <div className="divide-y divide-border/60 text-xs">
            {!loading && recentInvoices.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No invoices yet.</p>}
            {recentInvoices.slice(0, 5).map((inv) => (
              <div key={inv.id} className="flex min-w-0 items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-mono font-medium text-foreground">{inv.number}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                        inv.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : inv.status === "OVERDUE"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-blue-500/10 text-blue-400"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <span className="block truncate text-[11px] text-muted-foreground">{inv.customer?.name || "Customer"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="shrink-0 font-mono font-bold text-foreground">
                    ₹{Number(inv.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                  {inv.status === "OVERDUE" && (
                    <button
                      onClick={() => handleSendReminder(inv.id, inv.number)}
                      className="p-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20"
                      title="Send invoice reminder"
                    >
                      <Send className="size-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Subscriptions */}
        <div className="min-w-0 rounded-xl border border-border bg-card/60 p-4 shadow-sm sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-foreground">Recent subscriptions</h2>
            </div>
            <Link href="/subscriptions" className="text-xs text-indigo-400 hover:text-indigo-300">
              Manage Subscriptions →
            </Link>
          </div>

          <div className="divide-y divide-border/60 text-xs">
            {!loading && recentSubscriptions.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No subscriptions yet.</p>}
            {recentSubscriptions.slice(0, 5).map((sub) => (
              <div key={sub.id} className="flex min-w-0 items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-mono font-medium text-foreground">{sub.number}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                        sub.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : sub.status === "PAUSED"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-zinc-500/10 text-zinc-400"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {sub.customer?.name || "Customer"} · {sub.plan?.name || "Plan"}
                  </span>
                </div>

                <div className="text-right">
                  <span className="whitespace-nowrap font-mono font-bold text-emerald-400">
                    ₹{Number(sub.plan?.price || 0).toLocaleString("en-IN")}{sub.plan?.billingPeriod ? `/${sub.plan.billingPeriod.toLowerCase()}` : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
