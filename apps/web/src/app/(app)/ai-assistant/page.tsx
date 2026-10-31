"use client";

import { FormEvent, useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";

const suggestions = [
  "Which invoices are overdue?",
  "Show monthly recurring revenue",
  "Summarize receivables aging",
  "Forecast revenue for the next three months",
];

const answers: Record<string, string> = {
  [suggestions[0]]: "Open Invoices and filter by status “Overdue” to see each customer, due date, and outstanding balance. This demo assistant does not read live account data.",
  [suggestions[1]]: "Monthly recurring revenue (MRR) is the normalized monthly value of active recurring subscriptions. Open Insights → MRR for the current account total and trend. This demo assistant does not read live account data.",
  [suggestions[2]]: "Receivables aging groups unpaid invoices by how long they have been outstanding (for example, current, 1–30, 31–60, and 60+ days). Review the Invoices page and its aging report for account-specific balances.",
  [suggestions[3]]: "A useful three-month forecast starts with current active recurring revenue, then accounts for expected renewals, cancellations, and known new subscriptions. Open Insights to review your account’s current MRR trend before forecasting.",
};

type Message = { id: number; sender: "user" | "assistant"; text: string };

export default function AiAssistantPage() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const question = prompt.trim();
    if (!question) return;
    const normalized = question.toLocaleLowerCase().replace(/[?.!]/g, "").trim();
    const match = suggestions.find((item) => item.toLocaleLowerCase().replace(/[?.!]/g, "").trim() === normalized);
    const answer = match
      ? answers[match]
      : "I’m a demo assistant with preset answers. Try one of the suggested questions below, or type it here to get its answer.";
    setMessages((current) => [...current, { id: Date.now(), sender: "user", text: question }, { id: Date.now() + 1, sender: "assistant", text: answer }]);
    setPrompt("");
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Finance assistant</h1>
          <Sparkles className="size-4 text-indigo-400" />
        </div>
        <p className="text-xs text-muted-foreground mt-1">Choose a suggested question or type it below to get a preset answer.</p>
      </div>

      <section className="flex-1 min-h-64 rounded-xl border border-border bg-card/60 shadow-sm flex flex-col">
        <div className="flex-1 p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full min-h-48 flex flex-col items-center justify-center gap-3 text-center">
              <Bot className="size-8 text-indigo-400" />
              <p className="text-sm text-muted-foreground">Try a suggested question, or type one into the chat.</p>
            </div>
          ) : messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${message.sender === "user" ? "bg-indigo-600 text-white" : "bg-muted/60 text-foreground"}`}>
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => setPrompt(suggestion)} className="text-[11px] px-2.5 py-1 rounded-md bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50">{suggestion}</button>
            ))}
          </div>
          <form onSubmit={submit} className="flex gap-2">
            <input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Type one of the suggested questions" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <button type="submit" disabled={!prompt.trim()} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              <Send className="size-4" /> Ask
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
