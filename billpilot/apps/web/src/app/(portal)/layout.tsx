import React from 'react';
import Link from 'next/link';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-6">
          <Link href="/my/subscriptions" className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-slate-100">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-extrabold text-sm">
              BP
            </span>
            <span>Customer Billing Portal</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link href="/my/subscriptions" className="hover:text-indigo-600">Subscriptions</Link>
            <Link href="/my/invoices" className="hover:text-indigo-600">Invoices</Link>
            <Link href="/my/payments" className="hover:text-indigo-600">Payment Methods</Link>
            <Link href="/my/savings" className="hover:text-indigo-600">Smart Savings</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 dark:text-slate-400">
            &larr; Back to Admin Console
          </Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-8">{children}</main>
    </div>
  );
}
