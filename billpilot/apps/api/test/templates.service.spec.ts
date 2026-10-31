import { describe, it, expect } from 'vitest';
import { TemplatesService } from '../src/modules/notifications/templates.service';

describe('TemplatesService - Variable Substitution and Validation', () => {
  const service = new TemplatesService({} as any);

  it('validates and accepts templates containing only supported variables', () => {
    const validBody = 'Hello {{customerName}}, your invoice {{invoiceNumber}} for ₹{{total}} is due on {{dueDate}}.';
    expect(() => service.validateTemplate(validBody)).not.toThrow();
  });

  it('rejects templates containing unauthorized or misspelled variables', () => {
    const invalidBody = 'Hi {{customer_first_name}}, pay here: {{bad_token}}';
    expect(() => service.validateTemplate(invalidBody)).toThrow(/Invalid template variables rejected/);
  });

  it('generates a live preview using provided sample data and detected variables', () => {
    const body = 'Invoice {{invoiceNumber}} for {{customerName}} has total ₹{{total}}.';
    const preview = service.preview({
      body,
      sampleData: {
        invoiceNumber: 'INV-2026-TEST',
        customerName: 'Stark Industries',
        total: '9,999.00',
      },
    });

    expect(preview.renderedBody).toBe('Invoice INV-2026-TEST for Stark Industries has total ₹9,999.00.');
    expect(preview.detectedVariables).toContain('invoiceNumber');
    expect(preview.detectedVariables).toContain('customerName');
    expect(preview.detectedVariables).toContain('total');
  });
});
