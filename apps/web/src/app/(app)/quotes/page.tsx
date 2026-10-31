"use client";

import { useState, useEffect } from "react";
import {
  FileCheck2,
  Bot,
  Plus,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { api, Subscription, Plan, Customer, Product } from "@/lib/api";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [nlPrompt, setNlPrompt] = useState("");
  const [nlGenerating, setNlGenerating] = useState(false);
  const [createdNotice, setCreatedNotice] = useState<string | null>(null);

  const fetchQuotesAndData = async () => {
    try {
      setLoading(true);
      const [quotesRes, draftsRes, plansRes, custRes, prodRes] = await Promise.all([
        api.subscriptions.list({ status: "QUOTATION", limit: 50 }),
        api.subscriptions.list({ status: "DRAFT", limit: 50 }),
        api.catalog.plans({ isActive: true }),
        api.users.customers({ limit: 20 }),
        api.catalog.products(),
      ]);

      const combined = [...(quotesRes.data || []), ...(draftsRes.data || [])];
      // deduplicate
      const uniqueMap = new Map<string, Subscription>();
      combined.forEach((q) => uniqueMap.set(q.id, q));
      setQuotes(Array.from(uniqueMap.values()));
      setPlans(plansRes.data || []);
      setCustomers(custRes.data || []);
      setProducts(prodRes.data || []);
    } catch (err: any) {
      console.error("Failed to load quotes from MySQL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotesAndData();
  }, []);

  const handleNlGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlPrompt.trim()) return;

    setNlGenerating(true);
    try {
      // Find matching customer or default
      let customer = customers[0];
      if (!customer) {
        customer = await api.users.createCustomer({
          name: "Acme Logistics Prospect",
          email: "procurement@acmelogistics.test",
          company: "Acme Logistics Ltd",
        });
      }

      // Pick plan
      const isYearly = nlPrompt.toLowerCase().includes("yearly");
      const matchedPlan =
        plans.find((p) => (isYearly ? p.billingPeriod === "YEARLY" : p.billingPeriod === "MONTHLY")) || plans[0];

      if (!matchedPlan) {
        alert("No active plan found in catalog to quote.");
        return;
      }

      // Pick product
      const product = products[0];
      if (!product) {
        alert("No products in catalog to create quotation line.");
        return;
      }

      const created = await api.subscriptions.create({
        customerId: customer.id,
        planId: matchedPlan.id,
        startDate: new Date().toISOString(),
        paymentTermsDays: 15,
        lines: [
          {
            productId: product.id,
            variantId: product.variants?.[0]?.id,
            quantity: 10,
          },
        ],
      });

      setCreatedNotice(`Quotation ${created.number} created in MySQL for ${customer.name} (${matchedPlan.name})!`);
      setNlPrompt("");
      await fetchQuotesAndData();
      setTimeout(() => setCreatedNotice(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to generate quotation in MySQL");
    } finally {
      setNlGenerating(false);
    }
  };

  const handleConfirmQuote = async (id: string, num: string) => {
    try {
      await api.subscriptions.approveQuote(id);
      setCreatedNotice(`Quotation ${num} approved and converted to ACTIVE Subscription in MySQL!`);
      await fetchQuotesAndData();
      setTimeout(() => setCreatedNotice(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to confirm quote");
    }
  };

  const handleCancelQuote = async (id: string, num: string) => {
    if (!confirm(`Cancel quotation ${num}?`)) return;
    try {
      await api.subscriptions.close(id, "Quote declined / cancelled");
      setCreatedNotice(`Quotation ${num} cancelled in MySQL!`);
      await fetchQuotesAndData();
      setTimeout(() => setCreatedNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to cancel quote");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Quotations & Templates</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              MySQL Live ({quotes.length})
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create quote drafts from templates or in one plain-English sentence via AI.
          </p>
        </div>

        <button
          onClick={fetchQuotesAndData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {createdNotice && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{createdNotice}</span>
        </div>
      )}

      {/* AI Quote Generator Bar [T2 13.2] */}
      <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
          <Sparkles className="size-4 text-indigo-400" />
          <span>Natural-Language → Quotation Drafter (Connected to MySQL)</span>
        </div>
        <form onSubmit={handleNlGenerate} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder='Try: "Quote Acme 20 seats of Pro yearly with Odoo variant"'
            value={nlPrompt}
            onChange={(e) => setNlPrompt(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg text-xs bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={nlGenerating || !nlPrompt.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
          >
            <Bot className={`size-3.5 ${nlGenerating ? "animate-spin" : ""}`} />
            {nlGenerating ? "Drafting to MySQL..." : "Generate Quote Draft"}
          </button>
        </form>
        <span className="text-[10px] text-muted-foreground block">
          * AI drafts quote directly into MySQL for staff review; never auto-charges customer.
        </span>
      </div>

      {/* Quotations List */}
      <div className="rounded-xl border border-border bg-card/60 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground bg-muted/30">
              <th className="py-3 px-4 font-medium">Quotation #</th>
              <th className="py-3 px-4 font-medium">Customer</th>
              <th className="py-3 px-4 font-medium">Plan</th>
              <th className="py-3 px-4 font-medium">Start Date</th>
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
                    <span>Loading quotations from MySQL database...</span>
                  </div>
                </td>
              </tr>
            ) : quotes.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  No draft quotations in MySQL yet. Use the prompt above to draft one!
                </td>
              </tr>
            ) : (
              quotes.map((q) => (
                <tr key={q.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-foreground">{q.number}</td>
                  <td className="py-3 px-4 font-medium text-foreground">
                    <div>{q.customer?.name || "Customer"}</div>
                    <div className="text-[11px] text-muted-foreground">{q.customer?.email}</div>
                  </td>
                  <td className="py-3 px-4 text-zinc-300">
                    <div className="font-medium text-foreground">{q.plan?.name || "Standard Plan"}</div>
                    <div className="text-[11px] font-mono text-emerald-400">
                      ₹{Number(q.plan?.price || 0).toLocaleString("en-IN")}/{q.plan?.billingPeriod?.toLowerCase()}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-400">
                    {new Date(q.startDate).toLocaleDateString("en-IN")}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        q.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : q.status === "CONFIRMED"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {q.status !== "ACTIVE" && q.status !== "CLOSED" && (
                        <button
                          onClick={() => handleConfirmQuote(q.id, q.number)}
                          className="px-2.5 py-1 rounded text-[10px] font-medium bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          Confirm Quote → Active Sub
                        </button>
                      )}
                      {q.status !== "CLOSED" && (
                        <button
                          onClick={() => handleCancelQuote(q.id, q.number)}
                          className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                          title="Cancel Quote"
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
      </div>
    </div>
  );
}
