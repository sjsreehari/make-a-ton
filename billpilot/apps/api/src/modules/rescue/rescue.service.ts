import { Injectable, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SimulateFailureDto } from './rescue.dto';

@Injectable()
export class RescueService {
  constructor(private readonly prisma: PrismaService) {}

  async simulateFailure(dto: SimulateFailureDto) {
    throw new NotImplementedException('Payment rescue engine will be implemented by Person C');
  }

  async getMetrics() {
    return {
      recoveredAmount: '0.00',
      activeRetries: 0,
    };
  }
}
