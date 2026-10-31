"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Download,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Calculator,
  PlayCircle,
  XCircle,
  Check,
  RefreshCw,
} from "lucide-react";
import { api, Invoice } from "@/lib/api";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [explainingInvoice, setExplainingInvoice] = useState<Invoice | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [runningBilling, setRunningBilling] = useState(false);

  const handleOpenPdf = async (inv: Invoice) => {
    try {
      await api.invoices.openPdf(inv.id);
    } catch (err: any) {
      setActionNotice(err.message || "Could not open invoice PDF.");
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.invoices.list({
        limit: 100,
        status: filterStatus === "ALL" ? undefined : filterStatus,
      });
      setInvoices(res.data || []);
    } catch (err: any) {
      console.error("Failed to load invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [filterStatus]);

  const handleConfirm = async (id: string, num: string) => {
    try {
      await api.invoices.confirm(id);
      setActionNotice(`Invoice ${num} confirmed.`);
      await fetchInvoices();
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to confirm invoice");
    }
  };

  const handleCancel = async (id: string, num: string) => {
    if (!confirm(`Are you sure you want to cancel invoice ${num}?`)) return;
    try {
      await api.invoices.cancel(id, "Cancelled by user via dashboard");
      setActionNotice(`Invoice ${num} cancelled.`);
      await fetchInvoices();
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to cancel invoice");
    }
  };

  const handleRunBilling = async () => {
    try {
      setRunningBilling(true);
      const res = await api.invoices.runBilling({ dryRun: false });
      setActionNotice(`Billing run complete: ${res.created} invoices created, ${res.skipped} skipped.`);
      await fetchInvoices();
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to execute billing run");
    } finally {
      setRunningBilling(false);
    }
  };

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.customer?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.subscription?.number || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Invoices & Billing</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {invoices.length} invoices
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review invoice status, balances, and due dates. Download a PDF or manage a draft invoice.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchInvoices}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleRunBilling}
            disabled={runningBilling}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm disabled:opacity-50"
          >
            <PlayCircle className={`size-3.5 ${runningBilling ? "animate-spin" : ""}`} />
            {runningBilling ? "Running billing..." : "Run billing"}
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card/60">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search INV #, customer, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md text-xs bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {["ALL", "OVERDUE", "PAID", "CONFIRMED", "DRAFT", "CANCELLED"].map((st) => (
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
              <th className="py-3 px-4 font-medium">Due Date</th>
              <th className="py-3 px-4 font-medium">Total Amount</th>
              <th className="py-3 px-4 font-medium">Amount Due</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="size-4 animate-spin text-indigo-400" />
                    <span>Loading invoices...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                  No invoices found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-foreground">{inv.number}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-foreground">{inv.customer?.name || "Customer"}</div>
                    <div className="text-[11px] text-muted-foreground">{inv.customer?.email}</div>
                  </td>
                  <td className="py-3 px-4 text-zinc-400 font-mono">
                    {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-IN") : "N/A"}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-foreground">
                    ₹{Number(inv.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-300">
                    ₹{Number(inv.amountDue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        inv.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : inv.status === "OVERDUE"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : inv.status === "CANCELLED"
                          ? "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {inv.displayStatus || inv.status}
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

                      {/* PDF Download Streaming via backend */}
                      <button
                        title="Download Invoice PDF"
                        onClick={() => void handleOpenPdf(inv)}
                        className="p-1 rounded bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
                      >
                        <Download className="size-3" />
                      </button>

                      {/* Confirm (if draft) */}
                      {inv.status === "DRAFT" && (
                        <button
                          title="Confirm Invoice"
                          onClick={() => handleConfirm(inv.id, inv.number)}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          Confirm
                        </button>
                      )}

                      {/* Cancel Invoice */}
                      {inv.status !== "CANCELLED" && inv.status !== "PAID" && (
                        <button
                          title="Cancel / Void Invoice"
                          onClick={() => handleCancel(inv.id, inv.number)}
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
      </div>

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
                  <h3 className="text-sm font-semibold text-foreground">
                    Why is my bill ₹{Number(explainingInvoice.total).toLocaleString("en-IN")}?
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {explainingInvoice.number} · {explainingInvoice.customer?.name}
                  </p>
                </div>
              </div>
              <button onClick={() => setExplainingInvoice(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            {/* Stepper Math Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex justify-between text-zinc-300">
                  <span>1. Gross Subtotal:</span>
                  <span className="font-mono text-white">
                    ₹{Number(explainingInvoice.subtotal ?? explainingInvoice.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>2. Discount Applied:</span>
                  <span className="font-mono text-emerald-400">
                    {Number(explainingInvoice.discountTotal ?? explainingInvoice.discountAmount ?? 0) > 0
                      ? `-₹${Number(explainingInvoice.discountTotal ?? explainingInvoice.discountAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                      : "None"}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Tax:</span>
                  <span className="font-mono text-cyan-400">
                    ₹{Number(explainingInvoice.taxTotal ?? explainingInvoice.taxAmount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-white font-bold pt-2 border-t border-zinc-700 text-sm">
                  <span>Final Invoice Total:</span>
                  <span className="font-mono text-emerald-400">
                    ₹{Number(explainingInvoice.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400 pt-1 text-xs">
                  <span>Amount Paid / Balance Due:</span>
                  <span className="font-mono text-amber-400">
                    ₹{Number(explainingInvoice.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 })} Due
                  </span>
                </div>
              </div>

              {/* Month-over-month delta note */}
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-200">
                <span className="font-semibold block text-[11px] uppercase tracking-wider text-indigo-300">Invoice calculation</span>
                <p className="mt-1 text-xs leading-relaxed">
                  Amounts shown here are taken from the invoice record.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => void handleOpenPdf(explainingInvoice)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <Download className="size-3.5" />
                View PDF
              </button>
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
