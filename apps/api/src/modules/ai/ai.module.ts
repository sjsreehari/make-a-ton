import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { LlmClient } from './llm/llm.client';
import { ToolRegistryService } from './tools/tool-registry.service';
import { NumberGuardService } from './guard/number-guard.service';
import { SqlValidatorService } from './guard/sql-validator.service';
import { IntentMatcherService } from './fallback/intent-matcher.service';
import { AiSessionService } from './session/session.service';

// Staff tools
import { RevenueSummaryTool } from './tools/staff/revenue-summary.tool';
import { CollectionsSummaryTool } from './tools/staff/collections-summary.tool';
import { ReceivablesAgingTool } from './tools/staff/receivables-aging.tool';
import { OverdueInvoicesTool } from './tools/staff/overdue-invoices.tool';
import { TopCustomersTool } from './tools/staff/top-customers.tool';
import { SubscriptionStatsTool } from './tools/staff/subscription-stats.tool';
import { MrrSummaryTool } from './tools/staff/mrr-summary.tool';
import { MarginSummaryTool } from './tools/staff/margin-summary.tool';
import { ExpenseSummaryTool } from './tools/staff/expense-summary.tool';
import { DiscountImpactTool } from './tools/staff/discount-impact.tool';
import { TaxSummaryTool } from './tools/staff/tax-summary.tool';
import { ChurnSummaryTool } from './tools/staff/churn-summary.tool';
import { ForecastTool } from './tools/staff/forecast.tool';
import { QueryFinanceTool } from './tools/staff/query-finance.tool';

// Customer tools
import { MySpendSummaryTool } from './tools/customer/my-spend-summary.tool';
import { MyInvoicesTool } from './tools/customer/my-invoices.tool';
import { MySubscriptionsTool } from './tools/customer/my-subscriptions.tool';
import { MyNextBillsTool } from './tools/customer/my-next-bills.tool';
import { ExplainInvoiceTool } from './tools/customer/explain-invoice.tool';

// Common tools
import { ExplainConceptTool } from './tools/common/explain-concept.tool';
import { NavigateTool } from './tools/common/navigate.tool';
import { HighlightTool } from './tools/common/highlight.tool';
import { StartTourTool } from './tools/common/start-tour.tool';
import { ProposeActionTool } from './tools/common/propose-action.tool';

import { CommonAuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    LlmClient,
    ToolRegistryService,
    NumberGuardService,
    SqlValidatorService,
    IntentMatcherService,
    AiSessionService,
    CommonAuditService,

    // Staff
    RevenueSummaryTool,
    CollectionsSummaryTool,
    ReceivablesAgingTool,
    OverdueInvoicesTool,
    TopCustomersTool,
    SubscriptionStatsTool,
    MrrSummaryTool,
    MarginSummaryTool,
    ExpenseSummaryTool,
    DiscountImpactTool,
    TaxSummaryTool,
    ChurnSummaryTool,
    ForecastTool,
    QueryFinanceTool,

    // Customer
    MySpendSummaryTool,
    MyInvoicesTool,
    MySubscriptionsTool,
    MyNextBillsTool,
    ExplainInvoiceTool,

    // Common
    ExplainConceptTool,
    NavigateTool,
    HighlightTool,
    StartTourTool,
    ProposeActionTool,
  ],
  exports: [AiService],
})
export class AiModule {}

