"use client";

import { useState } from "react";
import {
  CreditCard,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Search,
  FileSpreadsheet,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

interface PaymentRecord {
  id: string;
  invoiceNumber: string;
  customer: string;
  amount: string;
  method: "RAZORPAY" | "BANK_TRANSFER" | "UPI" | "CREDIT_BALANCE";
  status: "COMPLETED" | "PARTIAL" | "RECONCILED";
  date: string;
  note?: string;
}

const INITIAL_PAYMENTS: PaymentRecord[] = [
  { id: "pay-1", invoiceNumber: "INV-2026-000041", customer: "Zenith Infotech", amount: "₹14,744.10", method: "RAZORPAY", status: "COMPLETED", date: "2026-10-15 14:22", note: "Razorpay webhook verified (pay_12893892)" },
  { id: "pay-2", invoiceNumber: "INV-2026-000040", customer: "Brightwave Studio", amount: "₹35,364.60", method: "BANK_TRANSFER", status: "RECONCILED", date: "2026-09-12 11:05", note: "Auto-reconciled via HDFC CSV upload (98% match)" },
  { id: "pay-3", invoiceNumber: "INV-2026-000038", customer: "Apex Global Ltd", amount: "₹30,000.00", method: "UPI", status: "PARTIAL", date: "2026-09-10 16:40", note: "Partial payment; remaining ₹35,596.20 open" },
  { id: "pay-4", invoiceNumber: "INV-2026-000035", customer: "CloudNative Labs", amount: "₹60,000.00", method: "BANK_TRANSFER", status: "COMPLETED", date: "2026-08-20 09:15", note: "Overpayment of ₹5,000 converted to Customer Credit Balance" },
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [reconciling, setReconciling] = useState(false);
  const [reconcileResult, setReconcileResult] = useState<string | null>(null);

  const handleCsvUpload = () => {
    setReconciling(true);
    setTimeout(() => {
      setReconciling(false);
      setReconcileResult("Bank statement CSV parsed! 18 transactions matched automatically (95%+ confidence), 2 flagged for staff review.");
    }, 1400);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Payments & Reconciliation</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Razorpay automated webhooks, partial and overpayment credit tracking, and fuzzy bank CSV reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCsvUpload}
            disabled={reconciling}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors shadow-sm disabled:opacity-50"
          >
            <Upload className={`size-3.5 ${reconciling ? "animate-spin" : ""}`} />
            {reconciling ? "Reconciling CSV..." : "Upload Bank Statement CSV"}
          </button>
        </div>
      </div>

      {reconcileResult && (
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-200 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-indigo-400" />
            <span>{reconcileResult}</span>
          </div>
          <button onClick={() => setReconcileResult(null)} className="text-indigo-400 hover:text-indigo-200">✕</button>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card/60 shadow-sm">
          <span className="text-xs text-muted-foreground font-medium">Total Paid This Month</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">₹38,24,500</p>
          <span className="text-[11px] text-zinc-400">98.2% automated collection rate</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card/60 shadow-sm">
          <span className="text-xs text-muted-foreground font-medium">Customer Credit Balances</span>
          <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">₹42,000</p>
          <span className="text-[11px] text-zinc-400">Auto-applies on next invoice generation</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card/60 shadow-sm">
          <span className="text-xs text-muted-foreground font-medium">Outstanding Owed</span>
          <p className="text-2xl font-bold font-mono text-amber-400 mt-1">₹2,18,500</p>
          <span className="text-[11px] text-amber-400/90 font-mono">14 overdue invoices in automated chase</span>
        </div>
      </div>

      {/* Payment Ledger */}
      <div className="rounded-xl border border-border bg-card/60 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Recent Payments & Reconciliations</span>
          <span className="text-xs text-muted-foreground font-mono">Real-time ledger</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground bg-muted/30">
              <th className="py-3 px-4 font-medium">Invoice #</th>
              <th className="py-3 px-4 font-medium">Customer</th>
              <th className="py-3 px-4 font-medium">Amount</th>
              <th className="py-3 px-4 font-medium">Method</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Date</th>
              <th className="py-3 px-4 font-medium">Verification Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                <td className="py-3 px-4 font-mono font-medium text-foreground">{p.invoiceNumber}</td>
                <td className="py-3 px-4 font-medium text-foreground">{p.customer}</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-400">{p.amount}</td>
                <td className="py-3 px-4">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {p.method}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      p.status === "COMPLETED" || p.status === "RECONCILED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-zinc-400">{p.date}</td>
                <td className="py-3 px-4 text-zinc-400 text-[11px] truncate max-w-xs">{p.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
