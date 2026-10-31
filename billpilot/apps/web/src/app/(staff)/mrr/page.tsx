import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function MRRPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">MRR Breakdown</h1>
      <Card>
        <CardHeader>
          <CardTitle>MRR Movement Waterfall</CardTitle>
          <CardDescription>New MRR, Expansion, Contraction, and Churn</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">MRR movements tracked across billing cycles.</p>
        </CardContent>
      </Card>
    </div>
  );
}
