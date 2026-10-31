import { Injectable, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDisputeDto } from './disputes.dto';

@Injectable()
export class DisputesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDisputeDto, userId: string) {
    throw new NotImplementedException('Dispute submission will be implemented by Person B');
  }

  async list(invoiceId?: string) {
    return { data: [] };
  }
}
