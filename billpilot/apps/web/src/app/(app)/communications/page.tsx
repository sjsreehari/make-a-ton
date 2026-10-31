"use client";

import { useState } from "react";
import {
  MessageSquare,
  Send,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Bot,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "USER" | "BOT";
  text: string;
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: "1", sender: "BOT", text: "Brightloop Software Billing Assistant. Reply with 'balance', 'invoice', 'pause', 'renew', or 'help'.", timestamp: "10:00 AM" },
  { id: "2", sender: "USER", text: "balance", timestamp: "10:02 AM" },
  { id: "3", sender: "BOT", text: "Your current account has 1 active subscription (SUB-2026-000123) and 1 overdue invoice (INV-2026-000042) for ₹65,596.20. Pay now: https://rzp.io/i/bp_inv042", timestamp: "10:02 AM" },
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "USER",
      text: input,
      timestamp: "Just now",
    };
    setMessages((prev) => [...prev, userMsg]);
    const cmd = input.trim().toLowerCase();
    setInput("");

    setTimeout(() => {
      let reply = "I didn't recognize that command. Reply 'balance', 'invoice', 'pause', 'renew', or 'help'.";
      if (cmd === "balance") {
        reply = "Active balance: ₹0.00. Unpaid overdue: ₹65,596.20 for invoice INV-2026-000042.";
      } else if (cmd === "invoice") {
        reply = "Your latest invoice PDF: https://billpilot.brightloop.test/invoices/INV-2026-000042.pdf (Total: ₹65,596.20).";
      } else if (cmd === "pause") {
        reply = "⚠️ Warning: Pausing stops recurring billing for SUB-2026-000123. Reply 'YES' to confirm pause.";
      } else if (cmd === "renew") {
        reply = "Subscription SUB-2026-000123 renewed for another 12 months! Next billing: Jan 15, 2027.";
      } else if (cmd === "yes") {
        reply = "Confirmed! Subscription SUB-2026-000123 has been paused. Service access will stop at the end of the billing period.";
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
    }, 800);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">WhatsApp & Communications</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Two-way WhatsApp billing bot, PDF delivery, payment confirmations, and reminder ledger.
          </p>
        </div>
      </div>

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
                <span className="text-[10px] text-emerald-400 font-mono">Twilio Sandbox (+1 415 523 8886)</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified User
            </span>
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
            <span className="text-xs text-muted-foreground font-mono">Twilio & Mailhog</span>
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
    </div>
  );
}
