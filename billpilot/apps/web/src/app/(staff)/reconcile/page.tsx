import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function ReconcilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Payment Reconciliation</h1>
      <Card>
        <CardHeader>
          <CardTitle>Bank Settlement Matcher</CardTitle>
          <CardDescription>Razorpay settlement batch matching with invoice ledgers</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Reconcile payouts and gateway fees automatically.</p>
        </CardContent>
      </Card>
    </div>
  );
}
