"use client";

import { useState } from "react";
import {
  FileText,
  Search,
  Download,
  Send,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  QrCode,
  Calculator,
} from "lucide-react";

interface InvoiceItem {
  id: string;
  number: string;
  customer: string;
  subNumber: string;
  amount: string;
  status: "PAID" | "OVERDUE" | "CONFIRMED" | "DRAFT";
  issueDate: string;
  dueDate: string;
  math: {
    basePrice: string;
    variantAdd: string;
    seats: number;
    subtotal: string;
    discount: string;
    taxable: string;
    gst18: string;
    finalTotal: string;
    deltaNote: string;
  };
}

const INVOICES: InvoiceItem[] = [
  {
    id: "inv-001",
    number: "INV-2026-000042",
    customer: "Apex Global Ltd",
    subNumber: "SUB-2026-000123",
    amount: "₹65,596.20",
    status: "OVERDUE",
    issueDate: "2026-10-01",
    dueDate: "2026-10-15",
    math: {
      basePrice: "₹4,999.00 (Odoo Monthly)",
      variantAdd: "₹560.00 (Odoo Integration)",
      seats: 10,
      subtotal: "₹55,590.00",
      discount: "None applied",
      taxable: "₹55,590.00",
      gst18: "₹10,006.20 (CGST 9% + SGST 9%)",
      finalTotal: "₹65,596.20",
      deltaNote: "+₹5,600 vs last month due to 2 additional user seats added on Oct 5th.",
    },
  },
  {
    id: "inv-002",
    number: "INV-2026-000041",
    customer: "Zenith Infotech",
    subNumber: "SUB-2026-000124",
    amount: "₹14,744.10",
    status: "PAID",
    issueDate: "2026-10-01",
    dueDate: "2026-10-15",
    math: {
      basePrice: "₹2,499.00 (Pro Monthly)",
      variantAdd: "₹0.00",
      seats: 5,
      subtotal: "₹12,495.00",
      discount: "None",
      taxable: "₹12,495.00",
      gst18: "₹2,249.10 (CGST 9% + SGST 9%)",
      finalTotal: "₹14,744.10",
      deltaNote: "Identical to previous month.",
    },
  },
  {
    id: "inv-003",
    number: "INV-2026-000040",
    customer: "Brightwave Studio",
    subNumber: "SUB-2026-000127",
    amount: "₹35,364.60",
    status: "PAID",
    issueDate: "2026-09-01",
    dueDate: "2026-09-15",
    math: {
      basePrice: "₹9,990.00 (Starter Yearly)",
      variantAdd: "₹0.00",
      seats: 3,
      subtotal: "₹29,970.00",
      discount: "None",
      taxable: "₹29,970.00",
      gst18: "₹5,394.60",
      finalTotal: "₹35,364.60",
      deltaNote: "Annual upfront subscription cycle.",
    },
  },
];

export default function InvoicesPage() {
  const [invoices] = useState(INVOICES);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [explainingInvoice, setExplainingInvoice] = useState<InvoiceItem | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const filtered = invoices.filter((inv) => {
    const matchesStatus = filterStatus === "ALL" || inv.status === filterStatus;
    const matchesSearch =
      inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.subNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCopyLink = (invNum: string) => {
    const link = `https://rzp.io/i/bp_${invNum.toLowerCase()}`;
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(link);
    }
    setCopiedLink(invNum);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Invoices & Billing</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Auto-generated invoices with tax breakdown, idempotency guarantees, PDF delivery, and payment links.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card/60">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search INV #, customer, SUB #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md text-xs bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {["ALL", "OVERDUE", "PAID", "CONFIRMED", "DRAFT"].map((st) => (
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

      {/* Invoices Table */}
      <div className="rounded-xl border border-border bg-card/60 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground bg-muted/30">
              <th className="py-3 px-4 font-medium">Invoice #</th>
              <th className="py-3 px-4 font-medium">Customer</th>
              <th className="py-3 px-4 font-medium">Subscription</th>
              <th className="py-3 px-4 font-medium">Issue Date</th>
              <th className="py-3 px-4 font-medium">Due Date</th>
              <th className="py-3 px-4 font-medium">Total Amount</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.map((inv) => (
              <tr key={inv.id} className="hover:bg-muted/40 transition-colors">
                <td className="py-3 px-4 font-mono font-medium text-foreground">{inv.number}</td>
                <td className="py-3 px-4 text-foreground font-medium">{inv.customer}</td>
                <td className="py-3 px-4 font-mono text-zinc-400">{inv.subNumber}</td>
                <td className="py-3 px-4 text-zinc-400 font-mono">{inv.issueDate}</td>
                <td className="py-3 px-4 text-zinc-400 font-mono">{inv.dueDate}</td>
                <td className="py-3 px-4 font-mono font-bold text-foreground">{inv.amount}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      inv.status === "PAID"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : inv.status === "OVERDUE"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* "Why is my bill ₹X?" explainer button */}
                    <button
                      title="Why is my bill ₹X? Explainer"
                      onClick={() => setExplainingInvoice(inv)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
                    >
                      <HelpCircle className="size-3 text-indigo-400" />
                      <span>Explainer</span>
                    </button>

                    {/* Razorpay link copy */}
                    <button
                      title="Copy Razorpay Payment Link"
                      onClick={() => handleCopyLink(inv.number)}
                      className="p-1 rounded bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
                    >
                      <Copy className="size-3" />
                    </button>

                    {/* PDF Download Simulation */}
                    <button
                      title="Download Invoice PDF"
                      onClick={() => alert(`Downloading PDF for ${inv.number}...`)}
                      className="p-1 rounded bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
                    >
                      <Download className="size-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {copiedLink && (
        <div className="fixed bottom-6 right-6 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-medium shadow-lg animate-in fade-in flex items-center gap-2">
          <CheckCircle2 className="size-4" />
          <span>Razorpay link for {copiedLink} copied to clipboard!</span>
        </div>
      )}

      {/* "Why is my bill ₹X?" Interactive Explainer Modal [T2 4.9] */}
      {explainingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl border border-indigo-500/40 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Calculator className="size-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Why is my bill {explainingInvoice.amount}?</h3>
                  <p className="text-[11px] text-muted-foreground font-mono">{explainingInvoice.number} · {explainingInvoice.customer}</p>
                </div>
              </div>
              <button onClick={() => setExplainingInvoice(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            {/* Stepper Math Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex justify-between text-zinc-300">
                  <span>1. Base Plan Rate:</span>
                  <span className="font-mono text-white">{explainingInvoice.math.basePrice}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>2. Product Variant Add-on:</span>
                  <span className="font-mono text-indigo-400">{explainingInvoice.math.variantAdd}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>3. Quantity / User Seats:</span>
                  <span className="font-mono text-white">{explainingInvoice.math.seats} seats</span>
                </div>
                <div className="flex justify-between text-zinc-300 pt-2 border-t border-zinc-800">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium text-white">{explainingInvoice.math.subtotal}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>4. Discount Applied:</span>
                  <span className="font-mono text-emerald-400">{explainingInvoice.math.discount}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>5. GST Tax (CGST 9% + SGST 9%):</span>
                  <span className="font-mono text-cyan-400">{explainingInvoice.math.gst18}</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-2 border-t border-zinc-700 text-sm">
                  <span>Final Total:</span>
                  <span className="font-mono text-emerald-400">{explainingInvoice.math.finalTotal}</span>
                </div>
              </div>

              {/* Month-over-month delta note */}
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-200">
                <span className="font-semibold block text-[11px] uppercase tracking-wider text-indigo-300">What Changed Since Last Month:</span>
                <p className="mt-1 text-xs leading-relaxed">{explainingInvoice.math.deltaNote}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setExplainingInvoice(null)}
                className="px-4 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

