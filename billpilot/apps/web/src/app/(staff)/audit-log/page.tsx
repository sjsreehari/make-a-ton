import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function AuditLogPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Audit Logs</h1>
      <Card>
        <CardHeader>
          <CardTitle>System Activity Trail</CardTitle>
          <CardDescription>Immutable record of subscription modifications, manual overrides, and billing events</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Audit event streamer connected to backend audit service.</p>
        </CardContent>
      </Card>
    </div>
  );
}
