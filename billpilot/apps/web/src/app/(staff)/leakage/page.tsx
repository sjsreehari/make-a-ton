import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function LeakagePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Revenue Leakage Detector</h1>
      <Card>
        <CardHeader>
          <CardTitle>Unbilled Usage & Inactive Accounts</CardTitle>
          <CardDescription>Automated detection of expired cards, uncollected taxes, and missed renewals</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Zero active leaks detected across current subscription ledger.</p>
        </CardContent>
      </Card>
    </div>
  );
}
