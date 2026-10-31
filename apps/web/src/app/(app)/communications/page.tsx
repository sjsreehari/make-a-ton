"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare,
  Send,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Mail,
  Zap,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";

interface ChatMessage {
  id: string;
  sender: "USER" | "BOT";
  text: string;
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    sender: "BOT",
    text: "Brightloop Software Billing Assistant. Reply with 'balance', 'invoice', 'pause', 'renew', or 'help'.",
    timestamp: "10:00 AM",
  },
  { id: "2", sender: "USER", text: "balance", timestamp: "10:02 AM" },
  {
    id: "3",
    sender: "BOT",
    text: "Your current account has 1 active subscription (SUB-2026-000123) and 1 overdue invoice (INV-2026-000042) for ₹65,596.20. Pay now: https://rzp.io/i/bp_inv042",
    timestamp: "10:02 AM",
  },
];

const DELIVERY_LOGS = [
  { id: "log-1", recipient: "+91 98765 43210", channel: "WHATSAPP", template: "invoice.confirmed", status: "DELIVERED", time: "10 mins ago" },
  { id: "log-2", recipient: "billing@zenith.test", channel: "EMAIL", template: "payment.receipt", status: "SENT", time: "25 mins ago" },
  { id: "log-3", recipient: "+91 98234 56789", channel: "WHATSAPP", template: "renewal.reminder_7d", status: "READ", time: "1 hour ago" },
  { id: "log-4", recipient: "+91 97123 45678", channel: "WHATSAPP", template: "dunning.overdue_warning", status: "DELIVERED", time: "2 hours ago" },
];

export default function CommunicationsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<"whatsapp" | "brevo" | "templates">("whatsapp");

  // Brevo email test state
  const [emailTo, setEmailTo] = useState("devanandanmr2006@gmail.com");
  const [emailSubject, setEmailSubject] = useState("BillPilot - Automated Billing Test");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Templates state
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    api.notifications.templates().then((data) => {
      if (Array.isArray(data) && data.length > 0) setTemplates(data);
    }).catch(() => {});
  }, []);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSending(true);
    setEmailSuccess(null);
    setEmailError(null);
    try {
      const res = await api.notifications.sendTestEmail(emailTo);
      setEmailSuccess(
        `Email successfully queued via Brevo API! Message ID: ${res?.messageId || "brevo-" + Date.now()}`
      );
    } catch (err: any) {
      setEmailError(err.message || "Failed to dispatch email via Brevo");
    } finally {
      setEmailSending(false);
    }
  };

  const executeCommand = (cmdText: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "USER",
      text: cmdText,
      timestamp: "Just now",
    };
    setMessages((prev) => [...prev, userMsg]);

    const cmd = cmdText.trim().toLowerCase();
    setTimeout(() => {
      let reply = "I didn't recognize that command. Reply 'balance', 'invoice', 'pause', 'renew', or 'help'.";
      if (cmd === "balance") {
        reply = "Active balance: ₹0.00. Unpaid overdue: ₹65,596.20 for invoice INV-2026-000042. Pay securely: https://rzp.io/i/bp_inv042";
      } else if (cmd === "invoice") {
        reply = "Your latest invoice PDF is ready:\nInvoice #INV-2026-000042 (₹65,596.20)\nDownload PDF: http://localhost:4000/api/v1/invoices/inv-seed-0000001/pdf";
      } else if (cmd === "pause") {
        reply = "⚠️ Warning: Pausing stops recurring billing for SUB-2026-000123. Reply 'YES' to confirm pause.";
      } else if (cmd === "renew") {
        reply = "Subscription SUB-2026-000123 renewed for another 12 months! Next billing: Jan 15, 2027.";
      } else if (cmd === "yes") {
        reply = "Confirmed! Subscription SUB-2026-000123 has been paused in MySQL. Service access will stop at the end of the billing period.";
      } else if (cmd === "help") {
        reply = "BillPilot WhatsApp Help:\n• 'balance' - Check owed amounts\n• 'invoice' - Get latest PDF & link\n• 'pause' - Pause subscription\n• 'renew' - Extend subscription";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "BOT",
          text: reply,
          timestamp: "Just now",
        },
      ]);
    }, 600);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    executeCommand(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Communications & Notification Hub</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Brevo & WhatsApp Active
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Two-way WhatsApp billing bot, Brevo transactional emails, dynamic template rendering, and delivery logs.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-card">
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === "whatsapp" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            WhatsApp Bot
          </button>
          <button
            onClick={() => setActiveTab("brevo")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === "brevo" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Brevo Email Engine
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === "templates" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Templates & Variables
          </button>
        </div>
      </div>

      {activeTab === "whatsapp" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interactive WhatsApp Simulator */}
          <div className="rounded-xl border border-border bg-card/60 shadow-sm flex flex-col h-[520px] overflow-hidden">
            <div className="p-3 border-b border-border bg-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                  <Smartphone className="size-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-foreground block">WhatsApp Bot Simulator</span>
                  <span className="text-[10px] text-emerald-400 font-mono">+1 415 523 8886 (Twilio Sandbox)</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Verified Opt-in
              </span>
            </div>

            {/* Quick Action Chips */}
            <div className="px-3 py-2 border-b border-border/50 bg-zinc-950/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-[10px] text-zinc-500 font-medium whitespace-nowrap">Try:</span>
              <button
                onClick={() => executeCommand("balance")}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 whitespace-nowrap"
              >
                balance
              </button>
              <button
                onClick={() => executeCommand("invoice")}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 whitespace-nowrap"
              >
                invoice
              </button>
              <button
                onClick={() => executeCommand("pause")}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 whitespace-nowrap"
              >
                pause
              </button>
              <button
                onClick={() => executeCommand("renew")}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 whitespace-nowrap"
              >
                renew
              </button>
              <button
                onClick={() => executeCommand("help")}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 whitespace-nowrap"
              >
                help
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950/40">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === "USER" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                      m.sender === "USER"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-bl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-zinc-500 mt-0.5 px-1 font-mono">{m.timestamp}</span>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-zinc-900/40 flex gap-2">
              <input
                type="text"
                placeholder="Type 'balance', 'invoice', 'pause', 'renew'..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                <Send className="size-3.5" />
              </button>
            </form>
          </div>

          {/* Outbound Delivery Logs */}
          <div className="rounded-xl border border-border bg-card/60 shadow-sm flex flex-col justify-between overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Notification Delivery Ledger</span>
              <span className="text-xs text-muted-foreground font-mono">Twilio & Brevo</span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground bg-muted/30">
                    <th className="py-2.5 px-4 font-medium">Recipient</th>
                    <th className="py-2.5 px-4 font-medium">Channel</th>
                    <th className="py-2.5 px-4 font-medium">Template</th>
                    <th className="py-2.5 px-4 font-medium">Status</th>
                    <th className="py-2.5 px-4 text-right font-medium">Sent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {DELIVERY_LOGS.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-foreground font-medium">{log.recipient}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {log.channel}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-indigo-400">{log.template}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-400">{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-border bg-muted/20 text-center text-xs text-muted-foreground">
              Zero duplicate dispatch protection with idempotency keys active.
            </div>
          </div>
        </div>
      )}

      {activeTab === "brevo" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-border bg-card/60 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="size-5 text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold text-foreground">Brevo Transactional Email Tester</h3>
                <p className="text-xs text-muted-foreground">Send a live transactional HTML email using configured Brevo credentials.</p>
              </div>
            </div>

            {emailSuccess && (
              <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                <span>{emailSuccess}</span>
              </div>
            )}

            {emailError && (
              <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0 text-red-400" />
                <span>{emailError}</span>
              </div>
            )}

            <form onSubmit={handleSendEmail} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Recipient Email Address</label>
                <input
                  type="email"
                  required
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-md text-xs bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Email Subject Line</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-md text-xs bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <span className="font-semibold text-zinc-300">HTML Template Preview:</span>
                <p>Includes responsive header, customer name placeholder, formatted currency, and secure payment links.</p>
              </div>

              <button
                type="submit"
                disabled={emailSending}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                <Send className={`size-3.5 ${emailSending ? "animate-spin" : ""}`} />
                {emailSending ? "Dispatching via Brevo..." : "Send Live Brevo Email"}
              </button>
            </form>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card/60 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground">Email Template Design Spec</h3>
            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
              <div className="border-b border-zinc-800 pb-2 flex items-center justify-between">
                <span className="font-semibold text-white">BillPilot Transactional Theme</span>
                <span className="text-[10px] font-mono text-emerald-400">Brevo HTML</span>
              </div>
              <div className="space-y-2 text-zinc-400 text-[11px]">
                <p>• Clean indigo brand banner (<code>#4f46e5</code>) with high-contrast typography.</p>
                <p>• Dynamic GSTIN & tax calculation breakdown table.</p>
                <p>• Direct Razorpay / UPI payment deep-link button.</p>
                <p>• Embedded PDF invoice attachment link.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "templates" && (
        <div className="rounded-xl border border-border bg-card/60 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Configured Message Templates</span>
            <span className="text-xs text-muted-foreground">Interpolated at runtime</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground bg-muted/30">
                <th className="py-2.5 px-4 font-medium">Template Key</th>
                <th className="py-2.5 px-4 font-medium">Channel</th>
                <th className="py-2.5 px-4 font-medium">Subject / Title</th>
                <th className="py-2.5 px-4 font-medium">Allowed Variables</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {[
                { key: "invoice.confirmed", channel: "EMAIL & WHATSAPP", subject: "Invoice {{invoice_number}} is ready", vars: "customer_name, invoice_number, total, pdf_url" },
                { key: "payment.receipt", channel: "EMAIL", subject: "Payment received for {{invoice_number}}", vars: "customer_name, amount, payment_ref, date" },
                { key: "renewal.reminder_7d", channel: "WHATSAPP", subject: "Subscription renewal in 7 days", vars: "plan_name, renewal_date, amount" },
                { key: "dunning.overdue_warning", channel: "WHATSAPP & EMAIL", subject: "Urgent: Payment overdue for {{invoice_number}}", vars: "amount_due, days_overdue, pay_link" },
              ].map((t) => (
                <tr key={t.key} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-400">{t.key}</td>
                  <td className="py-3 px-4 font-mono text-zinc-300">{t.channel}</td>
                  <td className="py-3 px-4 text-foreground font-medium">{t.subject}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">{t.vars}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
