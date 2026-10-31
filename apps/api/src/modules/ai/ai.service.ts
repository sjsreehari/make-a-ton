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
import { buildSystemPrompt } from './llm/prompts';
import { generateDeterministicTemplate } from './guard/template-fallback';

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
        await Promise.resolve();
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

        // Use verified local reports for common finance questions. This keeps core
        // account queries responsive even when Gemini is slow or temporarily unavailable.
        if (matched.kind === 'analytics' && matched.toolName) {
          const toolResult = await this.toolRegistry.executeTool(matched.toolName, matched.args || {}, user);
          const answer = generateDeterministicTemplate(
            matched.toolName,
            toolResult as unknown as Record<string, unknown>,
          );
          await this.sessionService.appendTurn(dto.sessionId, { role: 'user', content: dto.message, timestamp: new Date().toISOString() });
          await this.sessionService.appendTurn(dto.sessionId, { role: 'model', content: answer, timestamp: new Date().toISOString() });
          subject.next({ data: { type: 'state', value: 'talking' } });
          subject.next({ data: { type: 'basis', basis: toolResult.basis as any } });
          if (Array.isArray(toolResult.data)) {
            subject.next({ data: { type: 'table', columns: Object.keys((toolResult.data[0] || {}) as object), rows: toolResult.data as Record<string, unknown>[] } });
          }
          subject.next({ data: { type: 'text', delta: answer } });
          subject.next({ data: { type: 'state', value: 'idle' } });
          subject.next({ data: { type: 'done' } });
          subject.complete();
          return;
        }

        // 2. Check if LLM is available, otherwise run offline tool fallback or guidance
        if (!this.llmClient.isAvailable()) {
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

        // 3. Ask Gemini to select from the existing role-checked finance tools.
        const allowedTools = this.toolRegistry.getAllowedToolsForRole(user.role);
        const selection = await this.llmClient.chat({
          system: `${buildSystemPrompt({ role: user.role, name: user.email, currency: 'INR', locale: 'en-IN', currentRoute: dto.currentRoute, asOf: new Date().toISOString() })}\n\nChoose one tool from this JSON list to answer the user. Return only JSON: {"tool":"tool_name","args":{}}. If none applies, return {"tool":null,"args":{}}. Do not invent tool names.\n${JSON.stringify(allowedTools.map(({ name, description }) => ({ name, description })))}`,
          history: await this.sessionService.getSessionHistory(dto.sessionId),
          message: dto.message,
        });
        let selectionValue: { tool?: unknown; args?: unknown } = {};
        try {
          selectionValue = JSON.parse((selection.text || '').replace(/^```(?:json)?\s*|\s*```$/g, ''));
        } catch {
          selectionValue = {};
        }
        const selectedName = typeof selectionValue.tool === 'string' ? selectionValue.tool : undefined;
        const isAllowed = selectedName && allowedTools.some((tool) => tool.name === selectedName);
        if (isAllowed) {
          const toolResult = await this.toolRegistry.executeTool(
            selectedName,
            selectionValue.args && typeof selectionValue.args === 'object' ? selectionValue.args as Record<string, unknown> : {},
            user,
          );
          const summary = await this.llmClient.chat({
            system: `${buildSystemPrompt({ role: user.role, name: user.email, currency: 'INR', locale: 'en-IN', currentRoute: dto.currentRoute, asOf: new Date().toISOString() })}\nSummarize the verified tool result below in 1-3 short sentences. Do not add facts or numbers that are not in the result. Return JSON with a single string property named text.\nVerified result: ${JSON.stringify(toolResult.data)}`,
            message: dto.message,
          });
          let answer = summary.text || '';
          try { answer = JSON.parse(answer).text || answer; } catch { /* Use the plain response when it is not JSON. */ }
          const guarded = this.numberGuard.validateAndSanitize(answer, toolResult as unknown as Record<string, unknown>, selectedName);
          await this.sessionService.appendTurn(dto.sessionId, { role: 'user', content: dto.message, timestamp: new Date().toISOString() });
          await this.sessionService.appendTurn(dto.sessionId, { role: 'model', content: guarded.text, timestamp: new Date().toISOString() });
          subject.next({ data: { type: 'basis', basis: toolResult.basis as any } });
          if (Array.isArray(toolResult.data)) {
            subject.next({ data: { type: 'table', columns: Object.keys((toolResult.data[0] || {}) as object), rows: toolResult.data as Record<string, unknown>[] } });
          }
          subject.next({ data: { type: 'text', delta: guarded.text } });
          subject.next({ data: { type: 'state', value: 'idle' } });
          subject.next({ data: { type: 'done' } });
          subject.complete();
          return;
        }

        // No matching data tool: answer conversational questions without claiming live figures.
        const reply = await this.llmClient.chat({
          system: `${buildSystemPrompt({ role: user.role, name: user.email, currency: 'INR', locale: 'en-IN', currentRoute: dto.currentRoute, asOf: new Date().toISOString() })}\nNo finance data tool matched this request. Give concise product guidance or ask one clarifying question. Do not invent business figures. Return JSON with a single string property named text.`,
          history: await this.sessionService.getSessionHistory(dto.sessionId),
          message: dto.message,
        });
        let replyText = reply.text || 'I could not find a matching finance report for that question.';
        try { replyText = JSON.parse(replyText).text || replyText; } catch { /* Use plain text. */ }
        subject.next({ data: { type: 'state', value: 'talking' } });
        subject.next({ data: { type: 'text', delta: replyText } });
        await this.sessionService.appendTurn(dto.sessionId, { role: 'user', content: dto.message, timestamp: new Date().toISOString() });
        await this.sessionService.appendTurn(dto.sessionId, { role: 'model', content: replyText, timestamp: new Date().toISOString() });
        subject.next({ data: { type: 'state', value: 'idle' } });
        subject.next({ data: { type: 'done' } });
        subject.complete();
      } catch (err: any) {
        this.logger.error(`Error processing chat: ${err.message}`, err.stack);
        const fallbackIntent = this.intentMatcher.matchOfflineIntent(dto.message, user.role);
        if (fallbackIntent.kind === 'analytics' && fallbackIntent.toolName) {
          try {
            const toolResult = await this.toolRegistry.executeTool(
              fallbackIntent.toolName,
              fallbackIntent.args || {},
              user,
            );
            subject.next({ data: { type: 'state', value: 'talking' } });
            subject.next({ data: { type: 'basis', basis: toolResult.basis as any } });
            subject.next({
              data: {
                type: 'text',
                delta: generateDeterministicTemplate(
                  fallbackIntent.toolName,
                  toolResult as unknown as Record<string, unknown>,
                ),
              },
            });
            subject.next({ data: { type: 'state', value: 'idle' } });
            subject.next({ data: { type: 'done' } });
            subject.complete();
            return;
          } catch (fallbackError: any) {
            this.logger.warn(`Offline finance fallback failed: ${fallbackError.message}`);
          }
        }
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

