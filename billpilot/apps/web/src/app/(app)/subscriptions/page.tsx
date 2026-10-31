"use client";

import { useState } from "react";
import {
  Layers,
  Search,
  Filter,
  Play,
  Pause,
  RotateCw,
  XCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

interface SubscriptionItem {
  id: string;
  number: string;
  customer: string;
  company: string;
  plan: string;
  variant: string;
  seats: number;
  rate: string;
  status: "ACTIVE" | "QUOTATION" | "CONFIRMED" | "PAUSED" | "CLOSED";
  startDate: string;
  expiryDate: string;
  pausable: boolean;
  closable: boolean;
  renewable: boolean;
}

const INITIAL_SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: "sub-001",
    number: "SUB-2026-000123",
    customer: "Rohan Sharma",
    company: "Apex Global Ltd",
    plan: "Odoo Subscription Monthly",
    variant: "Brand: Odoo (+₹560/seat)",
    seats: 10,
    rate: "₹55,590/mo",
    status: "ACTIVE",
    startDate: "2026-01-15",
    expiryDate: "2027-01-14",
    pausable: true,
    closable: true,
    renewable: true,
  },
  {
    id: "sub-002",
    number: "SUB-2026-000124",
    customer: "Ananya Iyer",
    company: "Zenith Infotech",
    plan: "Pro Monthly",
    variant: "Standard Tier",
    seats: 5,
    rate: "₹12,495/mo",
    status: "ACTIVE",
    startDate: "2026-03-01",
    expiryDate: "2027-02-28",
    pausable: true,
    closable: true,
    renewable: true,
  },
  {
    id: "sub-003",
    number: "SUB-2026-000125",
    customer: "Vikram Nair",
    company: "Vector Media",
    plan: "Starter Monthly",
    variant: "Single Seat",
    seats: 1,
    rate: "₹999/mo",
    status: "PAUSED",
    startDate: "2026-02-10",
    expiryDate: "2027-02-09",
    pausable: true,
    closable: true,
    renewable: true,
  },
  {
    id: "sub-004",
    number: "SUB-2026-000126",
    customer: "Priya Menon",
    company: "CloudNative Labs",
    plan: "Enterprise Monthly",
    variant: "Multi-Region Cloud",
    seats: 25,
    rate: "₹2,49,975/mo",
    status: "QUOTATION",
    startDate: "2026-11-01",
    expiryDate: "2027-10-31",
    pausable: true,
    closable: true,
    renewable: true,
  },
  {
    id: "sub-005",
    number: "SUB-2026-000127",
    customer: "Suresh Patel",
    company: "Brightwave Studio",
    plan: "Starter Yearly",
    variant: "Standard Annual",
    seats: 3,
    rate: "₹29,970/yr",
    status: "CLOSED",
    startDate: "2025-05-01",
    expiryDate: "2026-04-30",
    pausable: false,
    closable: true,
    renewable: false,
  },
];

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState(INITIAL_SUBSCRIPTIONS);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSub, setSelectedSub] = useState<SubscriptionItem | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filtered = subscriptions.filter((sub) => {
    const matchesStatus = filterStatus === "ALL" || sub.status === filterStatus;
    const matchesSearch =
      sub.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.plan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleAction = (subId: string, action: "PAUSE" | "RESUME" | "RENEW" | "CLOSE") => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id !== subId) return s;
        if (action === "PAUSE") return { ...s, status: "PAUSED" };
        if (action === "RESUME") return { ...s, status: "ACTIVE" };
        if (action === "CLOSE") return { ...s, status: "CLOSED" };
        if (action === "RENEW") return { ...s, expiryDate: "2028-01-14", status: "ACTIVE" };
        return s;
      })
    );

    const msg =
      action === "PAUSE"
        ? "Subscription paused! Automated monthly billing suspended."
        : action === "RESUME"
        ? "Subscription resumed! Recurring billing active."
        : action === "RENEW"
        ? "Subscription renewed! Expiry extended by 1 year."
        : "Subscription closed early. Audit record saved with reason.";
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);

    if (selectedSub && selectedSub.id === subId) {
      setSelectedSub((curr) => {
        if (!curr) return null;
        if (action === "PAUSE") return { ...curr, status: "PAUSED" };
        if (action === "RESUME") return { ...curr, status: "ACTIVE" };
        if (action === "CLOSE") return { ...curr, status: "CLOSED" };
        if (action === "RENEW") return { ...curr, expiryDate: "2028-01-14", status: "ACTIVE" };
        return curr;
      });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Subscription Registry</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full lifecycle control: Draft → Quotation → Confirmed → Active → Closed with plan rule enforcement.
          </p>
        </div>
      </div>

      {actionNotice && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-indigo-400" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-indigo-400 hover:text-indigo-200">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card/60">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search SUB #, customer, company, plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md text-xs bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {["ALL", "ACTIVE", "QUOTATION", "PAUSED", "CLOSED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filterStatus === st
                  ? "bg-indigo-600 text-white"
                  : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-xl border border-border bg-card/60 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground bg-muted/30">
              <th className="py-3 px-4 font-medium">Subscription #</th>
              <th className="py-3 px-4 font-medium">Customer / Company</th>
              <th className="py-3 px-4 font-medium">Plan & Variant</th>
              <th className="py-3 px-4 font-medium">Seats</th>
              <th className="py-3 px-4 font-medium">Recurring Rate</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Expiry Date</th>
              <th className="py-3 px-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.map((sub) => (
              <tr
                key={sub.id}
                onClick={() => setSelectedSub(sub)}
                className={`hover:bg-muted/40 transition-colors cursor-pointer ${
                  selectedSub?.id === sub.id ? "bg-muted/60" : ""
                }`}
              >
                <td className="py-3 px-4 font-mono font-medium text-foreground">{sub.number}</td>
                <td className="py-3 px-4">
                  <div className="font-medium text-foreground">{sub.customer}</div>
                  <div className="text-[11px] text-muted-foreground">{sub.company}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-foreground">{sub.plan}</div>
                  <div className="text-[10px] text-indigo-400 font-mono">{sub.variant}</div>
                </td>
                <td className="py-3 px-4 font-mono text-zinc-300">{sub.seats}</td>
                <td className="py-3 px-4 font-mono font-medium text-foreground">{sub.rate}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      sub.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : sub.status === "PAUSED"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : sub.status === "CLOSED"
                        ? "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {sub.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-zinc-400 font-mono">{sub.expiryDate}</td>
                <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    {sub.status === "ACTIVE" && sub.pausable && (
                      <button
                        title="Pause Subscription"
                        onClick={() => handleAction(sub.id, "PAUSE")}
                        className="p-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20"
                      >
                        <Pause className="size-3" />
                      </button>
                    )}
                    {sub.status === "PAUSED" && (
                      <button
                        title="Resume Subscription"
                        onClick={() => handleAction(sub.id, "RESUME")}
                        className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                      >
                        <Play className="size-3" />
                      </button>
                    )}
                    {sub.renewable && sub.status !== "CLOSED" && (
                      <button
                        title="Renew Subscription (+1 yr)"
                        onClick={() => handleAction(sub.id, "RENEW")}
                        className="p-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20"
                      >
                        <RotateCw className="size-3" />
                      </button>
                    )}
                    {sub.closable && sub.status !== "CLOSED" && (
                      <button
                        title="Early Close Subscription"
                        onClick={() => handleAction(sub.id, "CLOSE")}
                        className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                      >
                        <XCircle className="size-3" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Subscription Detail Drawer Modal if selected */}
      {selectedSub && (
        <div className="p-5 rounded-xl border border-indigo-500/30 bg-card/90 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-foreground">{selectedSub.number}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {selectedSub.plan}
              </span>
            </div>
            <button onClick={() => setSelectedSub(null)} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Customer</span>
              <p className="font-medium text-foreground mt-0.5">{selectedSub.customer}</p>
              <p className="text-[11px] text-zinc-400">{selectedSub.company}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Contract Lifecycle</span>
              <p className="font-mono text-foreground mt-0.5">Start: {selectedSub.startDate}</p>
              <p className="font-mono text-zinc-400">Expires: {selectedSub.expiryDate}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Pricing & Variants</span>
              <p className="font-mono font-medium text-emerald-400 mt-0.5">{selectedSub.rate}</p>
              <p className="text-[11px] text-indigo-400 font-mono">{selectedSub.variant}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Allowed Switches</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${selectedSub.pausable ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>Pausable</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${selectedSub.closable ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>Closable</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${selectedSub.renewable ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>Renewable</span>
              </div>
            </div>
          </div>

          {/* Timeline Audit History */}
          <div className="pt-3 border-t border-border">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
              <Clock className="size-3.5 text-indigo-400" />
              Lifecycle Audit Trail
            </span>
            <div className="space-y-1.5 text-[11px] text-zinc-300">
              <div className="flex items-center gap-2">
                <span className="font-mono text-muted-foreground">2026-01-15 10:00</span>
                <span className="text-emerald-400 font-medium">Activated</span>
                <span>— Quote confirmed and automated recurring billing initiated.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-muted-foreground">2026-01-14 15:30</span>
                <span className="text-indigo-400 font-medium">Quoted</span>
                <span>— Quotation draft created from template & sent to customer.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

