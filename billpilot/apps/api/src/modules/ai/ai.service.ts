import { Injectable, NotImplementedException } from '@nestjs/common';
import { AskAssistantDto } from './ai.dto';

@Injectable()
export class AiService {
  async ask(dto: AskAssistantDto, userId: string) {
    throw new NotImplementedException(
      'AI Finance Assistant (Text-to-SQL for v_* views) will be implemented by Person D',
    );
  }

  async parseQuotation(nlText: string) {
    throw new NotImplementedException(
      'Natural Language to Quotation will be implemented by Person D',
    );
  }
}
