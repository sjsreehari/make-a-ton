"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Zap,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  RefreshCw,
} from "lucide-react";

interface LeakageItem {
  id: string;
  type: string;
  title: string;
  description: string;
  amountAtRisk: number;
  entity: string;
  fixed: boolean;
}

const INITIAL_LEAKS: LeakageItem[] = [
  {
    id: "leak-1",
    type: "UNINVOICED_SUBSCRIPTION",
    title: "Active Subscription Never Invoiced",
    description: "SUB-2026-000412 has been active for 45 days with 0 invoices generated.",
    amountAtRisk: 42000,
    entity: "SUB-2026-000412",
    fixed: false,
  },
  {
    id: "leak-2",
    type: "EXPIRED_DISCOUNT",
    title: "Expired Discount Voucher Still Applied",
    description: "Coupon 'STARTUP50' expired on Oct 1st but is still discounting recurring draft invoices.",
    amountAtRisk: 18500,
    entity: "INV-DRAFT-009",
    fixed: false,
  },
  {
    id: "leak-3",
    type: "EXPIRED_ACTIVE_SUB",
    title: "Expired Subscription Still Serving Traffic",
    description: "SUB-2026-000210 contract expired on Sep 30th without renewal or auto-close.",
    amountAtRisk: 14700,
    entity: "SUB-2026-000210",
    fixed: false,
  },
  {
    id: "leak-4",
    type: "WRONG_TAX_RULE",
    title: "Zero Tax Applied to Domestic Client",
    description: "Domestic invoice INV-2026-001102 generated with 0% tax instead of 18% GST.",
    amountAtRisk: 9000,
    entity: "INV-2026-001102",
    fixed: false,
  },
];

export default function LeakagePage() {
  const [leaks, setLeaks] = useState(INITIAL_LEAKS);
  const [fixingId, setFixingId] = useState<string | null>(null);

  const totalAtRisk = leaks
    .filter((l) => !l.fixed)
    .reduce((sum, l) => sum + l.amountAtRisk, 0);

  const handleFix = (id: string) => {
    setFixingId(id);
    setTimeout(() => {
      setFixingId(null);
      setLeaks((prev) => prev.map((l) => (l.id === id ? { ...l, fixed: true } : l)));
    }, 1000);
  };

  const handleFixAll = () => {
    setFixingId("ALL");
    setTimeout(() => {
      setFixingId(null);
      setLeaks((prev) => prev.map((l) => ({ ...l, fixed: true })));
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Revenue Leakage Detector</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automated background scanners identify missed billings, expired discounts, and tax anomalies with 1-click remediation.
          </p>
        </div>

        {totalAtRisk > 0 && (
          <button
            onClick={handleFixAll}
            disabled={fixingId !== null}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-red-600 hover:bg-red-500 text-white transition-colors shadow-md shadow-red-600/20 disabled:opacity-50"
          >
            <Zap className={`size-3.5 ${fixingId === "ALL" ? "animate-spin" : ""}`} />
            {fixingId === "ALL" ? "Fixing All Anomalies..." : "⚡ Fix All 4 Leakages (1-Click)"}
          </button>
        )}
      </div>

      {/* Big Risk Banner */}
      <div className={`p-5 rounded-xl border transition-all ${
        totalAtRisk > 0
          ? "border-red-500/30 bg-red-500/10"
          : "border-emerald-500/30 bg-emerald-500/10"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-xl flex items-center justify-center ${
              totalAtRisk > 0 ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
            }`}>
              {totalAtRisk > 0 ? <AlertTriangle className="size-5" /> : <CheckCircle2 className="size-5" />}
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {totalAtRisk > 0 ? "Identified Capital at Risk" : "Zero Leakage Detected"}
              </span>
              <p className={`text-3xl font-bold font-mono ${
                totalAtRisk > 0 ? "text-red-400" : "text-emerald-400"
              }`}>
                ₹{totalAtRisk.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="text-xs text-zinc-300">
            {totalAtRisk > 0 ? (
              <span>
                {leaks.filter((l) => !l.fixed).length} billing anomalies actively preventing revenue capture.
              </span>
            ) : (
              <span>All detected revenue leakages have been corrected. 100% billing integrity verified.</span>
            )}
          </div>
        </div>
      </div>

      {/* Leaks Cards Grid */}
      <div className="space-y-3">
        {leaks.map((leak) => (
          <div
            key={leak.id}
            className={`p-4 rounded-xl border transition-all ${
              leak.fixed
                ? "border-emerald-500/20 bg-card/40 opacity-70"
                : "border-border bg-card/60 shadow-sm"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                    leak.fixed ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                  }`}>
                    {leak.fixed ? "RESOLVED" : leak.type}
                  </span>
                  <span className="font-semibold text-foreground text-sm">{leak.title}</span>
                </div>
                <p className="text-xs text-zinc-400">{leak.description}</p>
                <span className="text-[11px] font-mono text-zinc-500">Entity: {leak.entity}</span>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block">Impact</span>
                  <span className={`text-base font-bold font-mono ${
                    leak.fixed ? "text-zinc-500 line-through" : "text-red-400"
                  }`}>
                    ₹{leak.amountAtRisk.toLocaleString("en-IN")}
                  </span>
                </div>

                {!leak.fixed ? (
                  <button
                    onClick={() => handleFix(leak.id)}
                    disabled={fixingId !== null}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 transition-colors disabled:opacity-50"
                  >
                    <Zap className={`size-3 ${fixingId === leak.id ? "animate-spin" : ""}`} />
                    {fixingId === leak.id ? "Fixing..." : "⚡ Fix Now"}
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="size-3.5" />
                    Fixed
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
