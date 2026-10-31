import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ForecastsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCashFlow(months: number) {
    const list = await this.prisma.forecastSnapshot.findMany({
      orderBy: { month: 'desc' },
      take: months,
    });
    return { data: list };
  }
}
