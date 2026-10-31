"use client";

import { useState, useEffect, useCallback } from "react";
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
  Plus,
  Loader2,
  Sparkles,
} from "lucide-react";
import { api, type Subscription, type Plan } from "@/lib/api";

interface SubscriptionDisplay {
  id: string;
  number: string;
  customer: string;
  company: string;
  plan: string;
  variant: string;
  seats: number;
  rate: string;
  status: "ACTIVE" | "QUOTATION" | "CONFIRMED" | "PAUSED" | "CLOSED" | "DRAFT";
  startDate: string;
  expiryDate: string;
  pausable: boolean;
  closable: boolean;
  renewable: boolean;
  raw: any;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSub, setSelectedSub] = useState<SubscriptionDisplay | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [creating, setCreating] = useState(false);

  // New Subscription Form State
  const [newCustName, setNewCustName] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newPlanId, setNewPlanId] = useState("");
  const [newSeats, setNewSeats] = useState(5);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.subscriptions.list({ page: 1, limit: 100 });
      if (res.data && Array.isArray(res.data)) {
        const mapped: SubscriptionDisplay[] = res.data.map((s: any) => {
          const planName = s.plan?.name || "Standard Plan";
          const firstLine = s.lines?.[0];
          const variantName = firstLine?.variant?.value || "Default Tier";
          const qty = firstLine?.quantity || 1;
          const unitPrice = parseFloat(firstLine?.unitPrice || s.plan?.price || "999");
          const totalRate = (unitPrice * qty).toFixed(2);
          const period = s.plan?.billingPeriod?.toLowerCase().includes("year") ? "yr" : "mo";

          return {
            id: s.id,
            number: s.number,
            customer: s.customer?.name || "Enterprise Customer",
            company: s.customer?.company || "Corporate Client",
            plan: planName,
            variant: variantName,
            seats: qty,
            rate: `₹${parseFloat(totalRate).toLocaleString()}/${period}`,
            status: s.status,
            startDate: s.startDate ? new Date(s.startDate).toISOString().split("T")[0] : "2026-01-01",
            expiryDate: s.expiryDate ? new Date(s.expiryDate).toISOString().split("T")[0] : "2027-01-01",
            pausable: s.plan?.pausable ?? true,
            closable: s.plan?.closable ?? true,
            renewable: s.plan?.renewable ?? true,
            raw: s,
          };
        });
        setSubscriptions(mapped);
      }
    } catch (err: any) {
      console.error("Failed to load subscriptions from MySQL:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
    api.catalog.plans().then((res) => {
      if (res?.data) {
        setAvailablePlans(res.data);
        if (res.data[0]) setNewPlanId(res.data[0].id);
      }
    }).catch(console.error);
  }, [fetchSubscriptions]);

  const filtered = subscriptions.filter((sub) => {
    const matchesStatus = filterStatus === "ALL" || sub.status === filterStatus;
    const matchesSearch =
      sub.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.plan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleAction = async (subId: string, action: "PAUSE" | "RESUME" | "RENEW" | "CLOSE") => {
    try {
      if (action === "PAUSE") {
        await api.subscriptions.pause(subId);
        setActionNotice("Subscription paused in MySQL! Recurring billing suspended.");
      } else if (action === "RESUME") {
        await api.subscriptions.resume(subId);
        setActionNotice("Subscription resumed in MySQL! Recurring billing active.");
      } else if (action === "RENEW") {
        await api.subscriptions.renew(subId);
        setActionNotice("Subscription renewed in MySQL! Expiry extended.");
      } else if (action === "CLOSE") {
        await api.subscriptions.close(subId, "Early closed via Admin Portal");
        setActionNotice("Subscription closed in MySQL! Audit event logged.");
      }
      setTimeout(() => setActionNotice(null), 4000);
      await fetchSubscriptions();
      if (selectedSub && selectedSub.id === subId) {
        setSelectedSub(null);
      }
    } catch (err: any) {
      alert("Action failed: " + (err?.message || "Server error"));
    }
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanId) return;

    setCreating(true);
    try {
      // Find a customer or first available customer
      const usersRes = await api.users.list();
      const customerUser = usersRes.data?.find((u: any) => u.role === "CUSTOMER") || usersRes.data?.[0];
      const customerId = customerUser?.customerId || customerUser?.id || "seed-customer-1";

      const productsRes = await api.catalog.products();
      const firstProduct = productsRes.data?.[0];
      const productId = firstProduct?.id || "prod-starter";

      await api.subscriptions.create({
        customerId,
        planId: newPlanId,
        startDate: new Date().toISOString(),
        paymentTerm: "NET_15",
        lines: [
          {
            productId,
            quantity: newSeats,
          },
        ],
      });

      setShowAddModal(false);
      setActionNotice("New subscription saved to MySQL database!");
      setTimeout(() => setActionNotice(null), 4000);
      await fetchSubscriptions();
    } catch (err: any) {
      alert("Failed to create subscription: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Subscription Registry</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Directly connected to MySQL database ({subscriptions.length} records). Lifecycle: Draft → Quotation → Confirmed → Active → Closed.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
        >
          <Plus className="size-3.5" />
          <span>New Subscription</span>
        </button>
      </div>

      {actionNotice && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-emerald-200">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card/60">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search SUB #, customer, plan in MySQL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md text-xs bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {["ALL", "ACTIVE", "CONFIRMED", "QUOTATION", "PAUSED", "CLOSED"].map((st) => (
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
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-indigo-500" />
            <p className="text-xs">Fetching live subscriptions from MySQL...</p>
          </div>
        ) : (
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    No subscriptions match the selected criteria in MySQL.
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
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
                            title="Pause Subscription (Writes to MySQL)"
                            onClick={() => handleAction(sub.id, "PAUSE")}
                            className="p-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20"
                          >
                            <Pause className="size-3" />
                          </button>
                        )}
                        {sub.status === "PAUSED" && (
                          <button
                            title="Resume Subscription (Writes to MySQL)"
                            onClick={() => handleAction(sub.id, "RESUME")}
                            className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                          >
                            <Play className="size-3" />
                          </button>
                        )}
                        {sub.renewable && sub.status !== "CLOSED" && (
                          <button
                            title="Renew Subscription (+1 yr in MySQL)"
                            onClick={() => handleAction(sub.id, "RENEW")}
                            className="p-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20"
                          >
                            <RotateCw className="size-3" />
                          </button>
                        )}
                        {sub.closable && sub.status !== "CLOSED" && (
                          <button
                            title="Close Subscription (Writes to MySQL)"
                            onClick={() => handleAction(sub.id, "CLOSE")}
                            className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                          >
                            <XCircle className="size-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
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
              <span className="text-muted-foreground">Allowed Lifecycle Moves</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${selectedSub.pausable ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>Pausable</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${selectedSub.closable ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>Closable</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${selectedSub.renewable ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>Renewable</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground">Create New Subscription in MySQL</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <form onSubmit={handleCreateSubscription} className="space-y-3 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">Select Subscription Plan</label>
                <select
                  value={newPlanId}
                  onChange={(e) => setNewPlanId(e.target.value)}
                  className="w-full p-2 rounded bg-muted/60 border border-border text-foreground"
                >
                  {availablePlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{parseFloat(p.price).toLocaleString()} ({p.billingPeriod})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Seats / Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={newSeats}
                  onChange={(e) => setNewSeats(parseInt(e.target.value) || 1)}
                  className="w-full p-2 rounded bg-muted/60 border border-border text-foreground"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded bg-muted text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5"
                >
                  {creating && <Loader2 className="size-3 animate-spin" />}
                  <span>Save to MySQL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
