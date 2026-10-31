"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Check, X, CheckCircle2, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live password validation checks [REQ 1.1]
  const hasMinLen = password.length >= 9;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isValidPassword = hasMinLen && hasUpper && hasLower && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPassword) {
      setError("Please satisfy all password security requirements.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone: phone || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "Signup failed.");
      }
      if (data?.accessToken && typeof window !== "undefined") {
        localStorage.setItem("billpilot_token", data.accessToken);
      }
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Failed to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card/80 p-8 shadow-2xl backdrop-blur-md space-y-6">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <Logo href="/login" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">Create BillPilot Account</h1>
        <p className="text-xs text-muted-foreground">
          Sign up to access self-service billing and customer subscriptions.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="text-muted-foreground block mb-1 font-medium">Full Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Rahul Verma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="text-muted-foreground block mb-1 font-medium">Business Email</label>
          <input
            type="email"
            required
            placeholder="rahul@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="text-muted-foreground block mb-1 font-medium">Phone (Optional E.164 for WhatsApp)</label>
          <input
            type="tel"
            placeholder="+919876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="text-muted-foreground block mb-1 font-medium">Password</label>
          <input
            type="password"
            required
            placeholder="Enter secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          {/* Live Strength Checklist [REQ 1.1] */}
          <div className="mt-2.5 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5 text-[11px]">
            <span className="font-semibold text-zinc-400 block mb-1">Live Security Checklist:</span>
            <div className={`flex items-center gap-1.5 ${hasMinLen ? "text-emerald-400" : "text-zinc-500"}`}>
              {hasMinLen ? <Check className="size-3" /> : <X className="size-3" />}
              <span>More than 8 characters (length ≥ 9)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-400" : "text-zinc-500"}`}>
              {hasUpper ? <Check className="size-3" /> : <X className="size-3" />}
              <span>At least one uppercase letter (A-Z)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasLower ? "text-emerald-400" : "text-zinc-500"}`}>
              {hasLower ? <Check className="size-3" /> : <X className="size-3" />}
              <span>At least one lowercase letter (a-z)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasSpecial ? "text-emerald-400" : "text-zinc-500"}`}>
              {hasSpecial ? <Check className="size-3" /> : <X className="size-3" />}
              <span>At least one special character (!@#$%^&*)</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !isValidPassword}
          className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-50"
        >
          {submitting ? "Creating account..." : "Complete Registration"}
        </button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-400 font-medium hover:underline">
          Sign in here →
        </Link>
      </div>
    </div>
  );
}

