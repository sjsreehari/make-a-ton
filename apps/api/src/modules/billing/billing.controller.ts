import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Headers,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { BillingService } from './billing.service';
import { CreditNotesService } from './credit-notes.service';
import {
  RunBillingDto,
  CancelInvoiceDto,
  BulkActionDto,
  SetPatternDto,
  runBillingSchema,
  cancelInvoiceSchema,
  bulkActionSchema,
  setPatternSchema,
} from './billing.dto';
import type { JwtPayload } from '../../common/guards/roles.guard';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('invoices')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly creditNotesService: CreditNotesService,
  ) {}

  @Get()
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'List invoices with pagination and derived display statuses' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    const customerId = user?.role === 'CUSTOMER' ? user.customerId : undefined;
    return this.billingService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      customerId,
      status,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'Get single invoice with detailed breakdown' })
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const customerId = user.role === 'CUSTOMER' ? user.customerId : undefined;
    return this.billingService.findOne(id, customerId);
  }

  @Post('run-billing')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Execute billing generation batch with missed period catch-up' })
  async runBilling(
    @Body(new ZodValidationPipe(runBillingSchema)) dto: RunBillingDto,
    @Headers('Idempotency-Key') _idempotencyKey?: string,
  ) {
    const asOf = dto.asOf ? new Date(dto.asOf) : new Date();
    return this.billingService.runBilling(asOf, { dryRun: dto.dryRun });
  }

  @Post('bulk-action')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Perform bulk action on selected invoices' })
  async bulkAction(
    @Body(new ZodValidationPipe(bulkActionSchema)) dto: BulkActionDto,
  ) {
    return this.billingService.executeBulkAction(dto.action, dto.invoiceIds, dto.reason);
  }

  @Post('settings/number-pattern')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Configure invoice numbering pattern' })
  async setPattern(
    @Body(new ZodValidationPipe(setPatternSchema)) dto: SetPatternDto,
  ) {
    this.billingService.setNumberPattern(dto.pattern);
    return { pattern: this.billingService.getNumberPattern() };
  }

  @Get('settings/number-pattern')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Get current invoice numbering pattern' })
  async getPattern() {
    return { pattern: this.billingService.getNumberPattern() };
  }

  @Post(':id/confirm')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Confirm draft invoice and lock line items' })
  async confirm(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.billingService.confirm(id, user?.sub);
  }

  @Post(':id/cancel')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Cancel invoice' })
  async cancel(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(cancelInvoiceSchema)) dto: CancelInvoiceDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.billingService.cancel(id, dto.reason, user?.sub);
  }

  @Post(':id/send')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Mark invoice as sent' })
  async send(@Param('id') id: string) {
    await this.billingService.send(id);
    return { success: true };
  }

  @Post(':id/viewed')
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'Record invoice view event from client portal' })
  async trackViewed(@Param('id') id: string) {
    return this.billingService.trackViewed(id);
  }

  @Get(':id/pdf')
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'Download or stream generated invoice PDF' })
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.billingService.renderPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="invoice-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Post(':id/credit-notes')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Issue credit note for an invoice and reduce amount due' })
  async createCreditNote(
    @Param('id') id: string,
    @Body() dto: { amount: number; reason: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.creditNotesService.createForInvoice(
      id,
      dto,
      user ? { id: user.sub, role: user.role } : undefined,
    );
  }

  @Get(':id/credit-notes')
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'List credit notes for an invoice' })
  async listCreditNotes(@Param('id') id: string) {
    return this.creditNotesService.findByInvoice(id);
  }

  @Get('credit-notes/:creditNoteId/pdf')
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'Download or stream credit note PDF' })
  async downloadCreditNotePdf(@Param('creditNoteId') creditNoteId: string, @Res() res: Response) {
    const pdfBuffer = await this.creditNotesService.renderPdf(creditNoteId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="credit-note-${creditNoteId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
