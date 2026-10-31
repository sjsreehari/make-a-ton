import { Injectable, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMandateDto } from './mandates.dto';

@Injectable()
export class MandatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMandateDto) {
    throw new NotImplementedException('e-Mandates will be implemented by Person C');
  }

  async list(customerId?: string) {
    return { data: [] };
  }
}
