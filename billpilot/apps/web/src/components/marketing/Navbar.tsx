"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function MarketingNavbar() {
  const pathname = usePathname();

  const NAV_LINKS = [
    { href: "/", label: "Product" },
    { href: "/enterprise", label: "Enterprise" },
    { href: "/customers", label: "Customers" },
    { href: "/pricing", label: "Pricing" },
    { href: "/roi", label: "Revenue ROI" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#fbfbfa]/90 border-b border-[#e8e8e3]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-7 rounded-lg bg-[#dc4a22] flex items-center justify-center text-white shadow-sm shadow-[#dc4a22]/30">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 19 21 12 17 5 21 12 2" />
              </svg>
            </div>
            <span className="font-bold text-base tracking-tight text-[#1c1b1a]">
              billpilot
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#6e6d6a]">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-[#1c1b1a] ${
                  pathname === link.href ? "text-[#dc4a22] font-semibold" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/portal" className="text-[#dc4a22] font-semibold hover:underline">
              Customer Portal
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#6e6d6a] hover:text-[#1c1b1a] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#1c1b1a] hover:bg-black text-white shadow-sm transition-all transform hover:-translate-y-0.5"
          >
            <span>Launch App</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </header>
  );
}
