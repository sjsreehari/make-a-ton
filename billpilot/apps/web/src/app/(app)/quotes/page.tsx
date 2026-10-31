"use client";

import { useState } from "react";
import {
  FileCheck2,
  Bot,
  Plus,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
} from "lucide-react";

interface Quotation {
  id: string;
  number: string;
  customer: string;
  plan: string;
  seats: number;
  variant: string;
  total: string;
  validUntil: string;
  status: "DRAFT" | "SENT" | "CONFIRMED" | "EXPIRED";
}

const INITIAL_QUOTES: Quotation[] = [
  { id: "q-1", number: "QT-2026-000088", customer: "Acme Logistics", plan: "Enterprise Monthly", seats: 20, variant: "Multi-Region Cloud", total: "₹1,99,980/mo", validUntil: "2026-11-15", status: "CONFIRMED" },
  { id: "q-2", number: "QT-2026-000089", customer: "HyperScale Tech", plan: "Odoo Subscription Monthly", seats: 5, variant: "Brand: Odoo (+₹560)", total: "₹27,795/mo", validUntil: "2026-11-18", status: "SENT" },
  { id: "q-3", number: "QT-2026-000090", customer: "NEXA Retail", plan: "Pro Yearly", seats: 15, variant: "Standard", total: "₹3,74,850/yr", validUntil: "2026-11-20", status: "DRAFT" },
];

export default function QuotesPage() {
  const [quotes, setQuotes] = useState(INITIAL_QUOTES);
  const [nlPrompt, setNlPrompt] = useState("");
  const [nlGenerating, setNlGenerating] = useState(false);
  const [createdNotice, setCreatedNotice] = useState<string | null>(null);

  const handleNlGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlPrompt.trim()) return;

    setNlGenerating(true);
    setTimeout(() => {
      setNlGenerating(false);
      const newQuote: Quotation = {
        id: `q-${Date.now()}`,
        number: `QT-2026-0000${Math.floor(90 + Math.random() * 10)}`,
        customer: nlPrompt.includes("Acme") ? "Acme Logistics" : "New Enterprise Prospect",
        plan: nlPrompt.toLowerCase().includes("yearly") ? "Pro Yearly" : "Pro Monthly",
        seats: 20,
        variant: "Brand: Odoo (+₹560)",
        total: "₹61,180/mo",
        validUntil: "2026-11-20",
        status: "DRAFT",
      };
      setQuotes([newQuote, ...quotes]);
      setCreatedNotice(`Draft quotation created by AI for ${newQuote.customer} (${newQuote.total})!`);
      setNlPrompt("");
      setTimeout(() => setCreatedNotice(null), 4000);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Quotations & Templates</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create quote drafts from templates or in one plain-English sentence via AI.
          </p>
        </div>
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
          <span>Natural-Language → Quotation Drafter (Powered by Claude)</span>
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
            {nlGenerating ? "Drafting..." : "Generate Draft"}
          </button>
        </form>
        <span className="text-[10px] text-muted-foreground block">
          * AI drafts quote for staff review; never auto-confirms or charges customer.
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
              <th className="py-3 px-4 font-medium">Seats</th>
              <th className="py-3 px-4 font-medium">Variant</th>
              <th className="py-3 px-4 font-medium">Quoted Total</th>
              <th className="py-3 px-4 font-medium">Valid Until</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {quotes.map((q) => (
              <tr key={q.id} className="hover:bg-muted/40 transition-colors">
                <td className="py-3 px-4 font-mono font-medium text-foreground">{q.number}</td>
                <td className="py-3 px-4 font-medium text-foreground">{q.customer}</td>
                <td className="py-3 px-4 text-zinc-300">{q.plan}</td>
                <td className="py-3 px-4 font-mono text-zinc-300">{q.seats}</td>
                <td className="py-3 px-4 text-[11px] font-mono text-indigo-400">{q.variant}</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-400">{q.total}</td>
                <td className="py-3 px-4 font-mono text-zinc-400">{q.validUntil}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      q.status === "CONFIRMED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : q.status === "SENT"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {q.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {q.status === "DRAFT" ? (
                    <button
                      onClick={() => {
                        setQuotes((prev) => prev.map((item) => (item.id === q.id ? { ...item, status: "SENT" } : item)));
                      }}
                      className="px-2.5 py-1 rounded text-[10px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      Send to Customer
                    </button>
                  ) : q.status === "SENT" ? (
                    <button
                      onClick={() => {
                        setQuotes((prev) => prev.map((item) => (item.id === q.id ? { ...item, status: "CONFIRMED" } : item)));
                      }}
                      className="px-2.5 py-1 rounded text-[10px] font-medium bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      Confirm Quote → Active Sub
                    </button>
                  ) : (
                    <span className="text-[11px] text-zinc-500">Converted</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
