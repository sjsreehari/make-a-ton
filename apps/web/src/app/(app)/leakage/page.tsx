"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Zap,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import { api, LeakageFinding } from "@/lib/api";

export default function LeakagePage() {
  const [findings, setFindings] = useState<LeakageFinding[]>([]);
  const [totalAtRisk, setTotalAtRisk] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [fixingId, setFixingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchLeakage = async () => {
    try {
      setLoading(true);
      let res = await api.insights.leakage();
      if (!res.findings || res.findings.length === 0) {
        res = await api.insights.scanLeakage();
      }
      setFindings(res.findings || []);
      setTotalAtRisk(res.totalAmountAtRisk || 0);
    } catch (err: any) {
      console.error("Failed to load leakage findings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeakage();
  }, []);

  const handleScan = async () => {
    try {
      setLoading(true);
      const res = await api.insights.scanLeakage();
      setFindings(res.findings || []);
      setTotalAtRisk(res.totalAmountAtRisk || 0);
      setNotice(`Scan complete. Found ${res.totalFindings} potential issues.`);
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to scan leakage");
    } finally {
      setLoading(false);
    }
  };

  const handleFix = async (id: string) => {
    try {
      setFixingId(id);
      await api.insights.fixLeakage(id);
      setNotice("Issue resolved and recorded in the audit log.");
      await fetchLeakage();
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to fix leakage");
    } finally {
      setFixingId(null);
    }
  };

  const handleFixAll = async () => {
    const unresolved = findings.filter((f) => !f.resolvedAt);
    if (!unresolved.length) return;

    try {
      setFixingId("ALL");
      for (const item of unresolved) {
        await api.insights.fixLeakage(item.id).catch(() => {});
      }
      setNotice(`Resolved ${unresolved.length} issues.`);
      await fetchLeakage();
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to fix all leakages");
    } finally {
      setFixingId(null);
    }
  };

  const unresolvedList = findings.filter((f) => !f.resolvedAt);

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Revenue leakage</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Find missed invoices, expired discounts, and tax issues that may affect revenue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleScan}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Scan for issues
          </button>

          {unresolvedList.length > 0 && (
            <button
              onClick={handleFixAll}
              disabled={fixingId !== null}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-red-600 hover:bg-red-500 text-white transition-colors shadow-md shadow-red-600/20 disabled:opacity-50"
            >
              <Zap className={`size-3.5 ${fixingId === "ALL" ? "animate-spin" : ""}`} />
              {fixingId === "ALL" ? "Resolving issues..." : `Resolve all (${unresolvedList.length})`}
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}

      {/* Big Risk Banner */}
      <div
        className={`p-5 rounded-xl border transition-all ${
          totalAtRisk > 0 ? "border-red-500/30 bg-red-500/10" : "border-emerald-500/30 bg-emerald-500/10"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`size-10 rounded-xl flex items-center justify-center ${
                totalAtRisk > 0 ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
              }`}
            >
              {totalAtRisk > 0 ? <AlertTriangle className="size-5" /> : <CheckCircle2 className="size-5" />}
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {totalAtRisk > 0 ? "Identified Capital at Risk" : "Zero Leakage Detected"}
              </span>
              <p className={`text-3xl font-bold font-mono ${totalAtRisk > 0 ? "text-red-400" : "text-emerald-400"}`}>
                ₹{totalAtRisk.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="text-xs text-zinc-300">
            {totalAtRisk > 0 ? (
              <span>
                {unresolvedList.length} billing issues may be affecting revenue.
              </span>
            ) : (
              <span>No unresolved revenue issues were found.</span>
            )}
          </div>
        </div>
      </div>

      {/* Leaks Cards Grid */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground flex items-center justify-center gap-2">
            <RefreshCw className="size-4 animate-spin text-indigo-400" />
            <span>Checking for revenue issues...</span>
          </div>
        ) : findings.length === 0 ? (
          <div className="p-8 rounded-xl border border-border bg-card/40 text-center text-muted-foreground">
            No leakage findings detected. Run a scan anytime to inspect live subscriptions and invoices.
          </div>
        ) : (
          findings.map((leak) => {
            const isResolved = !!leak.resolvedAt;

            return (
              <div
                key={leak.id}
                className={`p-4 rounded-xl border transition-all ${
                  isResolved
                    ? "border-emerald-500/20 bg-emerald-500/5 opacity-70"
                    : "border-border bg-card/60 hover:border-zinc-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {leak.kind}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">Entity: {leak.entityId}</span>
                      {isResolved && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {typeof leak.detail === "string" ? leak.detail : JSON.stringify(leak.detail)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground block uppercase">At Risk</span>
                      <span
                        className={`text-sm font-bold font-mono ${
                          isResolved ? "line-through text-zinc-500" : "text-red-400"
                        }`}
                      >
                        ₹{Number(leak.amountAtRisk || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    {!isResolved && (
                      <button
                        onClick={() => handleFix(leak.id)}
                        disabled={fixingId !== null}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
                      >
                        <Zap className={`size-3 ${fixingId === leak.id ? "animate-spin" : ""}`} />
                        {fixingId === leak.id ? "Resolving..." : "Resolve"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
