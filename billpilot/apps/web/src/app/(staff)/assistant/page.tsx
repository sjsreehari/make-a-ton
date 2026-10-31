import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-indigo-600" />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">AI Billing Assistant</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Anthropic Claude 3.5 Sonnet Integration</CardTitle>
          <CardDescription>Natural language revenue queries, anomaly analysis, and collection suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Ask natural language queries like &ldquo;Which accounts are 7+ days past due and eligible for WhatsApp rescue?&rdquo;</p>
        </CardContent>
      </Card>
    </div>
  );
}
