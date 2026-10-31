import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function QuotationTemplatesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Quotation Templates</h1>
      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
          <CardDescription>Custom enterprise proposals and price quote presets</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Configure quotation templates with custom discount rules.</p>
        </CardContent>
      </Card>
    </div>
  );
}

