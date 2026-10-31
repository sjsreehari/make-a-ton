import React from 'react';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, Users, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const metrics = [
    { title: 'Monthly Recurring Revenue (MRR)', value: '₹14,85,200', change: '+12.5%', trend: 'up' as const, icon: <DollarSign className="h-5 w-5" /> },
    { title: 'Active Subscriptions', value: '1,280', change: '+8.2%', trend: 'up' as const, icon: <CreditCard className="h-5 w-5" /> },
    { title: 'Overdue Invoices', value: '14', change: '-4.1%', trend: 'down' as const, icon: <AlertCircle className="h-5 w-5" /> },
    { title: 'Active Customers', value: '942', change: '+15', trend: 'up' as const, icon: <Users className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Staff Operations Dashboard
        </h1>
        <p className="text-sm text-slate-500">
          Live overview of subscription volume, payment collections, and billing automation metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((item) => (
          <StatsCard key={item.title} {...item} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automated Billing Engine Status</CardTitle>
          <CardDescription>Scheduled background worker & webhook handlers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs text-slate-500 font-medium">Cron: Invoice Generation</p>
              <p className="text-base font-semibold text-slate-900 mt-1">Runs daily @ 02:00 UTC</p>
              <Badge variant="success" className="mt-2">Healthy</Badge>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs text-slate-500 font-medium">Cron: Overdue & Dunning</p>
              <p className="text-base font-semibold text-slate-900 mt-1">Runs daily @ 09:00 UTC</p>
              <Badge variant="success" className="mt-2">Healthy</Badge>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs text-slate-500 font-medium">Razorpay Webhooks</p>
              <p className="text-base font-semibold text-slate-900 mt-1">Autopay & Payment Link</p>
              <Badge variant="success" className="mt-2">Connected</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
