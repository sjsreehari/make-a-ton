import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Revenue Insights</h1>
      <Card>
        <CardHeader>
          <CardTitle>Cohort Analysis & Retention</CardTitle>
          <CardDescription>Monthly cohort retention curves, plan distribution, and expansion revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Cohort metrics calculated across subscription renewals.</p>
        </CardContent>
      </Card>
    </div>
  );
}

