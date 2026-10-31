import { Controller, Get, Query, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from './reports.dto';
import type { JwtPayload } from '../../common/guards/roles.guard';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Executive summary metrics for billing dashboard' })
  async getDashboard(@Query() query: ReportFilterDto) {
    return this.reportsService.getDashboardSummary(query);
  }

  @Get('aging')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Accounts receivable aging report (Current, 1-30, 31-60, 61-90, 90+)' })
  async getAging(@Query('asOf') asOf?: string) {
    const date = asOf ? new Date(asOf) : new Date();
    return this.reportsService.getAgingReport(date);
  }

  @Get('aging/csv')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Export aging report as CSV' })
  async exportAgingCsv(@Res() res: Response, @Query('asOf') asOf?: string) {
    const report = await this.reportsService.getAgingReport(asOf ? new Date(asOf) : new Date());
    let csv = 'Customer,Email,Current,1-30 Days,31-60 Days,61-90 Days,90+ Days,Total\n';
    for (const c of report.customers) {
      csv += `"${c.customerName}","${c.customerEmail}",${c.current},${c.days1To30},${c.days31To60},${c.days61To90},${c.days90Plus},${c.total}\n`;
    }
    csv += `"TOTAL","",${report.totals.current},${report.totals.days1To30},${report.totals.days31To60},${report.totals.days61To90},${report.totals.days90Plus},${report.totals.total}\n`;

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="ar-aging-report.csv"',
    });
    res.send(csv);
  }

  @Get('tax-summary')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Tax summary report by rate and collected tax' })
  async getTaxSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getTaxSummaryReport(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('payments-by-method')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Payments breakdown report grouped by payment method' })
  async getPaymentsByMethod(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getPaymentsByMethodReport(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('statement/:customerId')
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'Customer account statement with running balance' })
  async getStatement(
    @Param('customerId') customerId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const effectiveCustomerId = user.role === 'CUSTOMER' ? user.customerId! : customerId;
    return this.reportsService.getCustomerStatement(effectiveCustomerId);
  }

  @Get('statement/:customerId/pdf')
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'Download customer statement as PDF' })
  async downloadStatementPdf(
    @Param('customerId') customerId: string,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const effectiveCustomerId = user.role === 'CUSTOMER' ? user.customerId! : customerId;
    const pdfBuffer = await this.reportsService.renderStatementPdf(effectiveCustomerId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="statement-${effectiveCustomerId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Get('statement/:customerId/csv')
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'Export customer statement as CSV' })
  async exportStatementCsv(
    @Param('customerId') customerId: string,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const effectiveCustomerId = user.role === 'CUSTOMER' ? user.customerId! : customerId;
    const stmt = await this.reportsService.getCustomerStatement(effectiveCustomerId);

    let csv = `Customer Statement: ${stmt.customer.name} (${stmt.customer.currency})\n`;
    csv += `Total Invoiced,${stmt.summary.totalInvoiced},Total Paid,${stmt.summary.totalPaid},Outstanding Balance,${stmt.summary.outstandingBalance}\n\n`;
    csv += 'Date,Type,Reference,Description,Invoiced,Paid/Credit,Running Balance\n';

    for (const t of stmt.transactions) {
      csv += `"${t.date.substring(0, 10)}","${t.type}","${t.reference}","${t.description.replace(/"/g, '""')}",${t.debit},${t.credit},${t.runningBalance}\n`;
    }

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="statement-${effectiveCustomerId}.csv"`,
    });
    res.send(csv);
  }
}
