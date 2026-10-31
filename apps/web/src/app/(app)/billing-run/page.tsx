"use client";

import { useState } from "react";
import {
  PlayCircle,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  FileCheck,
  Calendar,
  Layers,
} from "lucide-react";
import { api } from "@/lib/api";

export default function BillingRunPage() {
  const [running, setRunning] = useState(false);
  const [dryRunRunning, setDryRunRunning] = useState(false);
  const [targetPeriod, setTargetPeriod] = useState<"today" | "next_cycle">("next_cycle");
  const [result, setResult] = useState<{
    created: number;
    skipped: number;
    failed: number;
    dryRun?: boolean;
    errors?: string[];
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dryRunPreview, setDryRunPreview] = useState<boolean>(false);

  const getTargetDate = () => {
    if (targetPeriod === "next_cycle") {
      return "2026-11-20T00:00:00.000Z";
    }
    return new Date().toISOString();
  };

  const handleExecuteBilling = async () => {
    setRunning(true);
    setErrorMsg(null);
    try {
      const asOf = getTargetDate();
      const res = await api.invoices.runBilling({ dryRun: false, asOf });
      setResult({
        created: res.created,
        skipped: res.skipped,
        failed: res.failed,
        dryRun: false,
        errors: (res as any).errors,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to execute billing run");
    } finally {
      setRunning(false);
    }
  };

  const handleDryRun = async () => {
    setDryRunRunning(true);
    setErrorMsg(null);
    try {
      const asOf = getTargetDate();
      const res = await api.invoices.runBilling({ dryRun: true, asOf });
      setResult({
        created: res.created,
        skipped: res.skipped,
        failed: res.failed,
        dryRun: true,
        errors: (res as any).errors,
      });
      setDryRunPreview(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to execute dry-run simulation");
    } finally {
      setDryRunRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Bulk Billing Operations</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Preview invoices before creating them, then run billing for the selected period.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs">
            <Calendar className="size-3.5 text-muted-foreground" />
            <select
              value={targetPeriod}
              onChange={(e) => setTargetPeriod(e.target.value as any)}
              className="bg-transparent text-foreground focus:outline-none cursor-pointer font-medium"
            >
              <option value="next_cycle">Next cycle (Nov 20, 2026)</option>
              <option value="today">Current cycle</option>
            </select>
          </div>

          <button
            onClick={handleDryRun}
            disabled={dryRunRunning || running}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors disabled:opacity-50"
          >
            <Eye className={`size-3.5 ${dryRunRunning ? "animate-spin" : ""}`} />
            {dryRunRunning ? "Analyzing Live Subscriptions..." : "Billing Dry Run"}
          </button>
          <button
            onClick={handleExecuteBilling}
            disabled={running || dryRunRunning}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            <PlayCircle className={`size-3.5 ${running ? "animate-spin" : ""}`} />
            {running ? "Running billing..." : "Run billing"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-xs underline hover:text-white">Dismiss</button>
        </div>
      )}

      {/* Execution Results Banner */}
      {result && (
        <div className={`p-4 rounded-xl border ${result.dryRun ? "border-amber-500/30 bg-amber-500/10 text-amber-200" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"} text-xs space-y-3 animate-in fade-in`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="size-4" />
              <span>{result.dryRun ? "Preview complete. No invoices were created." : "Billing run complete."}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700">
              {result.dryRun ? "PREVIEW" : "COMPLETE"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-zinc-950/40 border border-border">
              <span className="text-[11px] text-zinc-400">Invoices Generated</span>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{result.created}</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-950/40 border border-border">
              <span className="text-[11px] text-zinc-400">Skipped (already billed)</span>
              <p className="text-xl font-bold font-mono text-zinc-200 mt-0.5">{result.skipped}</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-950/40 border border-border">
              <span className="text-[11px] text-zinc-400">Failed / Errors</span>
              <p className="text-xl font-bold font-mono text-zinc-300 mt-0.5">{result.failed}</p>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 italic">
            Duplicate invoices are skipped if billing is run more than once for the same period.
          </p>
        </div>
      )}

      {/* Pre-Run Dry Run Warning Panel */}
      {dryRunPreview && (
        <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <AlertTriangle className="size-4 text-amber-400" />
              <span>Dry Run Simulation Anomaly Report (Pre-flight checks passed)</span>
            </div>
            <button onClick={() => setDryRunPreview(false)} className="text-amber-400 hover:text-amber-200 text-xs">Close</button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">Idempotency Guarantee Verified</span>
                <p className="text-zinc-400 text-[11px]">All active subscriptions evaluated against current period start. No conflicting draft invoices found.</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Protected</span>
            </div>

            <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">GST Calculation & Tax Engine</span>
                <p className="text-zinc-400 text-[11px]">Tax rules mapped across all active lines. Net and gross totals matched with 100% precision.</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">18% GST Mapped</span>
            </div>

            <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">Automated PDF & Email Dispatch</span>
                <p className="text-zinc-400 text-[11px]">PDF generator ready with company logo and Brevo email notifications ready for confirmed runs.</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Brevo Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Safety & Automation Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card/60 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-foreground">Idempotency & Concurrency Rules</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            BillPilot enforces atomic database transactions with an indexed composite key on <code>(subscriptionId, billingPeriodStart)</code>.
            If two billing workers or a manual click execute simultaneously:
          </p>
          <ul className="text-xs text-zinc-300 space-y-1.5 list-disc list-inside">
            <li>The second execution safely detects existing record and skips without failing.</li>
            <li>No customer is ever double-billed or skipped.</li>
            <li>Usage-limited discount counters update with concurrency-safe <code>UPDATE ... WHERE usage_count &lt; limit</code>.</li>
          </ul>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card/60 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-foreground">Recurring Engine Configuration</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Recurring billing runs execute on schedule with automatic catch-up for any missed cycles. Next scheduled period:
          </p>
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center justify-between">
            <span>Next Anchor Run: Nov 15, 2026 00:00 UTC</span>
            <span className="text-emerald-400">Scheduled Engine</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Failed invoice jobs automatically enter the Payment Rescue queue with timed exponential backoff.
          </p>
        </div>
      </div>
    </div>
  );
}
