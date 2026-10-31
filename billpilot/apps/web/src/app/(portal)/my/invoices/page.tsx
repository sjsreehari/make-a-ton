import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function CustomerPortalInvoicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          My Invoices & Receipts
        </h1>
        <p className="text-sm text-slate-500">
          Download GST tax receipts and view transaction settlement history.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Statements of account and paid receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="font-semibold text-slate-900">INV-2026-001</p>
              <p className="text-xs text-slate-500">October 31, 2026</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-slate-900">₹21,830</span>
              <Badge variant="success">PAID</Badge>
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" /> PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
