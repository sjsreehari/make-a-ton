"use client";

import { Logo } from "./Logo";
import { Button } from "@/components/molecules/Button";
import { Tooltip } from "@/components/molecules/Tooltip";
import { Appearance } from "@/components/types";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import {
  BarChart3,
  Layers,
  FileText,
  PlayCircle,
  CreditCard,
  Package,
  FileCheck2,
  Percent,
  Bot,
  AlertTriangle,
  LifeBuoy,
  MessageSquare,
  History,
  UserCheck,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: string;
  badgeVariant?: "default" | "warning" | "danger" | "brand";
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "OPERATIONS",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: <BarChart3 size={15} /> },
      { href: "/subscriptions", label: "Subscriptions", icon: <Layers size={15} /> },
      { href: "/invoices", label: "Invoices", icon: <FileText size={15} /> },
      { href: "/billing-run", label: "Billing Run", icon: <PlayCircle size={15} /> },
      { href: "/payments", label: "Payments", icon: <CreditCard size={15} /> },
    ],
  },
  {
    title: "COMMERCE & CATALOG",
    items: [
      { href: "/catalog", label: "Plans & Products", icon: <Package size={15} /> },
      { href: "/quotes", label: "Quotations", icon: <FileCheck2 size={15} /> },
      { href: "/discounts-taxes", label: "Discounts & Taxes", icon: <Percent size={15} /> },
    ],
  },
  {
    title: "AI & AUTOMATION",
    items: [
      { href: "/ai-assistant", label: "AI Assistant", icon: <Bot size={15} />, badge: "AI", badgeVariant: "brand" },
      { href: "/leakage", label: "Leakage Detector", icon: <AlertTriangle size={15} /> },
      { href: "/payment-rescue", label: "Payment Rescue", icon: <LifeBuoy size={15} /> },
      { href: "/communications", label: "WhatsApp & Comms", icon: <MessageSquare size={15} /> },
    ],
  },
  {
    title: "PORTAL & AUDIT",
    items: [
      { href: "/portal", label: "Customer Portal", icon: <UserCheck size={15} />, badge: "Self-Service", badgeVariant: "default" },
      { href: "/audit", label: "Audit Trail", icon: <History size={15} /> },
    ],
  },
];

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      aria-selected={active}
      className={cn(
        "relative flex h-8 w-full items-center justify-between rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-all",
        "hover:bg-foreground/5 hover:text-foreground",
        active && "bg-foreground/10 text-foreground font-semibold shadow-sm",
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={cn("shrink-0", active ? "text-indigo-400" : "text-muted-foreground")}>{item.icon}</span>
        <span className="hidden truncate md:inline">{item.label}</span>
      </div>
      {item.badge && (
        <span
          className={cn(
            "hidden md:inline-flex text-[10px] px-1.5 py-0.2 rounded font-mono font-medium",
            item.badgeVariant === "danger" && "bg-red-500/10 text-red-400 border border-red-500/20",
            item.badgeVariant === "brand" && "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
            (!item.badgeVariant || item.badgeVariant === "default") && "bg-zinc-800 text-zinc-400 border border-zinc-700",
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const router = useRouter();

  async function handleSignOut() {
    try {
      await api.auth.logout();
    } catch {
      // Best-effort redirect
    }
    router.replace("/login");
  }

  return (
    <div className="group/sidebar relative flex h-full w-12 shrink-0 grow-0 flex-col items-start gap-1 overflow-hidden transition-all duration-200 ease-out md:w-[244px] md:overflow-visible border-r border-border bg-card/60 backdrop-blur-md">
      <header className="relative z-10 flex w-full flex-col items-center gap-4 py-3 transition-all duration-200 md:flex-row md:px-3">
        <Logo href="/dashboard" />
      </header>

      <nav className="relative z-10 flex w-full flex-1 flex-col gap-4 overflow-y-auto p-1.5 md:px-2 md:pt-1">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col gap-1">
            <span className="hidden md:block px-2 text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase">
              {section.title}
            </span>
            {section.items.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        ))}
      </nav>

      {/* Account controls */}
      <div className="relative z-10 flex w-full flex-col gap-2 p-2 border-t border-border/60 bg-card/40">
        <div className="flex w-full items-center justify-between gap-2">
          <Tooltip content="Settings & Staff" side="right" interactiveChild>
            <Button
              href="/settings"
              appearance={Appearance.Hollow}
              className={sidebarFooterButton}
            >
              <Settings className="size-4" />
            </Button>
          </Tooltip>

          <Tooltip content="Sign out" side="left" interactiveChild>
            <Button
              appearance={Appearance.Hollow}
              className={sidebarFooterButton}
              onClick={() => {
                void handleSignOut();
              }}
            >
              <LogOut className="size-4" />
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

const sidebarFooterButton =
  "size-8 shrink-0 justify-center rounded-md border border-border bg-card p-0 text-muted-foreground hover:bg-muted hover:text-foreground";
