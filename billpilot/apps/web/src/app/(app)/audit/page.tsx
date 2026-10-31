"use client";

import { useState } from "react";
import {
  History,
  Search,
  Filter,
  User,
  Shield,
  Layers,
  CreditCard,
  FileText,
} from "lucide-react";

interface AuditEntry {
  id: string;
  actor: string;
  role: "ADMIN" | "STAFF" | "SYSTEM";
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  diff: string;
}

const AUDIT_DATA: AuditEntry[] = [
  {
    id: "aud-1",
    actor: "admin@brightloop.test",
    role: "ADMIN",
    action: "DISCOUNT_CREATED",
    entity: "DISCOUNT",
    entityId: "disc-STARTUP50",
    timestamp: "2026-10-31 10:45:12",
    diff: '{"code": "STARTUP50", "value": 50, "type": "PERCENT", "limit": 20}',
  },
  {
    id: "aud-2",
    actor: "staff@brightloop.test",
    role: "STAFF",
    action: "SUBSCRIPTION_PAUSED",
    entity: "SUBSCRIPTION",
    entityId: "SUB-2026-000125",
    timestamp: "2026-10-31 09:12:00",
    diff: '{"status": {"old": "ACTIVE", "new": "PAUSED"}, "reason": "Customer request via WhatsApp"}',
  },
  {
    id: "aud-3",
    actor: "SYSTEM_CRON",
    role: "SYSTEM",
    action: "INVOICE_GENERATED",
    entity: "INVOICE",
    entityId: "INV-2026-000042",
    timestamp: "2026-10-31 00:00:02",
    diff: '{"subscriptionId": "sub-001", "total": "65596.20", "idempotencyKey": "sub-001:2026-10-01"}',
  },
  {
    id: "aud-4",
    actor: "RAZORPAY_WEBHOOK",
    role: "SYSTEM",
    action: "PAYMENT_SUCCEEDED",
    entity: "PAYMENT",
    entityId: "pay_12893892",
    timestamp: "2026-10-30 14:22:45",
    diff: '{"invoiceId": "inv-002", "amount": "14744.10", "signature": "hmac_verified"}',
  },
];

export default function AuditPage() {
  const [filterEntity, setFilterEntity] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = AUDIT_DATA.filter((e) => {
    const matchesEntity = filterEntity === "ALL" || e.entity === filterEntity;
    const matchesSearch =
      e.actor.toLowerCase().includes(search.toLowerCase()) ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.entityId.toLowerCase().includes(search.toLowerCase());
    return matchesEntity && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Audit Log & State Transitions</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable, cryptographically verifiable ledger recording every domain entity state change.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card/60">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search actor, action, entity ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md text-xs bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {["ALL", "SUBSCRIPTION", "INVOICE", "PAYMENT", "DISCOUNT"].map((ent) => (
            <button
              key={ent}
              onClick={() => setFilterEntity(ent)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
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
              <th className="py-3 px-4 font-medium">Actor</th>
              <th className="py-3 px-4 font-medium">Role</th>
              <th className="py-3 px-4 font-medium">Action</th>
              <th className="py-3 px-4 font-medium">Entity ID</th>
              <th className="py-3 px-4 font-medium">State Mutation Diff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.map((entry) => (
              <tr key={entry.id} className="hover:bg-muted/40 transition-colors">
                <td className="py-3 px-4 font-mono text-zinc-400 whitespace-nowrap">{entry.timestamp}</td>
                <td className="py-3 px-4 font-medium text-foreground">{entry.actor}</td>
                <td className="py-3 px-4">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {entry.role}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono font-medium text-indigo-400">{entry.action}</td>
                <td className="py-3 px-4 font-mono text-zinc-300">{entry.entityId}</td>
                <td className="py-3 px-4 font-mono text-[11px] text-zinc-400 max-w-md truncate">
                  {entry.diff}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
