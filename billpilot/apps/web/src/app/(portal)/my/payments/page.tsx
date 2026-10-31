import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus } from 'lucide-react';

export default function MyPaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Saved Payment Methods</h1>
          <p className="text-sm text-slate-500">Manage recurring autopay cards and UPI mandates powered by Razorpay.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Payment Method
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Mandate</CardTitle>
          <CardDescription>Primary autopay method for recurring subscription invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-indigo-600" />
              <div>
                <p className="font-semibold text-slate-900">HDFC Bank Debit Card ending in •••• 4242</p>
                <p className="text-xs text-slate-500">Expires 08/29 • E-Mandate Active</p>
              </div>
            </div>
            <Badge variant="success">DEFAULT</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
