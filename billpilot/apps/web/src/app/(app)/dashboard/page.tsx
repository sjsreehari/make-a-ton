"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Layers,
  FileText,
  CreditCard,
  AlertTriangle,
  PlayCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Send,
  Zap,
  Bot,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

const MRR_DATA = [
  { month: "May", mrr: 2840000, newMrr: 320000, churn: 45000 },
  { month: "Jun", mrr: 3120000, newMrr: 350000, churn: 70000 },
  { month: "Jul", mrr: 3390000, newMrr: 380000, churn: 110000 },
  { month: "Aug", mrr: 3680000, newMrr: 420000, churn: 130000 },
  { month: "Sep", mrr: 3950000, newMrr: 390000, churn: 120000 },
  { month: "Oct", mrr: 4285000, newMrr: 460000, churn: 125000 },
];

const RECENT_INVOICES = [
  { id: "inv-1", number: "INV-2026-001248", customer: "Apex Global Ltd", amount: "₹24,990", status: "OVERDUE", dueDate: "2 days ago", phone: "+91 98765 43210" },
  { id: "inv-2", number: "INV-2026-001247", customer: "Zenith Infotech", amount: "₹4,999", status: "PAID", dueDate: "Today", phone: "+91 98234 56789" },
  { id: "inv-3", number: "INV-2026-001246", customer: "Kavya Enterprises", amount: "₹14,990", status: "OVERDUE", dueDate: "5 days ago", phone: "+91 97123 45678" },
  { id: "inv-4", number: "INV-2026-001245", customer: "Bright Digital Studio", amount: "₹9,990", status: "PAID", dueDate: "Yesterday", phone: "+91 98456 12345" },
  { id: "inv-5", number: "INV-2026-001244", customer: "CloudNative Labs", amount: "₹49,990", status: "CONFIRMED", dueDate: "In 3 days", phone: "+91 99887 76655" },
];

const RECENT_SUBSCRIPTIONS = [
  { id: "sub-1", number: "SUB-2026-000512", customer: "Acme Logistics", plan: "Enterprise Monthly", seats: 20, amount: "₹19,998/mo", status: "ACTIVE" },
  { id: "sub-2", number: "SUB-2026-000511", customer: "HyperScale Tech", plan: "Odoo Subscription Monthly", seats: 5, amount: "₹27,795/mo", status: "ACTIVE" },
  { id: "sub-3", number: "SUB-2026-000510", customer: "Omicron Healthcare", plan: "Pro Yearly", seats: 12, amount: "₹2,99,880/yr", status: "ACTIVE" },
  { id: "sub-4", number: "SUB-2026-000509", customer: "Vector Media", plan: "Starter Monthly", seats: 2, amount: "₹1,998/mo", status: "PAUSED" },
];

export default function DashboardPage() {
  const [billingRunning, setBillingRunning] = useState(false);
  const [billingResult, setBillingResult] = useState<string | null>(null);
  const [reminderSent, setReminderSent] = useState<string | null>(null);

  const handleRunBilling = () => {
    setBillingRunning(true);
    setTimeout(() => {
      setBillingRunning(false);
      setBillingResult("Billing run complete! 482 invoices created, 4,758 skipped (already billed), 0 failed.");
    }, 1200);
  };

  const handleSendReminder = (invNum: string) => {
    setReminderSent(invNum);
    setTimeout(() => setReminderSent(null), 3000);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Operations Dashboard</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Engine
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automated billing lifecycle, cash flow tracking, and revenue health for Brightloop Software.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
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
            ₹84,200 at Risk
          </Link>
          <button
            onClick={handleRunBilling}
            disabled={billingRunning}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            <PlayCircle className={`size-3.5 ${billingRunning ? "animate-spin" : ""}`} />
            {billingRunning ? "Running Billing..." : "⚡ Run Billing Run"}
          </button>
        </div>
      </div>

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl border border-border bg-card/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Active Subscriptions</span>
            <Layers className="size-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">5,240</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
            <ArrowUpRight className="size-3" />
            <span>+8.4% vs last mo</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Monthly Recurring (MRR)</span>
            <TrendingUp className="size-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">₹42,85,000</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
            <ArrowUpRight className="size-3" />
            <span>+14.2% expansion</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Annual Recurring (ARR)</span>
            <BarChart3 className="size-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">₹5.14 Cr</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-zinc-400">
            <span>Projected annualized</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Overdue Invoices</span>
            <Clock className="size-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-400 font-mono">14</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-400/90 font-mono">
            <span>₹2,18,500 total owed</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-red-300">
            <span className="text-xs font-medium">Revenue at Risk</span>
            <AlertTriangle className="size-4 text-red-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-red-400 font-mono">₹84,200</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-red-400/80">
            <Link href="/leakage" className="underline hover:text-red-300">6 leakages found →</Link>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* MRR Waterfall Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-border bg-card/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">MRR Growth & Movement</h2>
              <p className="text-[11px] text-muted-foreground">Net recurring revenue trajectory over the past 6 months</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="size-2 rounded-full bg-indigo-500" /> MRR (₹)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-500" /> New Expansion
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MRR_DATA}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Amount"]}
                />
                <Area type="monotone" dataKey="mrr" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#mrrGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI & Automation Quick Insight */}
        <div className="p-5 rounded-xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/10 via-card/60 to-card/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="size-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Bot className="size-4 text-indigo-400" />
              </div>
              <span className="text-xs font-semibold text-foreground">AI Finance Insights</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mt-2">
              Automated audit detected <strong className="text-foreground">₹84,200</strong> in revenue leakage:
            </p>
            <ul className="mt-3 space-y-2 text-xs text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                <span>3 active subscriptions never received an invoice.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>2 expired discount vouchers (15%) still applied.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <span>Payment rescue recovered ₹42,500 today via timed retries.</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border mt-4 flex flex-col gap-2">
            <Link
              href="/ai-assistant"
              className="w-full text-center py-2 px-3 rounded-md text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors"
            >
              Ask AI Assistant a Question →
            </Link>
            <Link
              href="/leakage"
              className="w-full text-center py-2 px-3 rounded-md text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 transition-colors"
            >
              Run One-Click Leakage Fixes →
            </Link>
          </div>
        </div>
      </div>

      {/* Tables Section: Overdue Invoices & Active Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Overdue Invoices Chaser */}
        <div className="p-5 rounded-xl border border-border bg-card/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Priority Collections & Overdue</h2>
              <p className="text-[11px] text-muted-foreground">Direct WhatsApp chase & Razorpay payment links</p>
            </div>
            <Link href="/invoices" className="text-xs text-indigo-400 hover:underline">View All →</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 font-medium">Invoice</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {RECENT_INVOICES.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 font-mono text-foreground font-medium">{inv.number}</td>
                    <td className="py-2.5 text-zinc-300">{inv.customer}</td>
                    <td className="py-2.5 font-mono font-medium text-foreground">{inv.amount}</td>
                    <td className="py-2.5">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium font-mono ${
                          inv.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : inv.status === "OVERDUE"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      {inv.status === "OVERDUE" ? (
                        <button
                          onClick={() => handleSendReminder(inv.number)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors"
                        >
                          <Send className="size-2.5" />
                          {reminderSent === inv.number ? "Sent!" : "WhatsApp Chase"}
                        </button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subscriptions Registry Snippet */}
        <div className="p-5 rounded-xl border border-border bg-card/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Recent Subscriptions</h2>
              <p className="text-[11px] text-muted-foreground">Lifecycle states, recurring rates & plan tiers</p>
            </div>
            <Link href="/subscriptions" className="text-xs text-indigo-400 hover:underline">View All →</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 font-medium">Subscription #</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Plan</th>
                  <th className="pb-2 font-medium">Rate</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {RECENT_SUBSCRIPTIONS.map((sub) => (
                  <tr key={sub.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 font-mono text-foreground font-medium">{sub.number}</td>
                    <td className="py-2.5 text-zinc-300">{sub.customer}</td>
                    <td className="py-2.5 text-zinc-400">{sub.plan}</td>
                    <td className="py-2.5 font-mono font-medium text-foreground">{sub.amount}</td>
                    <td className="py-2.5">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium font-mono ${
                          sub.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
