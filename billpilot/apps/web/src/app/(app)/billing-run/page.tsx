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
} from "lucide-react";

export default function BillingRunPage() {
  const [running, setRunning] = useState(false);
  const [dryRunRunning, setDryRunRunning] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number; failed: number } | null>(null);
  const [dryRunPreview, setDryRunPreview] = useState<boolean>(false);

  const handleExecuteBilling = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setResult({ created: 482, skipped: 4758, failed: 0 });
    }, 1500);
  };

  const handleDryRun = () => {
    setDryRunRunning(true);
    setTimeout(() => {
      setDryRunRunning(false);
      setDryRunPreview(true);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Bulk Billing Operations</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automated scheduled billing runs with zero duplicate protection and dry-run pre-flight anomaly detection.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDryRun}
            disabled={dryRunRunning || running}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors disabled:opacity-50"
          >
            <Eye className={`size-3.5 ${dryRunRunning ? "animate-spin" : ""}`} />
            {dryRunRunning ? "Analyzing..." : "Billing Dry Run"}
          </button>
          <button
            onClick={handleExecuteBilling}
            disabled={running || dryRunRunning}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            <PlayCircle className={`size-3.5 ${running ? "animate-spin" : ""}`} />
            {running ? "Executing Run..." : "⚡ Run Billing Now"}
          </button>
        </div>
      </div>

      {/* Execution Results Banner */}
      {result && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
            <CheckCircle2 className="size-4" />
            <span>Billing Run Completed Successfully</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-zinc-950/40 border border-emerald-500/20">
              <span className="text-[11px] text-zinc-400">Invoices Created</span>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{result.created}</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-950/40 border border-emerald-500/20">
              <span className="text-[11px] text-zinc-400">Skipped (Already Billed / Not Due)</span>
              <p className="text-xl font-bold font-mono text-zinc-200 mt-0.5">{result.skipped}</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-950/40 border border-emerald-500/20">
              <span className="text-[11px] text-zinc-400">Failed</span>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{result.failed}</p>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 italic">
            * Database unique constraint (subscriptionId, billingPeriodStart) guaranteed zero duplicates even if re-triggered.
          </p>
        </div>
      )}

      {/* Pre-Run Dry Run Warning Panel [T3 4.10] */}
      {dryRunPreview && (
        <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <AlertTriangle className="size-4 text-amber-400" />
              <span>Dry Run Simulation Anomaly Report (3 items flagged)</span>
            </div>
            <button onClick={() => setDryRunPreview(false)} className="text-amber-400 hover:text-amber-200 text-xs">Close</button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">SUB-2026-000412 (Acme Tech)</span>
                <p className="text-zinc-400 text-[11px]">Bill total jumped by 42% vs previous period (seats increased from 10 to 18).</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">+42% Jump</span>
            </div>

            <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">SUB-2026-000882 (Quantum Labs)</span>
                <p className="text-zinc-400 text-[11px]">Product &quot;Custom Addon&quot; has no tax rule assigned. Default 18% GST will be applied.</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Tax Defaulted</span>
            </div>

            <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">Discount &quot;EARLYBIRD20&quot;</span>
                <p className="text-zinc-400 text-[11px]">Usage limit reached (50/50 uses). This run will be the last to include this voucher.</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/20">Limit Reached</span>
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
            <h3 className="text-sm font-semibold text-foreground">Cron Scheduler Configuration</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Recurring billing runs execute on the 1st of every month at 00:00 UTC. Next scheduled run:
          </p>
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center justify-between">
            <span>Next Run: Nov 1, 2026 00:00 UTC</span>
            <span className="text-emerald-400">Scheduled (BullMQ)</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Failed invoice jobs automatically enter the Payment Rescue queue with timed exponential backoff.
          </p>
        </div>
      </div>
    </div>
  );
}
