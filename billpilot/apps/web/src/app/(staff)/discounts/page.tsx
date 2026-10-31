import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function DiscountsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Discounts & Coupons</h1>
      <Card>
        <CardHeader>
          <CardTitle>Promotional Rules</CardTitle>
          <CardDescription>Percentage discounts, fixed amount credits, and duration limiters</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Configure promotional discount codes and automatic rules.</p>
        </CardContent>
      </Card>
    </div>
  );
}
