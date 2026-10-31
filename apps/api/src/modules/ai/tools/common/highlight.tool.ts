import { Injectable, BadRequestException } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { SITEMAP } from '@billpilot/shared';

@Injectable()
export class HighlightTool implements ITool {
  readonly name = 'highlight';
  readonly description = 'Highlights a specific UI element on the current page with a spotlight ring and tooltip';
  readonly roles = ['CUSTOMER', 'STAFF', 'ADMIN'];

  async execute(input: { targetId: string }, ctx: { userId: string; role: string }): Promise<ToolResult> {
    const allTargets = SITEMAP.flatMap(s => s.targets || []);
    const target = allTargets.find(t => t.id === input.targetId);

    if (!target) {
      throw new BadRequestException(`Target ID '${input.targetId}' is not registered in the sitemap.`);
    }

    const asOf = new Date().toISOString();
    return {
      data: {
        action: 'highlight',
        targetId: input.targetId,
        label: target.label,
        description: target.description,
      },
      basis: { asOf, rowCount: 1 },
      assumptions: ['Validated against sitemap target registry'],
    };
  }
}

