import { Injectable, Logger } from '@nestjs/common';
import { generateDeterministicTemplate } from './template-fallback';

@Injectable()
export class NumberGuardService {
  private readonly logger = new Logger(NumberGuardService.name);

  validateAndSanitize(
    modelText: string,
    toolResult: Record<string, unknown> | null,
    toolName?: string,
  ): { text: string; passed: boolean } {
    if (!toolResult) {
      return { text: modelText, passed: true };
    }

    // Number Guard implementation:
    // Extract every number/date/currency from the model text and verify its existence
    // in the toolResult payload (normalized).
    const extractedNumbers = this.extractNumbers(modelText);
    const validNumbers = this.collectNumbersFromObject(toolResult);

    const hasViolations = extractedNumbers.some(num => !validNumbers.has(num));

    if (hasViolations) {
      this.logger.warn(`Number Guard violation detected in model response for tool ${toolName}. Discarding text.`);
      return {
        text: generateDeterministicTemplate(toolName || 'unknown', toolResult),
        passed: false,
      };
    }

    return { text: modelText, passed: true };
  }

  private extractNumbers(text: string): string[] {
    // Matches integer and decimal numbers, currencies (₹, $, €)
    const matches = text.match(/[\d]+(?:[.,]\d+)?/g);
    return matches ? matches.map(m => m.replace(/,/g, '')) : [];
  }

  private collectNumbersFromObject(obj: unknown, set: Set<string> = new Set()): Set<string> {
    if (!obj) return set;
    if (typeof obj === 'number' || typeof obj === 'string') {
      const str = String(obj).replace(/[₹$,]/g, '').trim();
      if (/^[\d]+(?:\.\d+)?$/.test(str)) {
        set.add(str);
      }
    } else if (Array.isArray(obj)) {
      obj.forEach(item => this.collectNumbersFromObject(item, set));
    } else if (typeof obj === 'object') {
      Object.values(obj).forEach(val => this.collectNumbersFromObject(val, set));
    }
    return set;
  }
}

