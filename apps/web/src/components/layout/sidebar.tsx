'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  CreditCard,
  Receipt,
  Percent,
  Banknote,
  DollarSign,
  ShieldAlert,
  MessageSquare,
  Sparkles,
  TrendingUp,
  History,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    label: 'Core & Catalog',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
      { name: 'Products', href: '/products', icon: Package },
      { name: 'Plans', href: '/plans', icon: Layers },
      { name: 'Staff Team', href: '/staff', icon: Users },
      { name: 'Audit Log', href: '/audit-log', icon: History },
    ],
  },
  {
    label: 'Billing & Tax',
    items: [
      { name: 'Invoices', href: '/invoices', icon: Receipt },
      { name: 'Discounts', href: '/discounts', icon: Percent },
      { name: 'Taxes & GST', href: '/taxes', icon: Banknote },
    ],
  },
  {
    label: 'Payments & Recovery',
    items: [
      { name: 'Payments', href: '/payments', icon: DollarSign },
      { name: 'Reconciliation', href: '/reconcile', icon: Banknote },
      { name: 'Dunning & Rescue', href: '/rescue', icon: ShieldAlert },
    ],
  },
  {
    label: 'Insights & AI',
    items: [
      { name: 'WhatsApp Bot', href: '/whatsapp', icon: MessageSquare },
      { name: 'MRR & Retention', href: '/mrr', icon: TrendingUp },
      { name: 'AI Billing Assistant', href: '/assistant', icon: Sparkles },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-slate-900 text-slate-200 flex flex-col">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-extrabold text-base">
            BP
          </span>
          <span>BillPilot</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {group.label}
            </p>
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="rounded-lg bg-slate-800/80 p-3 text-xs text-slate-400">
          <p className="font-semibold text-slate-300">Customer Portal</p>
          <Link href="/my/subscriptions" className="text-indigo-400 hover:underline">
            Switch to Customer View &rarr;
          </Link>
        </div>
      </div>
    </aside>
  );
}
