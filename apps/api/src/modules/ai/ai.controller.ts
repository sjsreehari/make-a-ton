import { Controller, Post, Body, Param, UseGuards, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AiService } from './ai.service';
import { ChatRequestDto, SseEvent } from './ai.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../../common/guards/roles.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  chat(@Body() dto: ChatRequestDto, @CurrentUser() user: JwtPayload, @Res() response: Response): void {
    response.set({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    response.flushHeaders();

    const subscription = this.aiService.streamChat(dto, {
      userId: user.sub,
      role: user.role,
      email: user.email,
      customerId: user.customerId,
    }).subscribe({
      next: (event) => response.write(`data: ${JSON.stringify(event.data)}\n\n`),
      error: () => {
        response.write(`data: ${JSON.stringify({ type: 'state', value: 'oops' } satisfies SseEvent)}\n\n`);
        response.end();
      },
      complete: () => response.end(),
    });

    response.on('close', () => subscription.unsubscribe());
  }

  @Post('proposals/:id/confirm')
  confirmProposal(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.aiService.confirmProposal(id, {
      userId: user.sub,
      role: user.role,
    });
  }

  @Post('proposals/:id/cancel')
  cancelProposal(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.aiService.cancelProposal(id, {
      userId: user.sub,
      role: user.role,
    });
  }
}

