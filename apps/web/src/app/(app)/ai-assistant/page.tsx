"use client";

import { FormEvent, useState } from "react";
import { Bot, Send, ShieldCheck, Sparkles } from "lucide-react";
import { useAssistant } from "@/components/assistant/hooks/useAssistant";

const suggestions = [
  "Which invoices are overdue?",
  "Show monthly recurring revenue",
  "Summarize receivables aging",
  "Forecast revenue for the next three months",
];

export default function AiAssistantPage() {
  const [prompt, setPrompt] = useState("");
  const { messages, mascotState, sendMessage } = useAssistant();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const message = prompt.trim();
    if (!message || mascotState === "thinking") return;
    setPrompt("");
    void sendMessage(message);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Finance assistant</h1>
          <Sparkles className="size-4 text-indigo-400" />
        </div>
        <p className="text-xs text-muted-foreground mt-1">Ask a question about billing and finance. Answers use data available to your account.</p>
      </div>

      <div className="p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-200 flex items-center gap-2">
        <ShieldCheck className="size-4 text-indigo-400 shrink-0" />
        <span>Financial answers come from account reports. The assistant cannot change invoices or payments.</span>
      </div>

      <section className="flex-1 min-h-64 rounded-xl border border-border bg-card/60 shadow-sm flex flex-col">
        <div className="flex-1 p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full min-h-48 flex flex-col items-center justify-center gap-3 text-center">
              <Bot className="size-8 text-indigo-400" />
              <p className="text-sm text-muted-foreground">Ask a question or choose a suggestion below.</p>
            </div>
          ) : messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${message.sender === "user" ? "bg-indigo-600 text-white" : "bg-muted/60 text-foreground"}`}>
                {message.text || (mascotState === "thinking" ? "Checking your data…" : "")}
                {message.table && (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead><tr>{message.table.columns.map((column) => <th key={column} className="px-2 py-1">{column}</th>)}</tr></thead>
                      <tbody>{message.table.rows.map((row, index) => <tr key={index}>{message.table!.columns.map((column) => <td key={column} className="px-2 py-1">{String(row[column] ?? "")}</td>)}</tr>)}</tbody>
                    </table>
                  </div>
                )}
                {message.basis && <p className="mt-2 text-[10px] opacity-70">Data as of {String(message.basis.asOf || "now")}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button key={suggestion} onClick={() => void sendMessage(suggestion)} disabled={mascotState === "thinking"} className="text-[11px] px-2.5 py-1 rounded-md bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 disabled:opacity-50">{suggestion}</button>
            ))}
          </div>
          <form onSubmit={submit} className="flex gap-2">
            <input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask about invoices, revenue, or subscriptions" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <button type="submit" disabled={!prompt.trim() || mascotState === "thinking"} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              <Send className="size-4" /> Ask
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
