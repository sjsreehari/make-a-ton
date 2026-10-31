import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { AskAssistantDto, askAssistantSchema } from './ai.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('ai')
@Roles('ADMIN', 'STAFF')
export class AiController {
  constructor(private readonly service: AiService) {}

  @Post('assistant')
  async ask(
    @Body(new ZodValidationPipe(askAssistantSchema)) dto: AskAssistantDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.ask(dto, userId);
  }
}
