"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card/80 p-8 shadow-2xl backdrop-blur-md space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <Logo href="/login" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">Reset Password</h1>
        <p className="text-xs text-muted-foreground">
          Enter your registered email and we&apos;ll dispatch a single-use 30-minute reset token.
        </p>
      </div>

      {submitted ? (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-xs space-y-3">
          <div className="flex items-center gap-2 font-medium text-emerald-300">
            <CheckCircle2 className="size-4" />
            <span>If an account exists, a reset link has been dispatched to Mailhog.</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            The link is valid for 30 minutes. Check your inbox or local Mailhog at <code>http://localhost:8025</code>.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:underline"
            >
              <ArrowLeft className="size-3" /> Back to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-muted-foreground block mb-1 font-medium">Account Email Address</label>
            <input
              type="email"
              required
              placeholder="user@brightloop.test"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            {loading ? "Sending link..." : "Send Password Reset Link"}
          </button>

          <div className="text-center pt-2">
            <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground">
              ← Return to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

