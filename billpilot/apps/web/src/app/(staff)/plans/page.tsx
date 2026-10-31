import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Pricing Plans</h1>
          <p className="text-sm text-slate-500">Configure recurring cadences, trial periods, and billing currencies.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create Plan
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Configured Plans</CardTitle>
          <CardDescription>Monthly, quarterly, and annual subscription tiers</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Plan tiers loaded from catalog.</p>
        </CardContent>
      </Card>
    </div>
  );
}

