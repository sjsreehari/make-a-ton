import { cn } from '@/lib/cn';
import React from 'react';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {}

export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center rounded border border-shortcuts bg-shortcuts px-1.5 py-0.5 text-2xs font-medium text-shortcuts-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
