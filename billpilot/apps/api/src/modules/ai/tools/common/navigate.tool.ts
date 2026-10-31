import { Injectable, BadRequestException } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { SITEMAP } from '@billpilot/shared';

@Injectable()
export class NavigateTool implements ITool {
  readonly name = 'navigate';
  readonly description = 'Navigates the user to an authorized page within BillPilot with optional query filters';
  readonly roles = ['CUSTOMER', 'STAFF', 'ADMIN'];

  async execute(input: { page: string; filters?: Record<string, string> }, ctx: { userId: string; role: string }): Promise<ToolResult> {
    const entry = SITEMAP.find(s => s.id === input.page || s.path === input.page);
    if (!entry) {
      throw new BadRequestException(`Page '${input.page}' does not exist in the sitemap registry.`);
    }

    if (!entry.roles.includes(ctx.role as any)) {
      throw new BadRequestException(`Your role '${ctx.role}' is not authorized to view this page.`);
    }

    const asOf = new Date().toISOString();
    return {
      data: {
        action: 'navigate',
        path: entry.path,
        filters: input.filters || {},
      },
      basis: { asOf, rowCount: 1 },
      assumptions: ['Validated against sitemap registry and user role permissions'],
    };
  }
}
