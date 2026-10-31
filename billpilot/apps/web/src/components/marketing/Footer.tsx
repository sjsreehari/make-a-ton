"use client";

import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="bg-[#0e0e0d] text-white pt-20 pb-12 px-4 sm:px-6 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
          <div>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-3 font-semibold">
              Operations
            </span>
            <ul className="space-y-2 text-zinc-400">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/subscriptions" className="hover:text-white transition-colors">Subscriptions</Link></li>
              <li><Link href="/invoices" className="hover:text-white transition-colors">Invoices & Billing</Link></li>
              <li><Link href="/billing-run" className="hover:text-white transition-colors">Bulk Billing Run</Link></li>
              <li><Link href="/payments" className="hover:text-white transition-colors">Reconciliation</Link></li>
            </ul>
          </div>

          <div>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-3 font-semibold">
              Commerce
            </span>
            <ul className="space-y-2 text-zinc-400">
              <li><Link href="/catalog" className="hover:text-white transition-colors">Plans & Products</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing Tiers</Link></li>
              <li><Link href="/quotes" className="hover:text-white transition-colors">Quotation Templates</Link></li>
              <li><Link href="/discounts-taxes" className="hover:text-white transition-colors">GST Tax Rules</Link></li>
              <li><Link href="/discounts-taxes" className="hover:text-white transition-colors">Discounts & Margins</Link></li>
            </ul>
          </div>

          <div>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-3 font-semibold">
              Automation
            </span>
            <ul className="space-y-2 text-zinc-400">
              <li><Link href="/ai-assistant" className="hover:text-white transition-colors">AI Finance Assistant</Link></li>
              <li><Link href="/leakage" className="hover:text-white transition-colors">Leakage Detector</Link></li>
              <li><Link href="/payment-rescue" className="hover:text-white transition-colors">Payment Rescue</Link></li>
              <li><Link href="/communications" className="hover:text-white transition-colors">WhatsApp Bot</Link></li>
            </ul>
          </div>

          <div>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-3 font-semibold">
              Enterprise
            </span>
            <ul className="space-y-2 text-zinc-400">
              <li><Link href="/enterprise" className="hover:text-white transition-colors">Security & Idempotency</Link></li>
              <li><Link href="/customers" className="hover:text-white transition-colors">Customer Stories</Link></li>
              <li><Link href="/roi" className="hover:text-white transition-colors">Revenue ROI</Link></li>
              <li><Link href="/portal" className="hover:text-white transition-colors">Customer Portal</Link></li>
            </ul>
          </div>

          <div>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-3 font-semibold">
              Brightloop
            </span>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              BillPilot was built for the Hackathon challenge to remove every manual step in recurring billing.
            </p>
          </div>
        </div>

        {/* Huge Stylized Watermark Logo matching reference */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-6">
          <span className="text-5xl sm:text-7xl font-bold tracking-tighter text-zinc-900 select-none font-sans">
            billpilot
          </span>
          <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All systems normal
            </span>
            <span>© 2026 Brightloop Software</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
