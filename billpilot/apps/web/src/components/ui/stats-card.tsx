import React from 'react';
import { Card, CardContent } from './card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export function StatsCard({ title, value, change, trend = 'neutral', icon }: StatsCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          {icon && <div className="text-slate-400 dark:text-slate-500">{icon}</div>}
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {value}
          </p>
          {change && (
            <span
              className={cn(
                'inline-flex items-center text-xs font-semibold',
                trend === 'up' && 'text-emerald-600 dark:text-emerald-400',
                trend === 'down' && 'text-rose-600 dark:text-rose-400',
                trend === 'neutral' && 'text-slate-500'
              )}
            >
              {trend === 'up' && <TrendingUp className="mr-1 h-3.5 w-3.5" />}
              {trend === 'down' && <TrendingDown className="mr-1 h-3.5 w-3.5" />}
              {change}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
