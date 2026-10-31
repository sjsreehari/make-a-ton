import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function StaffPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Payments & Razorpay Transactions
        </h1>
        <p className="text-sm text-slate-500">
          Autopay recurring mandates, on-demand paylinks, and bank reconciliation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Gateway Transactions</CardTitle>
          <CardDescription>Razorpay payment order events and webhooks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Payment transactions list ready for live Razorpay webhooks.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

