"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Layers,
  Plus,
  Trash2,
  RefreshCw,
  X,
  CheckCircle2,
  Tag,
} from "lucide-react";
import { api, Plan, Product, TaxRule } from "@/lib/api";

export default function CatalogPage() {
  const [tab, setTab] = useState<"PLANS" | "PRODUCTS">("PLANS");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // Modals
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState<string | null>(null);

  // New Plan State
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("2499");
  const [planPeriod, setPlanPeriod] = useState<"DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY">("MONTHLY");
  const [planMinQty, setPlanMinQty] = useState("1");
  const [planAutoClose, setPlanAutoClose] = useState(false);

  // New Product State
  const [prodName, setProdName] = useState("");
  const [prodType, setProdType] = useState("SERVICE");
  const [prodSalesPrice, setProdSalesPrice] = useState("2499");
  const [prodCostPrice, setProdCostPrice] = useState("450");
  const [prodTaxId, setProdTaxId] = useState("");

  // New Variant State
  const [varAttr, setVarAttr] = useState("Brand");
  const [varVal, setVarVal] = useState("Odoo");
  const [varExtraPrice, setVarExtraPrice] = useState("560");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, prodsRes, taxesRes] = await Promise.all([
        api.catalog.plans(),
        api.catalog.products(),
        api.taxes.list(),
      ]);
      setPlans(plansRes.data || []);
      setProducts(prodsRes.data || []);
      setTaxRules(taxesRes.data || []);
      if (taxesRes.data?.[0]) setProdTaxId(taxesRes.data[0].id);
    } catch (err: any) {
      console.error("Failed to load catalog from MySQL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName || !planPrice) return;

    try {
      await api.catalog.createPlan({
        name: planName,
        price: Number(planPrice),
        billingPeriod: planPeriod,
        minQuantity: parseInt(planMinQty) || 1,
        autoClose: planAutoClose,
        pausable: true,
        closable: true,
        renewable: true,
      });

      setShowPlanModal(false);
      setPlanName("");
      setNotice(`Subscription Plan "${planName}" created in MySQL!`);
      await fetchData();
      setTimeout(() => setNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || "Failed to create plan in MySQL");
    }
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (!confirm(`Delete or deactivate plan "${name}"?`)) return;
    try {
      await api.catalog.deletePlan(id);
      setNotice(`Plan "${name}" removed/deactivated in MySQL!`);
      await fetchData();
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to delete plan");
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodSalesPrice) return;

    try {
      await api.catalog.createProduct({
        name: prodName,
        type: prodType,
        salesPrice: Number(prodSalesPrice),
        costPrice: Number(prodCostPrice),
        taxRuleId: prodTaxId || undefined,
      });

      setShowProductModal(false);
      setProdName("");
      setNotice(`Product "${prodName}" created in MySQL!`);
      await fetchData();
      setTimeout(() => setNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || "Failed to create product in MySQL");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Delete or deactivate product "${name}"?`)) return;
    try {
      await api.catalog.deleteProduct(id);
      setNotice(`Product "${name}" removed/deactivated in MySQL!`);
      await fetchData();
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    }
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showVariantModal || !varVal) return;

    try {
      await api.catalog.addVariant({
        productId: showVariantModal,
        attribute: varAttr,
        value: varVal,
        extraPrice: Number(varExtraPrice),
      });

      setShowVariantModal(null);
      setNotice(`Variant "${varAttr}: ${varVal} (+₹${varExtraPrice})" added to product in MySQL!`);
      await fetchData();
      setTimeout(() => setNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || "Failed to add variant in MySQL");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Catalog: Plans & Products</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              MySQL Live
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Administer subscription plans, product variants (e.g. Odoo brand +₹560), and margin tracking.
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
              onClick={() => setTab("PLANS")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === "PLANS" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Subscription Plans ({plans.length})
            </button>
            <button
              onClick={() => setTab("PRODUCTS")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === "PRODUCTS" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Products & Variants ({products.length})
            </button>
          </div>

          {tab === "PLANS" ? (
            <button
              onClick={() => setShowPlanModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              <Plus className="size-3.5" />
              New Plan
            </button>
          ) : (
            <button
              onClick={() => setShowProductModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              <Plus className="size-3.5" />
              New Product
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
                <th className="py-3 px-4 font-medium">Auto-Close</th>
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
                      <span>Loading plans from MySQL...</span>
                    </div>
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    No subscription plans found in MySQL database.
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{plan.name}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      ₹{Number(plan.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {plan.billingPeriod}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-300">{plan.minQuantity}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${plan.pausable ? "text-emerald-400" : "text-zinc-500"}`}>
                        {plan.pausable ? "✓ Allowed" : "✕ Blocked"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${plan.autoClose ? "text-amber-400" : "text-zinc-500"}`}>
                        {plan.autoClose ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          plan.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {plan.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeletePlan(plan.id, plan.name)}
                        className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Delete or Deactivate Plan"
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
                <th className="py-3 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="size-4 animate-spin text-indigo-400" />
                      <span>Loading products from MySQL...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    No products found in MySQL database. Click &quot;New Product&quot; to create one.
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const sp = Number(prod.salesPrice) || 0;
                  const cp = Number(prod.costPrice) || 0;
                  const marginPct = sp > 0 ? (((sp - cp) / sp) * 100).toFixed(1) : "0.0";

                  return (
                    <tr key={prod.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{prod.name}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">{prod.type}</td>
                      <td className="py-3 px-4 font-mono font-bold text-foreground">
                        ₹{sp.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-400">
                        ₹{cp.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-400 font-medium">{marginPct}%</td>
                      <td className="py-3 px-4 font-mono text-cyan-400">
                        {prod.taxRule?.name || "Standard (18%)"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1">
                          {(prod.variants || []).map((v) => (
                            <span
                              key={v.id || v.value}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-200 border border-zinc-700"
                            >
                              {v.attribute}: {v.value} (+₹{Number(v.extraPrice).toLocaleString("en-IN")})
                            </span>
                          ))}
                          <button
                            onClick={() => setShowVariantModal(prod.id)}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 flex items-center gap-0.5"
                          >
                            <Plus className="size-2.5" />
                            Variant
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete or Deactivate Product"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Create Plan */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-foreground">Create Subscription Plan (MySQL)</h3>
              <button onClick={() => setShowPlanModal(false)} className="text-zinc-400 hover:text-white">
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePlan} className="space-y-3 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">Plan Name</label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise Monthly"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-muted-foreground block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                    required
                    min="1"
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">Billing Period</label>
                  <select
                    value={planPeriod}
                    onChange={(e) => setPlanPeriod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="DAILY">Daily</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-muted-foreground block mb-1">Min Quantity / Seats</label>
                  <input
                    type="number"
                    value={planMinQty}
                    onChange={(e) => setPlanMinQty(e.target.value)}
                    min="1"
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                    <input
                      type="checkbox"
                      checked={planAutoClose}
                      onChange={(e) => setPlanAutoClose(e.target.checked)}
                      className="accent-indigo-500 rounded"
                    />
                    <span>Auto-close on expiry</span>
                  </label>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
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

      {/* Modal: Create Product */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-foreground">Create Product (MySQL)</h3>
              <button onClick={() => setShowProductModal(false)} className="text-zinc-400 hover:text-white">
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Odoo Connector Suite"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-muted-foreground block mb-1">Sales Price (₹)</label>
                  <input
                    type="number"
                    value={prodSalesPrice}
                    onChange={(e) => setProdSalesPrice(e.target.value)}
                    required
                    min="1"
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    value={prodCostPrice}
                    onChange={(e) => setProdCostPrice(e.target.value)}
                    required
                    min="0"
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-muted-foreground block mb-1">Type</label>
                  <select
                    value={prodType}
                    onChange={(e) => setProdType(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                  >
                    <option value="SERVICE">Service</option>
                    <option value="INTEGRATION">Integration</option>
                    <option value="ADDON">Addon</option>
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">Tax Rule</label>
                  <select
                    value={prodTaxId}
                    onChange={(e) => setProdTaxId(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                  >
                    {taxRules.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({Number(t.ratePercent)}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
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

      {/* Modal: Add Variant */}
      {showVariantModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-foreground">Add Variant to Product (MySQL)</h3>
              <button onClick={() => setShowVariantModal(null)} className="text-zinc-400 hover:text-white">
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleAddVariant} className="space-y-3 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">Attribute Name</label>
                <input
                  type="text"
                  placeholder="e.g. Brand, Region, SLA"
                  value={varAttr}
                  onChange={(e) => setVarAttr(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Variant Value</label>
                <input
                  type="text"
                  placeholder="e.g. Odoo, US-East, 24x7 Phone"
                  value={varVal}
                  onChange={(e) => setVarVal(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Extra Price Added (₹)</label>
                <input
                  type="number"
                  placeholder="560"
                  value={varExtraPrice}
                  onChange={(e) => setVarExtraPrice(e.target.value)}
                  required
                  min="0"
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVariantModal(null)}
                  className="px-4 py-2 rounded text-xs bg-zinc-800 hover:bg-zinc-700 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Add Variant in MySQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
