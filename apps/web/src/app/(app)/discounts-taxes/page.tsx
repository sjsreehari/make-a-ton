"use client";

import { useState } from "react";
import {
  Percent,
  Receipt,
  Plus,
  ShieldCheck,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const TAX_RULES = [
  { id: "tr-1", name: "GST Standard 18%", rate: 18.0, region: "India (All)", type: "EXCLUSIVE", assignedProducts: 8 },
  { id: "tr-2", name: "GST Reduced 12%", rate: 12.0, region: "India (All)", type: "EXCLUSIVE", assignedProducts: 2 },
  { id: "tr-3", name: "GST Nil 0%", rate: 0.0, region: "SEZ / Export", type: "EXCLUSIVE", assignedProducts: 2 },
];

const DISCOUNTS = [
  { id: "disc-1", code: "STARTUP50", type: "PERCENT", value: "50%", minSpend: "₹5,000", used: 12, limit: 20, validUntil: "2026-12-31", status: "ACTIVE" },
  { id: "disc-2", code: "ANNUALSAVE10", type: "PERCENT", value: "10%", minSpend: "₹20,000", used: 45, limit: 100, validUntil: "2026-11-30", status: "ACTIVE" },
  { id: "disc-3", code: "FLAT500", type: "FIXED", value: "₹500.00", minSpend: "₹2,000", used: 50, limit: 50, validUntil: "2026-10-15", status: "EXPIRED_LIMIT" },
];

export default function DiscountsTaxesPage() {
  const [tab, setTab] = useState<"DISCOUNTS" | "TAXES">("DISCOUNTS");
  const [simSeats, setSimSeats] = useState(10);
  const [simDiscountPct, setSimDiscountPct] = useState(15);

  // Live margin simulator math
  const baseRevenue = simSeats * 2499; // Pro Monthly
  const discountedRevenue = baseRevenue * (1 - simDiscountPct / 100);
  const totalCost = simSeats * 450;
  const marginAmt = discountedRevenue - totalCost;
  const marginPct = ((marginAmt / discountedRevenue) * 100).toFixed(1);

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Taxes & Discounts</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Administer GST tax rules, auto-applying discount vouchers, and concurrency-safe limits.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-card/60">
          <button
            onClick={() => setTab("DISCOUNTS")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === "DISCOUNTS" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Discounts & Vouchers ({DISCOUNTS.length})
          </button>
          <button
            onClick={() => setTab("TAXES")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === "TAXES" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            GST Tax Rules ({TAX_RULES.length})
          </button>
        </div>
      </div>

      {tab === "DISCOUNTS" ? (
        <div className="space-y-6">
          {/* Discounts Table */}
          <div className="rounded-xl border border-border bg-card/60 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground bg-muted/30">
                  <th className="py-3 px-4 font-medium">Coupon Code</th>
                  <th className="py-3 px-4 font-medium">Discount Value</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Min Spend Condition</th>
                  <th className="py-3 px-4 font-medium">Usage Progress</th>
                  <th className="py-3 px-4 font-medium">Expiry Date</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {DISCOUNTS.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">{d.code}</td>
                    <td className="py-3 px-4 font-mono font-medium text-emerald-400">{d.value}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">{d.type}</td>
                    <td className="py-3 px-4 font-mono text-zinc-300">{d.minSpend}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className={`h-full ${d.used >= d.limit ? "bg-red-500" : "bg-indigo-500"}`}
                            style={{ width: `${(d.used / d.limit) * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {d.used}/{d.limit}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-400">{d.validUntil}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          d.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Margin-Aware Discount Simulator [T3 6.6] */}
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
                <th className="py-3 px-4 font-medium">Applicable Jurisdiction</th>
                <th className="py-3 px-4 font-medium">Assigned Products</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {TAX_RULES.map((tax) => (
                <tr key={tax.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">{tax.name}</td>
                  <td className="py-3 px-4 font-mono font-bold text-cyan-400">{tax.rate}%</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">{tax.type}</td>
                  <td className="py-3 px-4 text-zinc-300">{tax.region}</td>
                  <td className="py-3 px-4 font-mono text-zinc-300">{tax.assignedProducts} products</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

