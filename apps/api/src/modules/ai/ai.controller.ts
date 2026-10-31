import { Controller, Post, Body, Param, Sse, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
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
  @Sse()
  chat(@Body() dto: ChatRequestDto, @CurrentUser() user: JwtPayload): Observable<{ data: SseEvent }> {
    return this.aiService.streamChat(dto, {
      userId: user.sub,
      role: user.role,
      email: user.email,
      customerId: user.customerId,
    });
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

