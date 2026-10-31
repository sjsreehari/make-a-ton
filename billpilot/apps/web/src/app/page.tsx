import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex h-16 items-center justify-between border-b px-8">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-extrabold text-white text-base">
            BP
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900">BillPilot</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Open Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 py-24 text-center">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200">
            Brightloop Hackathon Edition
          </span>
          <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            "We removed every manual step in the billing month."
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Automated recurring subscription billing, intelligent dunning with WhatsApp & email notifications, multi-currency invoices, and payment orchestration with Razorpay.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Launch Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50"
            >
              Demo Logins
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 text-left md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-6 shadow-sm">
              <Zap className="h-8 w-8 text-indigo-600" />
              <h3 className="mt-4 font-semibold text-slate-900">Automated Invoicing</h3>
              <p className="mt-2 text-sm text-slate-600">
                Nightly cron jobs automatically generate GST-compliant invoices and trigger charge cycles.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-6 shadow-sm">
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
              <h3 className="mt-4 font-semibold text-slate-900">Smart Dunning & Recovery</h3>
              <p className="mt-2 text-sm text-slate-600">
                Failed payment retry waterfall with interactive WhatsApp payment links powered by Twilio.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-6 shadow-sm">
              <CheckCircle2 className="h-8 w-8 text-blue-600" />
              <h3 className="mt-4 font-semibold text-slate-900">Real-time Metrics</h3>
              <p className="mt-2 text-sm text-slate-600">
                Track MRR, churn rate, collection velocity, and subscription health across all tiers.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

