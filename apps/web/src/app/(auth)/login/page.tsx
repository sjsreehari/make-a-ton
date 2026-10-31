"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { Shield, User, KeyRound, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@brightloop.test");
  const [password, setPassword] = useState("Admin@12345!");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.auth.login({ email, password });
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  const handleQuickLogin = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setSubmitting(true);
    setError(null);
    api.auth
      .login({ email: roleEmail, password: rolePass })
      .then(() => {
        router.replace("/dashboard");
      })
      .catch((err: any) => {
        setError(err?.message || "Login failed.");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card/80 p-8 shadow-2xl backdrop-blur-md space-y-6">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <Logo href="/login" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">Sign In to BillPilot</h1>
        <p className="text-xs text-muted-foreground">
          Brightloop Software Subscription & Billing Platform
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="text-muted-foreground block mb-1 font-medium">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-muted-foreground font-medium">Password</label>
            <Link href="/forgot-password" className="text-[11px] text-indigo-400 hover:underline">
              Forgot?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-50"
        >
          {submitting ? "Signing in..." : "Sign In with Credentials"}
        </button>
      </form>

      {/* Quick 1-Click Demo Persona Switcher */}
      <div className="pt-4 border-t border-border space-y-2.5">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block text-center">
          ⚡ 1-Click Demo Personas
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin("admin@brightloop.test", "Admin@12345!")}
            className="px-2 py-1.5 rounded-lg text-[11px] font-medium bg-zinc-900 hover:bg-zinc-800 text-indigo-300 border border-zinc-800 transition-colors text-center"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin("staff@brightloop.test", "Staff@12345!")}
            className="px-2 py-1.5 rounded-lg text-[11px] font-medium bg-zinc-900 hover:bg-zinc-800 text-cyan-300 border border-zinc-800 transition-colors text-center"
          >
            Staff
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin("cust1@brightloop.test", "Cust@12345!")}
            className="px-2 py-1.5 rounded-lg text-[11px] font-medium bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-zinc-800 transition-colors text-center"
          >
            Customer
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-indigo-400 font-medium hover:underline">
          Sign up with password checklist →
        </Link>
      </div>
    </div>
  );
}
