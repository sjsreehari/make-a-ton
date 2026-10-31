import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function TaxesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Taxes & GST Rules</h1>
      <Card>
        <CardHeader>
          <CardTitle>Tax Rates</CardTitle>
          <CardDescription>Default 18% GST (CGST/SGST/IGST breakdown), HSN/SAC codes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Brightloop GSTIN: 29ABCDE1234F1Z5 configured as primary issuer.</p>
        </CardContent>
      </Card>
    </div>
  );
}
