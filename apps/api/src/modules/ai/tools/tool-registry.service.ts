import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ITool, ToolResult } from './tool.interface';
import { RevenueSummaryTool } from './staff/revenue-summary.tool';
import { CollectionsSummaryTool } from './staff/collections-summary.tool';
import { ReceivablesAgingTool } from './staff/receivables-aging.tool';
import { OverdueInvoicesTool } from './staff/overdue-invoices.tool';
import { TopCustomersTool } from './staff/top-customers.tool';
import { SubscriptionStatsTool } from './staff/subscription-stats.tool';
import { MrrSummaryTool } from './staff/mrr-summary.tool';
import { MarginSummaryTool } from './staff/margin-summary.tool';
import { ExpenseSummaryTool } from './staff/expense-summary.tool';
import { DiscountImpactTool } from './staff/discount-impact.tool';
import { TaxSummaryTool } from './staff/tax-summary.tool';
import { ChurnSummaryTool } from './staff/churn-summary.tool';
import { ForecastTool } from './staff/forecast.tool';
import { QueryFinanceTool } from './staff/query-finance.tool';
import { MySpendSummaryTool } from './customer/my-spend-summary.tool';
import { MyInvoicesTool } from './customer/my-invoices.tool';
import { MySubscriptionsTool } from './customer/my-subscriptions.tool';
import { MyNextBillsTool } from './customer/my-next-bills.tool';
import { ExplainInvoiceTool } from './customer/explain-invoice.tool';
import { ExplainConceptTool } from './common/explain-concept.tool';
import { NavigateTool } from './common/navigate.tool';
import { HighlightTool } from './common/highlight.tool';
import { StartTourTool } from './common/start-tour.tool';
import { ProposeActionTool } from './common/propose-action.tool';

@Injectable()
export class ToolRegistryService {
  private readonly tools = new Map<string, ITool>();

  constructor(
    revenueSummary: RevenueSummaryTool,
    collectionsSummary: CollectionsSummaryTool,
    receivablesAging: ReceivablesAgingTool,
    overdueInvoices: OverdueInvoicesTool,
    topCustomers: TopCustomersTool,
    subscriptionStats: SubscriptionStatsTool,
    mrrSummary: MrrSummaryTool,
    marginSummary: MarginSummaryTool,
    expenseSummary: ExpenseSummaryTool,
    discountImpact: DiscountImpactTool,
    taxSummary: TaxSummaryTool,
    churnSummary: ChurnSummaryTool,
    forecast: ForecastTool,
    queryFinance: QueryFinanceTool,
    mySpendSummary: MySpendSummaryTool,
    myInvoices: MyInvoicesTool,
    mySubscriptions: MySubscriptionsTool,
    myNextBills: MyNextBillsTool,
    explainInvoice: ExplainInvoiceTool,
    explainConcept: ExplainConceptTool,
    navigate: NavigateTool,
    highlight: HighlightTool,
    startTour: StartTourTool,
    proposeAction: ProposeActionTool,
  ) {
    const list: ITool[] = [
      revenueSummary,
      collectionsSummary,
      receivablesAging,
      overdueInvoices,
      topCustomers,
      subscriptionStats,
      mrrSummary,
      marginSummary,
      expenseSummary,
      discountImpact,
      taxSummary,
      churnSummary,
      forecast,
      queryFinance,
      mySpendSummary,
      myInvoices,
      mySubscriptions,
      myNextBills,
      explainInvoice,
      explainConcept,
      navigate,
      highlight,
      startTour,
      proposeAction,
    ];

    for (const tool of list) {
      this.tools.set(tool.name, tool);
    }
  }

  getTool(name: string): ITool | undefined {
    return this.tools.get(name);
  }

  getAllowedToolsForRole(role: string): ITool[] {
    return Array.from(this.tools.values()).filter(t => t.roles.includes(role));
  }

  async executeTool(name: string, args: Record<string, unknown>, user: { userId: string; role: string; customerId?: string }): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new NotFoundException(`Unknown tool: ${name}`);
    }

    if (!tool.roles.includes(user.role)) {
      throw new ForbiddenException(`Role '${user.role}' is not authorized to use tool '${name}'`);
    }

    return tool.execute(args, user);
  }
}

