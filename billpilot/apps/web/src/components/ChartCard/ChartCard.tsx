import { Card } from '@/components/molecules/Card';
import { cn } from '@/lib/cn';
import React from 'react';

export interface ChartCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function ChartCard({ title, description, actions, children, className, ...props }: ChartCardProps) {
  return (
    <Card className={cn('p-0 @container', className)} {...props}>
      <div className="flex items-start justify-between border-b border-border px-5 py-4">
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          {description && <p className="text-2xs text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}
