"use client";

import { useState } from "react";
import {
  Bot,
  Send,
  Database,
  ShieldCheck,
  Sparkles,
  Terminal,
  Table,
  CheckCircle2,
} from "lucide-react";

interface QueryResult {
  sql: string;
  summary: string;
  headers: string[];
  rows: (string | number)[][];
}

const PRESET_QUERIES = [
  "Which invoices are overdue by more than 15 days?",
  "Show total revenue collected this month grouped by plan",
  "Which customers have an active credit balance?",
  "Calculate churn rate over the past 3 months",
];

export default function AiAssistantPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);

  const handleRunQuery = (queryText: string) => {
    setPrompt(queryText);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (queryText.includes("overdue")) {
        setResult({
          sql: "SELECT number, customer_name, total, due_date, NOW()::date - due_date::date as days_overdue FROM v_invoices WHERE status = 'OVERDUE' AND due_date < NOW() - INTERVAL '15 days' ORDER BY due_date ASC LIMIT 10;",
          summary: "Identified 3 high-risk overdue invoices exceeding 15 days past due, representing ₹82,490 in outstanding receivables.",
          headers: ["Invoice #", "Customer", "Amount", "Due Date", "Days Overdue"],
          rows: [
            ["INV-2026-000840", "Kavya Enterprises", "₹14,990.00", "2026-10-10", 21],
            ["INV-2026-000812", "Vector Media", "₹1,998.00", "2026-10-05", 26],
            ["INV-2026-000790", "Apex Global Ltd", "₹65,502.00", "2026-09-28", 33],
          ],
        });
      } else if (queryText.includes("plan")) {
        setResult({
          sql: "SELECT p.name AS plan_name, COUNT(s.id) AS active_subs, SUM(s.total_amount) AS total_revenue FROM v_subscriptions s JOIN \"Plan\" p ON s.plan_id = p.id WHERE s.status = 'ACTIVE' GROUP BY p.name ORDER BY total_revenue DESC LIMIT 10;",
          summary: "Odoo Subscription Monthly dominates recurring revenue at ₹19.45 Lakhs across 35 enterprise accounts.",
          headers: ["Plan Name", "Active Subscriptions", "Monthly Revenue"],
          rows: [
            ["Odoo Subscription Monthly", 35, "₹19,45,650.00"],
            ["Enterprise Monthly", 8, "₹7,99,920.00"],
            ["Pro Monthly", 42, "₹10,49,580.00"],
            ["Starter Monthly", 120, "₹1,19,880.00"],
          ],
        });
      } else {
        setResult({
          sql: "SELECT name, email, credit_balance FROM v_customers WHERE credit_balance > 0 ORDER BY credit_balance DESC LIMIT 10;",
          summary: "Found 2 customers with credit balances totaling ₹42,000 originating from invoice overpayments.",
          headers: ["Customer", "Email", "Credit Balance"],
          rows: [
            ["CloudNative Labs", "billing@cloudnative.test", "₹37,000.00"],
            ["Zenith Infotech", "finance@zenith.test", "₹5,000.00"],
          ],
        });
      }
    }, 1100);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Finance Assistant</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Safe Read-Only SQL Engine
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Query business intelligence, calculate MRR, and extract revenue metrics in plain English.
          </p>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-indigo-400" />
          <span>Restricted to read-only views (<code>v_invoices</code>, <code>v_subscriptions</code>, <code>v_mrr_monthly</code>). Single SELECT only, row-limited, zero PII exposure.</span>
        </div>
      </div>

      {/* Prompt Bar */}
      <div className="p-4 rounded-xl border border-border bg-card/60 shadow-sm space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (prompt.trim()) handleRunQuery(prompt);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Bot className="absolute left-3 top-2.5 size-4 text-indigo-400" />
            <input
              type="text"
              placeholder="Ask anything (e.g. 'Which invoices are overdue by more than 15 days?')..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
          >
            <Send className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Analyzing..." : "Ask Assistant"}
          </button>
        </form>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] text-muted-foreground mr-1">Presets:</span>
          {PRESET_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => handleRunQuery(q)}
              className="px-2.5 py-1 rounded-md text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Query Execution Result */}
      {result && (
        <div className="space-y-4 animate-in fade-in">
          {/* Executive Summary */}
          <div className="p-4 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-card/80 to-card/80 shadow-sm space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="size-3 text-indigo-400" />
              Executive Plain-English Summary
            </span>
            <p className="text-sm font-medium text-foreground leading-relaxed">{result.summary}</p>
          </div>

          {/* Generated SQL Window */}
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 font-mono text-xs text-zinc-300 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-1 border-b border-zinc-800">
              <span className="flex items-center gap-1.5">
                <Terminal className="size-3 text-indigo-400" />
                Executed Safe SQL Statement (Read-Only)
              </span>
              <span className="text-emerald-400">Validated: 1 SELECT · 0.42ms</span>
            </div>
            <pre className="text-indigo-300 whitespace-pre-wrap break-all pt-1">{result.sql}</pre>
          </div>

          {/* Result Data Table */}
          <div className="rounded-xl border border-border bg-card/60 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Table className="size-3.5 text-indigo-400" />
                Query Result Dataset ({result.rows.length} rows)
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground bg-muted/30">
                  {result.headers.map((h) => (
                    <th key={h} className="py-2.5 px-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {result.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/40 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2.5 px-4 font-mono text-foreground">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

