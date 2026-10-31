import { Injectable } from '@nestjs/common';
import { SITEMAP } from '@billpilot/shared';

export interface MatchedIntent {
  kind: 'navigate' | 'analytics' | 'none';
  action?: string;
  toolName?: string;
  args?: Record<string, unknown>;
  targetPath?: string;
}

@Injectable()
export class IntentMatcherService {
  matchOfflineIntent(message: string, role: string): MatchedIntent {
    const text = message.toLowerCase().trim();

    // 1. Navigation shortcuts
    if (text.includes('go to') || text.includes('open') || text.includes('take me to') || text.includes('navigate to')) {
      if (text.includes('overdue') || text.includes('unpaid')) {
        return { kind: 'navigate', targetPath: '/invoices?status=OVERDUE' };
      }
      if (text.includes('invoice')) {
        return { kind: 'navigate', targetPath: role === 'CUSTOMER' ? '/my/invoices' : '/invoices' };
      }
      if (text.includes('subscription')) {
        return { kind: 'navigate', targetPath: role === 'CUSTOMER' ? '/my/subscriptions' : '/subscriptions' };
      }
      if (text.includes('plan')) {
        return { kind: 'navigate', targetPath: '/plans' };
      }
      if (text.includes('payment')) {
        return { kind: 'navigate', targetPath: role === 'CUSTOMER' ? '/my/payments' : '/payments' };
      }
      if (text.includes('reconcile') || text.includes('reconciliation')) {
        return { kind: 'navigate', targetPath: '/reconcile' };
      }
      if (text.includes('dashboard')) {
        return { kind: 'navigate', targetPath: '/dashboard' };
      }
    }

    // 2. Direct Analytics queries (works offline without LLM)
    if (text.includes('overdue') || text.includes('unpaid invoices')) {
      return { kind: 'analytics', toolName: 'overdue_invoices', args: { limit: 10 } };
    }
    if (text.includes('revenue') || text.includes('sales')) {
      return { kind: 'analytics', toolName: 'revenue_summary', args: { groupBy: 'month' } };
    }
    if (text.includes('mrr') || text.includes('monthly recurring')) {
      return { kind: 'analytics', toolName: 'mrr_summary', args: {} };
    }
    if (text.includes('outstanding') || text.includes('aging') || text.includes('receivable')) {
      return { kind: 'analytics', toolName: 'receivables_aging', args: {} };
    }
    if (text.includes('forecast')) {
      return { kind: 'analytics', toolName: 'forecast', args: { months: 3 } };
    }

    return { kind: 'none' };
  }
}
