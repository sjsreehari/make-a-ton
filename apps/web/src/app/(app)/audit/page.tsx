"use client";

import { useEffect, useState } from "react";
import {
  History,
  Search,
  Filter,
  User,
  Shield,
  Layers,
  CreditCard,
  FileText,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";

interface AuditEntry {
  id: string;
  actorId?: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  at: string;
  before?: any;
  after?: any;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEntity, setFilterEntity] = useState("ALL");
  const [search, setSearch] = useState("");

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.audit.list({ limit: 100 });
      if (res && res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const filtered = logs.filter((e) => {
    const matchesEntity = filterEntity === "ALL" || e.entity?.toUpperCase() === filterEntity.toUpperCase();
    const s = search.toLowerCase();
    const matchesSearch =
      (e.actorRole || "").toLowerCase().includes(s) ||
      (e.action || "").toLowerCase().includes(s) ||
      (e.entityId || "").toLowerCase().includes(s) ||
      (e.entity || "").toLowerCase().includes(s);
    return matchesEntity && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Audit Log & State Transitions</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live MySQL Ledger
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable ledger recording every state mutation, user login, billing run, and subscription transition.
          </p>
        </div>

        <button
          onClick={loadAuditLogs}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Ledger
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card/60">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search action, entity ID, actor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md text-xs bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {["ALL", "SUBSCRIPTION", "INVOICE", "PAYMENT", "DISCOUNT", "PLAN", "PRODUCT", "TAXRULE"].map((ent) => (
            <button
              key={ent}
              onClick={() => setFilterEntity(ent)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                filterEntity === ent
                  ? "bg-indigo-600 text-white"
                  : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {ent}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Table */}
      <div className="rounded-xl border border-border bg-card/60 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground bg-muted/30">
              <th className="py-3 px-4 font-medium">Timestamp</th>
              <th className="py-3 px-4 font-medium">Role</th>
              <th className="py-3 px-4 font-medium">Action</th>
              <th className="py-3 px-4 font-medium">Entity</th>
              <th className="py-3 px-4 font-medium">Entity ID</th>
              <th className="py-3 px-4 font-medium">State Mutation Diff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  Loading immutable audit events from MySQL...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  No audit log entries matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((entry) => {
                const diffStr = entry.after
                  ? JSON.stringify(entry.after)
                  : entry.before
                  ? `Before: ${JSON.stringify(entry.before)}`
                  : "Event captured without payload changes";
                return (
                  <tr key={entry.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-zinc-400 whitespace-nowrap">
                      {new Date(entry.at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${
                        entry.actorRole === "ADMIN"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : entry.actorRole === "SYSTEM"
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                          : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                      }`}>
                        {entry.actorRole || "SYSTEM"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-indigo-400">{entry.action}</td>
                    <td className="py-3 px-4 font-semibold text-zinc-200">{entry.entity}</td>
                    <td className="py-3 px-4 font-mono text-zinc-300">{entry.entityId}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-400 max-w-xs truncate" title={diffStr}>
                      {diffStr}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
