import { Injectable, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePaylinkDto } from './paylinks.dto';

@Injectable()
export class PaylinksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaylinkDto) {
    throw new NotImplementedException('Razorpay payment link integration will be implemented by Person C');
  }

  async getForInvoice(invoiceId: string) {
    return this.prisma.paymentLink.findFirst({
      where: { invoiceId },
    });
  }
}
