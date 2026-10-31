export function generateDeterministicTemplate(toolName: string, data: Record<string, unknown>): string {
  switch (toolName) {
    case 'revenue_summary':
      return `Total revenue computed: ${(data.data as any)?.totalRevenue || '0.00'} ${(data.data as any)?.currency || 'INR'}.`;
    case 'collections_summary':
      return `Total collected payments: ${(data.data as any)?.totalCollected || '0.00'} ${(data.data as any)?.currency || 'INR'}.`;
    case 'receivables_aging':
      return `Total outstanding receivables: ${(data.data as any)?.totalOutstanding || '0.00'}. Current: ${(data.data as any)?.current || '0.00'}, Overdue (1-30d): ${(data.data as any)?.days1_30 || '0.00'}.`;
    case 'overdue_invoices':
      return `Found ${((data.data as any)?.invoices || []).length} overdue invoices requiring follow-up.`;
    case 'mrr_summary':
      return `Current MRR is ${(data.data as any)?.mrr || '0.00'} with ARR of ${(data.data as any)?.arr || '0.00'}.`;
    case 'subscription_stats':
      return `Active subscriptions: ${(data.data as any)?.active || 0}, Paused: ${(data.data as any)?.paused || 0}, Expiring soon: ${(data.data as any)?.expiringSoon || 0}.`;
    case 'forecast':
      return `Forecast generated for next ${((data.data as any)?.forecast || []).length} months based on active subscriptions and historical collection curves.`;
    default:
      return `Here are the verified records from the database as of ${data.basis ? (data.basis as any).asOf : 'today'}.`;
  }
}

