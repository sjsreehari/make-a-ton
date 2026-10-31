import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function StaffInvoicesPage() {
  const invoices = [
    { id: 'INV-2026-001', customer: 'Acme Technologies', subtotal: '₹18,500', gst: '₹3,330', total: '₹21,830', status: 'PAID' },
    { id: 'INV-2026-002', customer: 'BluePeak Media', subtotal: '₹42,000', gst: '₹7,560', total: '₹49,560', status: 'PAID' },
    { id: 'INV-2026-003', customer: 'Zenith Logistics', subtotal: '₹9,800', gst: '₹1,764', total: '₹11,564', status: 'OVERDUE' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Invoices & Tax Ledgers
        </h1>
        <p className="text-sm text-slate-500">
          GST-compliant multi-item invoices, credit notes, and automated discounts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Generated invoices and collection status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400">
                  <th className="pb-3">Invoice #</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Subtotal</th>
                  <th className="pb-3">GST (18%)</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-3 font-medium">{inv.id}</td>
                    <td className="py-3">{inv.customer}</td>
                    <td className="py-3">{inv.subtotal}</td>
                    <td className="py-3 text-xs text-slate-400">{inv.gst}</td>
                    <td className="py-3 font-semibold">{inv.total}</td>
                    <td className="py-3">
                      <Badge variant={inv.status === 'PAID' ? 'success' : 'danger'}>
                        {inv.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
