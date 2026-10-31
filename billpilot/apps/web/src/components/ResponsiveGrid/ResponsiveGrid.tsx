import { cn } from '@/lib/cn';
import React from 'react';

export interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4;
}

export function ResponsiveGrid({ cols = 4, className, children, ...props }: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        {
          'grid-cols-1 sm:grid-cols-2': cols === 2,
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': cols === 3,
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4': cols === 4,
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
