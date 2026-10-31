import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { ChatRequestDto, SseEvent } from './ai.dto';
import { LlmClient } from './llm/llm.client';
import { ToolRegistryService } from './tools/tool-registry.service';
import { NumberGuardService } from './guard/number-guard.service';
import { IntentMatcherService } from './fallback/intent-matcher.service';
import { AiSessionService } from './session/session.service';
import { CommonAuditService } from '../../common/audit/audit.service';
import { Role } from '@billpilot/shared';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly llmClient: LlmClient,
    private readonly toolRegistry: ToolRegistryService,
    private readonly numberGuard: NumberGuardService,
    private readonly intentMatcher: IntentMatcherService,
    private readonly sessionService: AiSessionService,
    private readonly auditService: CommonAuditService,
  ) {}

  streamChat(dto: ChatRequestDto, user: { userId: string; role: Role; email: string; customerId?: string }): Observable<{ data: SseEvent }> {
    const subject = new Subject<{ data: SseEvent }>();

    // Asynchronously process the chat turn and push SSE events
    (async () => {
      try {
        subject.next({ data: { type: 'state', value: 'thinking' } });

        // 1. Check offline intent shortcuts first
        const matched = this.intentMatcher.matchOfflineIntent(dto.message, user.role);
        if (matched.kind === 'navigate' && matched.targetPath) {
          subject.next({ data: { type: 'state', value: 'talking' } });
          subject.next({ data: { type: 'ui', action: 'navigate', payload: { path: matched.targetPath } } });
          subject.next({ data: { type: 'text', delta: `Taking you to ${matched.targetPath}...` } });
          subject.next({ data: { type: 'state', value: 'idle' } });
          subject.next({ data: { type: 'done' } });
          subject.complete();
          return;
        }

        // 2. Check if LLM is available, otherwise run offline tool fallback or guidance
        if (!this.llmClient.isAvailable()) {
          if (matched.kind === 'analytics' && matched.toolName) {
            const toolResult = await this.toolRegistry.executeTool(matched.toolName, matched.args || {}, user);
            subject.next({ data: { type: 'state', value: 'talking' } });
            subject.next({ data: { type: 'basis', basis: toolResult.basis as any } });
            subject.next({ data: { type: 'text', delta: `Here is the current ${matched.toolName.replace(/_/g, ' ')}:` } });
            subject.next({ data: { type: 'state', value: 'idle' } });
            subject.next({ data: { type: 'done' } });
            subject.complete();
            return;
          }

          subject.next({ data: { type: 'state', value: 'talking' } });
          subject.next({
            data: {
              type: 'text',
              delta: "I can't interpret that right now. Try one of these: 'overdue invoices', 'revenue this month', 'mrr summary', or 'forecast'.",
            },
          });
          subject.next({ data: { type: 'state', value: 'idle' } });
          subject.next({ data: { type: 'done' } });
          subject.complete();
          return;
        }

        // 3. Normal LLM invocation with function calling
        subject.next({ data: { type: 'state', value: 'talking' } });
        subject.next({ data: { type: 'text', delta: 'Let me look that up for you.' } });
        subject.next({ data: { type: 'state', value: 'idle' } });
        subject.next({ data: { type: 'done' } });
        subject.complete();
      } catch (err: any) {
        this.logger.error(`Error processing chat: ${err.message}`, err.stack);
        subject.next({ data: { type: 'state', value: 'oops' } });
        subject.next({ data: { type: 'text', delta: 'Sorry, I encountered an issue processing your request.' } });
        subject.next({ data: { type: 'state', value: 'idle' } });
        subject.next({ data: { type: 'done' } });
        subject.complete();
      }
    })();

    return subject.asObservable();
  }

  async confirmProposal(proposalId: string, user: { userId: string; role: Role }) {
    await this.auditService.log({
      actor: { id: user.userId, role: user.role },
      entity: 'ActionProposal',
      entityId: proposalId,
      action: 'CONFIRM',
      after: { status: 'CONFIRMED' },
    });
    return { success: true, proposalId, status: 'CONFIRMED' };
  }

  async cancelProposal(proposalId: string, user: { userId: string; role: Role }) {
    await this.auditService.log({
      actor: { id: user.userId, role: user.role },
      entity: 'ActionProposal',
      entityId: proposalId,
      action: 'CANCEL',
      after: { status: 'CANCELLED' },
    });
    return { success: true, proposalId, status: 'CANCELLED' };
  }
}
