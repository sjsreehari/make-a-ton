import { Injectable } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { v4 as uuidv4 } from 'uuid';

export interface ActionProposal {
  id: string;
  kind: string;
  title: string;
  summary: string;
  params: Record<string, unknown>;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

@Injectable()
export class ProposeActionTool implements ITool {
  readonly name = 'propose_action';
  readonly description = 'Proposes an actionable change (e.g. pause subscription, create draft invoice) requiring explicit confirmation';
  readonly roles = ['CUSTOMER', 'STAFF', 'ADMIN'];

  async execute(input: { kind: string; title?: string; summary?: string; params: Record<string, unknown> }, ctx: { userId: string; role: string }): Promise<ToolResult<ActionProposal>> {
    const proposalId = uuidv4();
    const asOf = new Date().toISOString();

    const proposal: ActionProposal = {
      id: proposalId,
      kind: input.kind,
      title: input.title || `Action Proposal: ${input.kind}`,
      summary: input.summary || 'Requires explicit confirmation before execution.',
      params: input.params,
      status: 'PENDING',
      createdAt: asOf,
    };

    return {
      data: proposal,
      basis: { asOf, rowCount: 1 },
      assumptions: ['No database mutations occur until explicit user confirmation'],
    };
  }
}
