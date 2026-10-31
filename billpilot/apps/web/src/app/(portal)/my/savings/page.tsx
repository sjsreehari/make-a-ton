import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function MySavingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-indigo-600" />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Smart Savings & Optimization</h1>
      </div>
      <p className="text-sm text-slate-500">
        AI-recommended plan switches and annual commitment discounts customized for your usage.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Switch to Annual Billing</CardTitle>
          <CardDescription>Save 20% by prepaying your Enterprise subscription annually</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-slate-900">Save ₹44,400 / year</p>
              <Badge variant="success" className="mt-1">Recommended</Badge>
            </div>
            <Button variant="primary">Switch & Lock In Savings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

