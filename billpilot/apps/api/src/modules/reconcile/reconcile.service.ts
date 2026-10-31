import { Injectable, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UploadStatementDto } from './reconcile.dto';

@Injectable()
export class ReconcileService {
  constructor(private readonly prisma: PrismaService) {}

  async processStatement(dto: UploadStatementDto) {
    throw new NotImplementedException('Bank statement reconciliation will be implemented by Person C');
  }

  async getReviewQueue() {
    return { data: [] };
  }
}
