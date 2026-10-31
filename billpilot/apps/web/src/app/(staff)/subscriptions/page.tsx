import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function SubscriptionsPage() {
  const subscriptions = [
    { id: 'SUB-1001', customer: 'Acme Technologies', plan: 'Enterprise Pro', billingCycle: 'MONTHLY', amount: '₹18,500', nextBilling: 'Nov 30, 2026', status: 'ACTIVE' },
    { id: 'SUB-1002', customer: 'BluePeak Media', plan: 'Growth Tier', billingCycle: 'ANNUAL', amount: '₹4,80,000', nextBilling: 'Oct 31, 2027', status: 'ACTIVE' },
    { id: 'SUB-1003', customer: 'Zenith Logistics', plan: 'Starter Tier', billingCycle: 'MONTHLY', amount: '₹9,800', nextBilling: 'Nov 14, 2026', status: 'PAST_DUE' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Subscriptions
          </h1>
          <p className="text-sm text-slate-500">
            Lifecycle state machine, prorated adjustments, pauses, and renewals.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Subscription
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>Managed contracts and current recurring billing state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400">
                  <th className="pb-3">Sub ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Plan</th>
                  <th className="pb-3">Cycle</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Next Billing</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="text-slate-700 dark:text-slate-300">
                    <td className="py-3 font-medium text-slate-900 dark:text-slate-100">{sub.id}</td>
                    <td className="py-3 font-medium">{sub.customer}</td>
                    <td className="py-3">{sub.plan}</td>
                    <td className="py-3 text-xs uppercase tracking-wider">{sub.billingCycle}</td>
                    <td className="py-3 font-semibold">{sub.amount}</td>
                    <td className="py-3 text-xs text-slate-400">{sub.nextBilling}</td>
                    <td className="py-3">
                      <Badge variant={sub.status === 'ACTIVE' ? 'success' : 'danger'}>
                        {sub.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

