"use client";

import { useState, useEffect } from "react";
import {
  Percent,
  Receipt,
  Plus,
  ShieldCheck,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  RefreshCw,
  X,
} from "lucide-react";
import { api, Discount, TaxRule } from "@/lib/api";

export default function DiscountsTaxesPage() {
  const [tab, setTab] = useState<"DISCOUNTS" | "TAXES">("DISCOUNTS");
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // Modal States
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);

  // Discount Form State
  const [dCode, setDCode] = useState("");
  const [dName, setDName] = useState("");
  const [dType, setDType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [dValue, setDValue] = useState("15");
  const [dUsageLimit, setDUsageLimit] = useState("50");

  // Tax Form State
  const [tName, setTName] = useState("");
  const [tRate, setTRate] = useState("18");
  const [tRegion, setTRegion] = useState("India (All)");

  // Live margin simulator math
  const [simSeats, setSimSeats] = useState(10);
  const [simDiscountPct, setSimDiscountPct] = useState(15);
  const baseRevenue = simSeats * 2499; // Pro Monthly
  const discountedRevenue = baseRevenue * (1 - simDiscountPct / 100);
  const totalCost = simSeats * 450;
  const marginAmt = discountedRevenue - totalCost;
  const marginPct = ((marginAmt / discountedRevenue) * 100).toFixed(1);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dRes, tRes] = await Promise.all([api.discounts.list(), api.taxes.list()]);
      setDiscounts(dRes.data || []);
      setTaxRules(tRes.data || []);
    } catch (err: any) {
      console.error("Failed to load taxes/discounts from MySQL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dCode || !dValue) return;

    try {
      const now = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(now.getFullYear() + 1);

      await api.discounts.create({
        code: dCode.toUpperCase().trim(),
        name: dName || `${dCode} Voucher`,
        type: dType,
        value: Number(dValue),
        scope: "SUBSCRIPTION",
        startsAt: now.toISOString(),
        endsAt: nextYear.toISOString(),
        usageLimit: dUsageLimit ? parseInt(dUsageLimit) : undefined,
      });

      setShowDiscountModal(false);
      setDCode("");
      setDName("");
      setNotice(`Discount coupon ${dCode.toUpperCase()} saved to MySQL!`);
      await fetchData();
      setTimeout(() => setNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || "Failed to create discount in MySQL");
    }
  };

  const handleDeleteDiscount = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete discount ${code}?`)) return;
    try {
      await api.discounts.delete(id);
      setNotice(`Discount ${code} removed from MySQL!`);
      await fetchData();
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to delete discount");
    }
  };

  const handleCreateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName || !tRate) return;

    try {
      await api.taxes.create({
        name: tName,
        ratePercent: Number(tRate),
        region: tRegion,
        isInclusive: false,
      });

      setShowTaxModal(false);
      setTName("");
      setNotice(`Tax rule "${tName}" saved to MySQL!`);
      await fetchData();
      setTimeout(() => setNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || "Failed to create tax rule in MySQL");
    }
  };

  const handleDeleteTax = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete tax rule "${name}"?`)) return;
    try {
      await api.taxes.delete(id);
      setNotice(`Tax rule "${name}" removed from MySQL!`);
      await fetchData();
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to delete tax rule");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Taxes & Discounts</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              MySQL Live
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Administer GST tax rules, auto-applying discount vouchers, and concurrency-safe limits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 rounded-md border border-border bg-card hover:bg-muted text-foreground transition-colors"
            title="Refresh from MySQL"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-card/60">
            <button
              onClick={() => setTab("DISCOUNTS")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === "DISCOUNTS" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Discounts ({discounts.length})
            </button>
            <button
              onClick={() => setTab("TAXES")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === "TAXES" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              GST Tax Rules ({taxRules.length})
            </button>
          </div>

          {tab === "DISCOUNTS" ? (
            <button
              onClick={() => setShowDiscountModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              <Plus className="size-3.5" />
              New Discount
            </button>
          ) : (
            <button
              onClick={() => setShowTaxModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              <Plus className="size-3.5" />
              New Tax Rule
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

      {tab === "DISCOUNTS" ? (
        <div className="space-y-6">
          {/* Discounts Table */}
          <div className="rounded-xl border border-border bg-card/60 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground bg-muted/30">
                  <th className="py-3 px-4 font-medium">Coupon Code</th>
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">Value</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Usage Limit</th>
                  <th className="py-3 px-4 font-medium">Expires At</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="size-4 animate-spin text-indigo-400" />
                        <span>Loading discounts from MySQL...</span>
                      </div>
                    </td>
                  </tr>
                ) : discounts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No discounts found in database. Click &quot;New Discount&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  discounts.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">{d.code}</td>
                      <td className="py-3 px-4 text-foreground font-medium">{d.name}</td>
                      <td className="py-3 px-4 font-mono font-medium text-emerald-400">
                        {d.type === "PERCENTAGE" ? `${Number(d.value)}%` : `₹${Number(d.value).toLocaleString("en-IN")}`}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">{d.type}</td>
                      <td className="py-3 px-4 font-mono text-zinc-300">
                        {d.usageLimit ? `${d.usedCount} / ${d.usageLimit}` : "Unlimited"}
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-400">
                        {new Date(d.endsAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                            d.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {d.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteDiscount(d.id, d.code)}
                          className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete discount"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Margin-Aware Discount Simulator */}
          <div className="p-5 rounded-xl border border-indigo-500/30 bg-card/60 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Percent className="size-4 text-indigo-400" />
                Live Margin Impact Simulator
              </h3>
              <p className="text-xs text-muted-foreground">
                Simulate discount impact on unit economics before approving customer coupons.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  User Seats: <strong className="text-foreground">{simSeats}</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={simSeats}
                  onChange={(e) => setSimSeats(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Discount Percentage: <strong className="text-foreground">{simDiscountPct}%</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={simDiscountPct}
                  onChange={(e) => setSimDiscountPct(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400">Gross Price</span>
                <p className="text-base font-bold font-mono text-zinc-300 mt-0.5">₹{baseRevenue.toLocaleString("en-IN")}</p>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400">Discounted Total</span>
                <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">₹{discountedRevenue.toLocaleString("en-IN")}</p>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400">Platform Cost</span>
                <p className="text-base font-bold font-mono text-zinc-300 mt-0.5">₹{totalCost.toLocaleString("en-IN")}</p>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400">Net Profit Margin</span>
                <p className="text-base font-bold font-mono text-indigo-400 mt-0.5">{marginPct}%</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Taxes Table */
        <div className="rounded-xl border border-border bg-card/60 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground bg-muted/30">
                <th className="py-3 px-4 font-medium">Tax Rule</th>
                <th className="py-3 px-4 font-medium">Rate</th>
                <th className="py-3 px-4 font-medium">Calculation Type</th>
                <th className="py-3 px-4 font-medium">Applicable Region</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="size-4 animate-spin text-indigo-400" />
                      <span>Loading tax rules from MySQL...</span>
                    </div>
                  </td>
                </tr>
              ) : taxRules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No tax rules found in database.
                  </td>
                </tr>
              ) : (
                taxRules.map((tax) => (
                  <tr key={tax.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{tax.name}</td>
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">{Number(tax.ratePercent)}%</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                      {tax.isInclusive ? "INCLUSIVE" : "EXCLUSIVE"}
                    </td>
                    <td className="py-3 px-4 text-zinc-300">{tax.region}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        ACTIVE
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteTax(tax.id, tax.name)}
                        className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Delete tax rule"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Create Discount */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-foreground">Create New Discount Voucher (MySQL)</h3>
              <button onClick={() => setShowDiscountModal(false)} className="text-zinc-400 hover:text-white">
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleCreateDiscount} className="space-y-3 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  placeholder="e.g. FLASH25"
                  value={dCode}
                  onChange={(e) => setDCode(e.target.value.toUpperCase())}
                  required
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Description / Name</label>
                <input
                  type="text"
                  placeholder="e.g. Flash Sale 25% Off"
                  value={dName}
                  onChange={(e) => setDName(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-muted-foreground block mb-1">Discount Type</label>
                  <select
                    value={dType}
                    onChange={(e) => setDType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">Value ({dType === "PERCENTAGE" ? "%" : "₹"})</label>
                  <input
                    type="number"
                    value={dValue}
                    onChange={(e) => setDValue(e.target.value)}
                    required
                    min="1"
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Max Redemptions Limit</label>
                <input
                  type="number"
                  placeholder="e.g. 100 (or leave empty for unlimited)"
                  value={dUsageLimit}
                  onChange={(e) => setDUsageLimit(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDiscountModal(false)}
                  className="px-4 py-2 rounded text-xs bg-zinc-800 hover:bg-zinc-700 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Save to MySQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Tax Rule */}
      {showTaxModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-foreground">Create GST Tax Rule (MySQL)</h3>
              <button onClick={() => setShowTaxModal(false)} className="text-zinc-400 hover:text-white">
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTax} className="space-y-3 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">Tax Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. GST Standard 18%"
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-muted-foreground block mb-1">Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="18"
                    value={tRate}
                    onChange={(e) => setTRate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">Applicable Region</label>
                  <input
                    type="text"
                    value={tRegion}
                    onChange={(e) => setTRegion(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTaxModal(false)}
                  className="px-4 py-2 rounded text-xs bg-zinc-800 hover:bg-zinc-700 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Save to MySQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
