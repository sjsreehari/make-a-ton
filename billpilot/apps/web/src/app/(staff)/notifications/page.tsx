import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Notification Channels</h1>
      <Card>
        <CardHeader>
          <CardTitle>Delivery Templates</CardTitle>
          <CardDescription>Email (Mailhog local SMTP) and Twilio SMS/WhatsApp templates</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Configure renewal reminders, overdue notices, and receipt emails.</p>
        </CardContent>
      </Card>
    </div>
  );
}

