import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Compass, ShieldCheck, Database, MessageSquare } from 'lucide-react';

export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Loop AI Companion
            <Badge variant="default" className="text-xs bg-indigo-600">
              Active
            </Badge>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deterministic analytics, in-app tours, and natural-language financial queries.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card className="p-5 space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
            <ShieldCheck size={18} />
            <h3>The Golden Rule</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Loop never invents numbers. All figures, totals, and aging brackets are strictly computed from your database by deterministic tools.
          </p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
            <Compass size={18} />
            <h3>Guided Walkthroughs</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Ask Loop "How do I create a plan?" or "Take me to overdue invoices" for step-by-step interactive navigation.
          </p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
            <Database size={18} />
            <h3>Proposal Cards</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Actions (such as pausing subscriptions or initiating billing) require explicit user confirmation before any mutations occur.
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
          <MessageSquare size={17} className="text-indigo-500" />
          Interactive Companion
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
          Click the <strong>"Ask Loop"</strong> launcher button at the bottom-right of your screen to start a conversation, explore real-time revenue, or launch a guided tour.
        </p>
      </Card>
    </div>
  );
}
