import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function CustomerPortalSubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            My Subscriptions
          </h1>
          <p className="text-sm text-slate-500">
            Manage your active subscription plans, payment methods, and billing cycles.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enterprise Pro Plan</CardTitle>
          <CardDescription>Billed Monthly • Renews on Nov 30, 2026</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-2xl font-bold text-slate-900">₹18,500 <span className="text-sm font-normal text-slate-500">/ month</span></p>
              <Badge variant="success" className="mt-1">Active</Badge>
            </div>
            <div className="space-x-2">
              <Button variant="outline">Change Plan</Button>
              <Button variant="primary">Manage Add-ons</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

