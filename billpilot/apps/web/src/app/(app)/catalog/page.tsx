"use client";

import { useState } from "react";
import {
  Package,
  Layers,
  Percent,
  Plus,
  CheckCircle2,
  Tag,
  Info,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const PLANS = [
  { id: "p-1", name: "Starter Monthly", price: "₹999.00", period: "MONTHLY", minQty: 1, autoClose: false, pausable: true, closable: true, renewable: true },
  { id: "p-2", name: "Pro Monthly", price: "₹2,499.00", period: "MONTHLY", minQty: 1, autoClose: false, pausable: true, closable: true, renewable: true },
  { id: "p-3", name: "Odoo Subscription Monthly", price: "₹4,999.00", period: "MONTHLY", minQty: 1, autoClose: false, pausable: true, closable: true, renewable: true },
  { id: "p-4", name: "Enterprise Monthly", price: "₹9,999.00", period: "MONTHLY", minQty: 5, autoClose: false, pausable: true, closable: true, renewable: true },
  { id: "p-5", name: "Starter Yearly", price: "₹9,990.00", period: "YEARLY", minQty: 1, autoClose: true, pausable: false, closable: true, renewable: true },
  { id: "p-6", name: "Pro Yearly", price: "₹24,990.00", period: "YEARLY", minQty: 1, autoClose: true, pausable: false, closable: true, renewable: true },
];

const PRODUCTS = [
  { id: "prod-1", name: "Brightloop Core Platform", type: "SERVICE", salesPrice: "₹2,499.00", costPrice: "₹450.00", margin: "82.0%", taxRule: "GST 18%", variants: ["None"] },
  { id: "prod-2", name: "Odoo Connector Suite", type: "INTEGRATION", salesPrice: "₹1,200.00", costPrice: "₹200.00", margin: "83.3%", taxRule: "GST 18%", variants: ["Brand: Odoo (+₹560)"] },
  { id: "prod-3", name: "WhatsApp Notification Gateway", type: "SERVICE", salesPrice: "₹499.00", costPrice: "₹80.00", margin: "84.0%", taxRule: "GST 18%", variants: ["Volume: 10k (+₹350)"] },
  { id: "prod-4", name: "Dedicated IP & SLA Support", type: "ADDON", salesPrice: "₹3,999.00", costPrice: "₹900.00", margin: "77.5%", taxRule: "GST 18%", variants: ["24x7 Phone SLA (+₹1,500)"] },
];

export default function CatalogPage() {
  const [tab, setTab] = useState<"PLANS" | "PRODUCTS">("PLANS");

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Catalog: Plans & Products</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Administer subscription plans, product variants (e.g. Odoo brand +₹560), and margin tracking.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-card/60">
          <button
            onClick={() => setTab("PLANS")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === "PLANS" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Subscription Plans ({PLANS.length})
          </button>
          <button
            onClick={() => setTab("PRODUCTS")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === "PRODUCTS" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Products & Variants ({PRODUCTS.length})
          </button>
        </div>
      </div>

      {tab === "PLANS" ? (
        /* Plans Table */
        <div className="rounded-xl border border-border bg-card/60 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground bg-muted/30">
                <th className="py-3 px-4 font-medium">Plan Name</th>
                <th className="py-3 px-4 font-medium">Base Price</th>
                <th className="py-3 px-4 font-medium">Billing Period</th>
                <th className="py-3 px-4 font-medium">Min Quantity</th>
                <th className="py-3 px-4 font-medium">Pausable</th>
                <th className="py-3 px-4 font-medium">Closable</th>
                <th className="py-3 px-4 font-medium">Auto-Close on Expiry</th>
                <th className="py-3 px-4 font-medium">Renewable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {PLANS.map((plan) => (
                <tr key={plan.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">{plan.name}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">{plan.price}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {plan.period}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-300">{plan.minQty}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${plan.pausable ? "text-emerald-400" : "text-zinc-500"}`}>
                      {plan.pausable ? "✓ Allowed" : "✕ Blocked"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${plan.closable ? "text-emerald-400" : "text-zinc-500"}`}>
                      {plan.closable ? "✓ Allowed" : "✕ Blocked"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${plan.autoClose ? "text-amber-400" : "text-zinc-500"}`}>
                      {plan.autoClose ? "Yes (Auto)" : "No"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${plan.renewable ? "text-emerald-400" : "text-zinc-500"}`}>
                      {plan.renewable ? "✓ Allowed" : "✕ Blocked"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Products & Variants Table */
        <div className="rounded-xl border border-border bg-card/60 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground bg-muted/30">
                <th className="py-3 px-4 font-medium">Product</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Sales Price</th>
                <th className="py-3 px-4 font-medium">Cost Price</th>
                <th className="py-3 px-4 font-medium">Margin</th>
                <th className="py-3 px-4 font-medium">Tax Rule</th>
                <th className="py-3 px-4 font-medium">Configured Variants</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {PRODUCTS.map((prod) => (
                <tr key={prod.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">{prod.name}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">{prod.type}</td>
                  <td className="py-3 px-4 font-mono font-bold text-foreground">{prod.salesPrice}</td>
                  <td className="py-3 px-4 font-mono text-zinc-400">{prod.costPrice}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400 font-medium">{prod.margin}</td>
                  <td className="py-3 px-4 font-mono text-cyan-400">{prod.taxRule}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {prod.variants.map((v) => (
                        <span key={v} className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-200 border border-zinc-700">
                          {v}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
