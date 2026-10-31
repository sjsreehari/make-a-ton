"use client";

import { useState } from "react";
import {
  LifeBuoy,
  AlertTriangle,
  RotateCw,
  CheckCircle2,
  Send,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface FailureEvent {
  id: string;
  invoice: string;
  customer: string;
  amount: string;
  amountNum: number;
  reason: "INSUFFICIENT_FUNDS" | "CARD_EXPIRED" | "MANDATE_LIMIT_EXCEEDED" | "BANK_ERROR";
  path: string;
  status: "QUEUED_RETRY" | "PAYMENT_LINK_SENT" | "RECOVERED";
  attempts: number;
  nextRetry: string;
}

const INITIAL_FAILURES: FailureEvent[] = [
  {
    id: "fail-1",
    invoice: "INV-2026-000912",
    customer: "Apex Global Ltd",
    amount: "₹24,990.00",
    amountNum: 24990,
    reason: "INSUFFICIENT_FUNDS",
    path: "Smart timed retry: scheduled for 09:30 AM on salary day (Nov 1).",
    status: "QUEUED_RETRY",
    attempts: 1,
    nextRetry: "Tomorrow 09:30 AM",
  },
  {
    id: "fail-2",
    invoice: "INV-2026-000915",
    customer: "Quantum Labs",
    amount: "₹9,990.00",
    amountNum: 9990,
    reason: "CARD_EXPIRED",
    path: "Automated WhatsApp card-update link sent to CFO (+91 98765 43210).",
    status: "PAYMENT_LINK_SENT",
    attempts: 2,
    nextRetry: "Awaiting card details",
  },
  {
    id: "fail-3",
    invoice: "INV-2026-000918",
    customer: "HyperScale Tech",
    amount: "₹17,500.00",
    amountNum: 17500,
    reason: "MANDATE_LIMIT_EXCEEDED",
    path: "One-click e-mandate step-up prompt dispatched.",
    status: "PAYMENT_LINK_SENT",
    attempts: 1,
    nextRetry: "Awaiting OTP approval",
  },
];

export default function PaymentRescuePage() {
  const [failures, setFailures] = useState(INITIAL_FAILURES);
  const [recoveredTotal, setRecoveredTotal] = useState(42500);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const handleSimulateFail = () => {
    const newFail: FailureEvent = {
      id: `fail-${Date.now()}`,
      invoice: `INV-2026-000${Math.floor(920 + Math.random() * 80)}`,
      customer: "Acme Cloud Corp",
      amount: "₹14,990.00",
      amountNum: 14990,
      reason: "INSUFFICIENT_FUNDS",
      path: "Auto-classified: Insufficient balance. Smart retry queued for optimal bank clearing window.",
      status: "QUEUED_RETRY",
      attempts: 1,
      nextRetry: "In 4 hours",
    };
    setFailures([newFail, ...failures]);
  };

  const handleRecover = (id: string, amount: number) => {
    setRetryingId(id);
    setTimeout(() => {
      setRetryingId(null);
      setFailures((prev) => prev.map((f) => (f.id === id ? { ...f, status: "RECOVERED" } : f)));
      setRecoveredTotal((prev) => prev + amount);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Payment Rescue Engine</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Auto-classifies dunning failures, executes recovery workflows, and prevents involuntary churn.
          </p>
        </div>

        {/* Demo Button [REQ T2 8.4] */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSimulateFail}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-colors shadow-sm"
          >
            <AlertTriangle className="size-3.5 text-red-400" />
            💥 Demo: Trigger Payment Failure
          </button>
        </div>
      </div>

      {/* Recovered Counter Banner [REQ T2 8.4] */}
      <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-emerald-300 uppercase tracking-wider">
                Total Revenue Recovered by Engine
              </span>
              <p className="text-3xl font-bold font-mono text-emerald-400">
                ₹{recoveredTotal.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="text-xs text-zinc-300 font-mono">
            86.4% success rate across failed recurring cards & mandates
          </div>
        </div>
      </div>

      {/* Failures & Recovery Queue */}
      <div className="space-y-3">
        {failures.map((f) => (
          <div
            key={f.id}
            className={`p-4 rounded-xl border transition-all ${
              f.status === "RECOVERED"
                ? "border-emerald-500/20 bg-card/40 opacity-70"
                : "border-border bg-card/60 shadow-sm"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                    f.status === "RECOVERED"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    {f.reason}
                  </span>
                  <span className="font-mono font-medium text-foreground text-sm">{f.invoice}</span>
                  <span className="text-xs text-zinc-300">({f.customer})</span>
                </div>
                <p className="text-xs text-zinc-400">{f.path}</p>
                <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
                  <span>Attempts: {f.attempts}/4</span>
                  <span>Next: {f.nextRetry}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <span className="text-base font-bold font-mono text-foreground">{f.amount}</span>

                {f.status !== "RECOVERED" ? (
                  <button
                    onClick={() => handleRecover(f.id, f.amountNum)}
                    disabled={retryingId !== null}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm disabled:opacity-50"
                  >
                    <RotateCw className={`size-3 ${retryingId === f.id ? "animate-spin" : ""}`} />
                    {retryingId === f.id ? "Retrying..." : "Simulate Recovery"}
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="size-3.5" />
                    Recovered
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
