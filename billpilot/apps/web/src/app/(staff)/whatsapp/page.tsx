import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function WhatsAppConfigPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">WhatsApp Twilio Integration</h1>
      <Card>
        <CardHeader>
          <CardTitle>Twilio Sandbox & Bot Configuration</CardTitle>
          <CardDescription>Conversational billing bot with quick-pay links and customer balance queries</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Twilio Webhook Target: /api/v1/webhooks/twilio/whatsapp</p>
        </CardContent>
      </Card>
    </div>
  );
}

