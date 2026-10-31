import { Injectable } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import * as glossaryData from '../../data/glossary.json';

@Injectable()
export class ExplainConceptTool implements ITool {
  readonly name = 'explain_concept';
  readonly description = 'Explains billing and finance terminology using the local static glossary (no LLM hallucination)';
  readonly roles = ['CUSTOMER', 'STAFF', 'ADMIN'];

  async execute(input: { topic: string }, ctx: { userId: string; role: string }): Promise<ToolResult> {
    const asOf = new Date().toISOString();
    const glossary = glossaryData as Record<string, { title: string; explanation: string; formula?: string }>;
    const key = input.topic.toLowerCase().trim();
    const match = glossary[key] || {
      title: input.topic,
      explanation: 'No glossary entry found for this topic.',
    };

    return {
      data: match,
      basis: { asOf, filters: { topic: input.topic }, rowCount: 1 },
      assumptions: ['Static local glossary lookup only'],
    };
  }
}
