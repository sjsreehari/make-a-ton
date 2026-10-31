import PDFDocument from 'pdfkit';

export interface PdfInvoiceData {
  number: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  status: string;
  company?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
  };
  customer: {
    name: string;
    email: string;
    phone?: string | null;
    company?: string | null;
    gstin?: string | null;
    billingAddress?: any;
  };
  lines: Array<{
    description: string;
    quantity: number;
    unitPrice: string | number;
    discountAmount?: string | number;
    taxRatePercent?: string | number;
    taxAmount?: string | number;
    lineTotal: string | number;
  }>;
  subtotal: string | number;
  discountTotal: string | number;
  taxTotal: string | number;
  total: string | number;
  amountPaid: string | number;
  amountDue: string | number;
  paymentLink?: string;
  paymentTerm?: string;
  notes?: string;
}

export function generateInvoicePdfBuffer(data: PdfInvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    const primaryColor = '#1e293b';
    const accentColor = '#4f46e5';
    const mutedColor = '#64748b';

    // 1. Header
    doc
      .fontSize(22)
      .fillColor(accentColor)
      .text(data.company?.name || 'Brightloop Software', 50, 45)
      .fontSize(9)
      .fillColor(mutedColor)
      .text('Automated Subscription & Billing Management', 50, 72)
      .text('billing@brightloop.io | www.brightloop.io', 50, 85);

    // Invoice Title & Meta on the right
    doc
      .fontSize(20)
      .fillColor(primaryColor)
      .text('TAX INVOICE', 350, 45, { align: 'right' })
      .fontSize(10)
      .fillColor(mutedColor)
      .text(`Invoice No: ${data.number}`, 350, 72, { align: 'right' })
      .text(`Issue Date: ${data.issueDate.substring(0, 10)}`, 350, 86, { align: 'right' })
      .text(`Due Date: ${data.dueDate.substring(0, 10)}`, 350, 100, { align: 'right' })
      .text(`Status: ${data.status}`, 350, 114, { align: 'right' });

    doc.moveTo(50, 135).lineTo(545, 135).strokeColor('#e2e8f0').stroke();

    // 2. Bill To & Summary
    let y = 145;
    doc
      .fontSize(10)
      .fillColor(accentColor)
      .text('BILLED TO:', 50, y)
      .fontSize(11)
      .fillColor(primaryColor)
      .text(data.customer.name, 50, y + 15)
      .fontSize(9)
      .fillColor(mutedColor);

    let customerY = y + 30;
    if (data.customer.company) {
      doc.text(data.customer.company, 50, customerY);
      customerY += 13;
    }
    doc.text(data.customer.email, 50, customerY);
    customerY += 13;
    if (data.customer.phone) {
      doc.text(data.customer.phone, 50, customerY);
      customerY += 13;
    }
    if (data.customer.gstin) {
      doc.text(`GSTIN: ${data.customer.gstin}`, 50, customerY);
      customerY += 13;
    }

    // Payment Terms Box on right
    doc
      .rect(350, y, 195, 55)
      .fillAndStroke('#f8fafc', '#e2e8f0');
    doc
      .fillColor(primaryColor)
      .fontSize(9)
      .text(`Payment Term: ${data.paymentTerm || 'NET_15'}`, 360, y + 10)
      .text(`Amount Due: ${data.currency} ${Number(data.amountDue).toFixed(2)}`, 360, y + 25)
      .fillColor(accentColor)
      .text(data.paymentLink ? 'Pay Link: Available Online' : '', 360, y + 40);

    y = Math.max(customerY + 15, y + 75);

    // 3. Line Items Table Header
    doc
      .rect(50, y, 495, 22)
      .fill('#f1f5f9');
    doc
      .fillColor(primaryColor)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Description', 60, y + 6)
      .text('Qty', 260, y + 6, { width: 35, align: 'right' })
      .text('Unit Price', 305, y + 6, { width: 65, align: 'right' })
      .text('Tax Rate', 380, y + 6, { width: 50, align: 'right' })
      .text('Total', 440, y + 6, { width: 95, align: 'right' })
      .font('Helvetica');

    y += 26;

    // Line Items Rows
    for (const line of data.lines) {
      doc
        .fontSize(9)
        .fillColor(primaryColor)
        .text(line.description, 60, y, { width: 190 })
        .text(String(line.quantity), 260, y, { width: 35, align: 'right' })
        .text(Number(line.unitPrice).toFixed(2), 305, y, { width: 65, align: 'right' })
        .text(`${Number(line.taxRatePercent || 0).toFixed(0)}%`, 380, y, { width: 50, align: 'right' })
        .text(Number(line.lineTotal).toFixed(2), 440, y, { width: 95, align: 'right' });

      y += 20;
      doc.moveTo(50, y).lineTo(545, y).strokeColor('#f1f5f9').stroke();
      y += 4;
    }

    // 4. Totals Calculation Box
    y += 10;
    const totalsX = 350;
    const totalsWidth = 195;

    const printTotalRow = (label: string, value: string | number, isBold = false) => {
      if (isBold) doc.font('Helvetica-Bold');
      else doc.font('Helvetica');
      doc
        .fontSize(9)
        .fillColor(primaryColor)
        .text(label, totalsX, y)
        .text(`${data.currency} ${Number(value).toFixed(2)}`, totalsX, y, {
          width: totalsWidth,
          align: 'right',
        });
      y += 16;
    };

    printTotalRow('Subtotal:', data.subtotal);
    if (Number(data.discountTotal) > 0) {
      printTotalRow('Discount Total:', `-${Number(data.discountTotal).toFixed(2)}`);
    }
    printTotalRow('Tax Total:', data.taxTotal);

    doc.moveTo(totalsX, y).lineTo(545, y).strokeColor('#cbd5e1').stroke();
    y += 6;

    printTotalRow('Grand Total:', data.total, true);
    printTotalRow('Amount Paid:', data.amountPaid);
    printTotalRow('Balance Due:', data.amountDue, true);

    // 5. Payment Link / Footer
    y = Math.max(y + 20, 680);
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#e2e8f0').stroke();
    y += 15;

    if (data.paymentLink) {
      doc
        .fontSize(9)
        .fillColor(accentColor)
        .text(`Online Payment URL: ${data.paymentLink}`, 50, y);
      y += 15;
    }

    doc
      .fontSize(8)
      .fillColor(mutedColor)
      .text('Payment Terms: Please remit payment within the specified terms.', 50, y)
      .text('Thank you for your business! For inquiries, contact support@brightloop.io', 50, y + 12);

    doc.end();
  });
}
