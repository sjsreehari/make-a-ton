import { cn } from '@/lib/cn';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-success/10 text-success border-success/20',
  PAID: 'bg-success/10 text-success border-success/20',
  CONFIRMED: 'bg-primary/10 text-primary border-primary/20',
  DRAFT: 'bg-muted text-muted-foreground border-border',
  QUOTATION: 'bg-info/10 text-info-foreground border-info/20',
  CLOSED: 'bg-muted text-muted-foreground border-border',
  CANCELLED: 'bg-danger/10 text-danger border-danger/20',
  OVERDUE: 'bg-danger/10 text-danger border-danger/20',
  PAUSED: 'bg-warning/10 text-warning border-warning/20',
  FAILED: 'bg-danger/10 text-danger border-danger/20',
  RECORDED: 'bg-success/10 text-success border-success/20',
  PENDING: 'bg-warning/10 text-warning border-warning/20',
};

interface BadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  const colors = STATUS_COLORS[status] ?? 'bg-muted text-muted-foreground border-border';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-2xs font-medium',
        colors,
        className,
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
