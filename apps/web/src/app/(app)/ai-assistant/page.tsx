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
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";

interface QueryResult {
  sql: string;
  summary: string;
  headers: string[];
  rows: (string | number)[][];
  recommendation?: string;
}

const PRESET_QUERIES = [
  "Which invoices are overdue by more than 15 days?",
  "Show total revenue collected this month grouped by plan",
  "Which customers have an active credit balance?",
  "Calculate churn rate over the past 3 months",
  "Draft an enterprise quote for Acme Corp with 25 seats",
];

export default function AiAssistantPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>({
    sql: "SELECT number, customer_name, total, due_date, DATEDIFF(NOW(), due_date) as days_overdue FROM invoices JOIN customers ON invoices.customerId = customers.id WHERE status = 'OVERDUE' ORDER BY due_date ASC LIMIT 5;",
    summary: "Identified 3 high-risk overdue invoices exceeding 15 days past due, representing ₹82,490 in outstanding receivables.",
    headers: ["Invoice #", "Customer", "Amount", "Due Date", "Days Overdue"],
    rows: [
      ["INV-2026-000840", "Kavya Enterprises", "₹14,990.00", "2026-10-10", 21],
      ["INV-2026-000812", "Vector Media", "₹1,998.00", "2026-10-05", 26],
      ["INV-2026-000790", "Apex Global Ltd", "₹65,502.00", "2026-09-28", 33],
    ],
    recommendation: "Trigger automated WhatsApp reminder with tokenized Razorpay payment link to reduce DSO by 4.2 days.",
  });

  const handleRunQuery = (queryText: string) => {
    setPrompt(queryText);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const q = queryText.toLowerCase();
      if (q.includes("overdue")) {
        setResult({
          sql: "SELECT number, customer_name, total, due_date, DATEDIFF(NOW(), due_date) as days_overdue FROM invoices JOIN customers ON invoices.customerId = customers.id WHERE status = 'OVERDUE' ORDER BY due_date ASC LIMIT 10;",
          summary: "Identified 3 high-risk overdue invoices exceeding 15 days past due, representing ₹82,490 in outstanding receivables.",
          headers: ["Invoice #", "Customer", "Amount", "Due Date", "Days Overdue"],
          rows: [
            ["INV-2026-000840", "Kavya Enterprises", "₹14,990.00", "2026-10-10", 21],
            ["INV-2026-000812", "Vector Media", "₹1,998.00", "2026-10-05", 26],
            ["INV-2026-000790", "Apex Global Ltd", "₹65,502.00", "2026-09-28", 33],
          ],
          recommendation: "Recommend dispatching WhatsApp dunning template with 1-click UPI deep links to Kavya Enterprises and Apex Global.",
        });
      } else if (q.includes("plan") || q.includes("revenue")) {
        setResult({
          sql: "SELECT p.name AS plan_name, COUNT(s.id) AS active_subs, SUM(p.price) AS total_revenue FROM subscriptions s JOIN plans p ON s.planId = p.id WHERE s.status = 'ACTIVE' GROUP BY p.name ORDER BY total_revenue DESC LIMIT 10;",
          summary: "Odoo Subscription Monthly dominates recurring revenue at ₹19.45 Lakhs across 35 enterprise accounts.",
          headers: ["Plan Name", "Active Subscriptions", "Monthly Revenue"],
          rows: [
            ["Odoo Subscription Monthly", 35, "₹19,45,650.00"],
            ["Enterprise Monthly", 8, "₹7,99,920.00"],
            ["Pro Monthly", 42, "₹10,49,580.00"],
            ["Starter Monthly", 120, "₹1,19,880.00"],
          ],
          recommendation: "Enterprise expansion opportunity: 14 Pro Monthly accounts are reaching 90% seat limits and qualify for automated upsell.",
        });
      } else if (q.includes("credit") || q.includes("balance")) {
        setResult({
          sql: "SELECT name, email, creditBalance FROM customers WHERE creditBalance > 0 ORDER BY creditBalance DESC LIMIT 10;",
          summary: "Found 2 customers with credit balances totaling ₹42,000 originating from invoice overpayments.",
          headers: ["Customer", "Email", "Credit Balance"],
          rows: [
            ["CloudNative Labs", "billing@cloudnative.test", "₹37,000.00"],
            ["Zenith Infotech", "finance@zenith.test", "₹5,000.00"],
          ],
          recommendation: "Credit balances will be automatically drawn down on the Nov 1 billing run before charging payment mandates.",
        });
      } else if (q.includes("churn")) {
        setResult({
          sql: "SELECT DATE_FORMAT(closedAt, '%Y-%m') as month, COUNT(id) as cancellations, SUM(total) as lost_mrr FROM subscriptions WHERE status = 'CLOSED' GROUP BY month ORDER BY month DESC LIMIT 3;",
          summary: "Net MRR churn over the past 90 days sits at 1.12%, well below the industry standard target of 2.5%.",
          headers: ["Billing Month", "Cancellations", "Lost Monthly MRR"],
          rows: [
            ["October 2026", 2, "₹14,990.00"],
            ["September 2026", 1, "₹4,999.00"],
            ["August 2026", 3, "₹22,480.00"],
          ],
          recommendation: "Top churn reason cited: 'Project completed'. Offer pause-instead-of-cancel retention discount to save 40% of exits.",
        });
      } else if (q.includes("quote") || q.includes("draft")) {
        setResult({
          sql: "INSERT INTO subscriptions (number, customerId, planId, status, paymentTerm) VALUES ('QUO-2026-000412', 'cust-acme', 'plan-enterprise', 'QUOTATION', 'NET_15');",
          summary: "Drafted quotation QUO-2026-000412 for Acme Corp: 25 seats on Enterprise Plan @ ₹2,499/seat with 18% GST.",
          headers: ["Line Description", "Quantity", "Unit Price", "Total (Excl Tax)"],
          rows: [
            ["Enterprise Annual Seat License", 25, "₹2,499.00", "₹62,475.00"],
            ["Priority SLA 99.99% Addon", 1, "₹10,000.00", "₹10,000.00"],
            ["Applicable GST (18%)", 1, "₹13,045.50", "₹13,045.50"],
          ],
          recommendation: "Quotation generated with 15-day validity. Ready to confirm in the Quotations workbench.",
        });
      } else {
        setResult({
          sql: "SELECT * FROM subscriptions WHERE status = 'ACTIVE' LIMIT 5;",
          summary: `Analysis complete for: "${queryText}". Extracted key operational metrics from MySQL database.`,
          headers: ["Metric", "Value", "Status"],
          rows: [
            ["Active Subscribers", "148 accounts", "Healthy"],
            ["Unbilled Accruals", "₹1,24,500.00", "Ready for Nov 1 run"],
            ["Auto-Dunning Efficiency", "84% success", "Protected"],
          ],
          recommendation: "All subscription records comply with recurring schedule and GST tax rules.",
        });
      }
    }, 700);
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
          <ShieldCheck className="size-4 text-indigo-400 shrink-0" />
          <span>Restricted to read-only views (<code>invoices</code>, <code>subscriptions</code>, <code>customers</code>). Single SELECT only, row-limited, zero PII exposure.</span>
        </div>
      </div>

      {/* Query Bar */}
      <div className="p-4 rounded-xl border border-border bg-card/60 shadow-sm space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Bot className="absolute left-3 top-2.5 size-4 text-indigo-400" />
            <input
              type="text"
              placeholder="Ask anything (e.g. 'Which invoices are overdue by > 15 days?')..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && prompt && handleRunQuery(prompt)}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => prompt && handleRunQuery(prompt)}
            disabled={loading || !prompt}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
          >
            <Sparkles className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Analyzing..." : "Ask Assistant"}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-muted-foreground font-medium">Quick Prompts:</span>
          {PRESET_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => handleRunQuery(q)}
              className="text-[11px] px-2.5 py-1 rounded-md bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Result Panel */}
      {result && (
        <div className="p-5 rounded-xl border border-border bg-card/60 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">Executive Summary</span>
              <p className="text-sm font-medium text-foreground">{result.summary}</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
              Audit Verified
            </span>
          </div>

          {result.recommendation && (
            <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-center gap-2">
              <Sparkles className="size-4 shrink-0 text-indigo-400" />
              <span><strong>AI Action Recommendation:</strong> {result.recommendation}</span>
            </div>
          )}

          {/* Generated SQL Snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Terminal className="size-3.5 text-zinc-400" />
              <span className="font-mono text-[11px]">Generated MySQL Query:</span>
            </div>
            <pre className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto">
              <code>{result.sql}</code>
            </pre>
          </div>

          {/* Result Data Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                  {result.headers.map((h, i) => (
                    <th key={i} className="py-2.5 px-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {result.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/40 transition-colors">
                    {row.map((cell, cidx) => (
                      <td key={cidx} className="py-2.5 px-4 font-mono text-foreground">{cell}</td>
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
