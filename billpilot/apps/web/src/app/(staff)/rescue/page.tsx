import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function RescuePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Dunning & Payment Rescue Engine
        </h1>
        <p className="text-sm text-slate-500">
          Smart retry schedules, WhatsApp payment links, and automated churn prevention.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Rescued Revenue</CardTitle>
            <CardDescription>Last 30 days recovery</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-emerald-600">₹3,42,000</p>
            <Badge variant="success" className="mt-2">78% Recovery Rate</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

