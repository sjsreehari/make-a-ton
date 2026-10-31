import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Product Catalog</h1>
          <p className="text-sm text-slate-500">Manage billing products, modules, and billable add-ons.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Catalog Items</CardTitle>
          <CardDescription>Available software tiers and metered features</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Products initialized from shared catalog definitions.</p>
        </CardContent>
      </Card>
    </div>
  );
}
