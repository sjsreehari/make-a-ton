import { Injectable, NotFoundException } from '@nestjs/common';
import Decimal from 'decimal.js';
import { PrismaService } from '../../common/prisma/prisma.service';
import { round2 } from '../../common/money/money';
import { ProrationPreviewDto } from './proration.dto';

@Injectable()
export class ProrationService {
  constructor(private readonly prisma: PrismaService) {}

  async calculatePreview(dto: ProrationPreviewDto) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id: dto.subscriptionId },
      include: { plan: true },
    });

    if (!sub) throw new NotFoundException('Subscription not found');

    const targetPlan = await this.prisma.plan.findUnique({
      where: { id: dto.newPlanId },
    });

    if (!targetPlan) throw new NotFoundException('Target plan not found');

    const remainingDays = 15; // standard calculation window for demo
    const oldDailyRate = sub.plan.price.dividedBy(30);
    const newDailyRate = targetPlan.price.dividedBy(30);

    const unusedCredit = round2(oldDailyRate.times(remainingDays));
    const newCharge = round2(newDailyRate.times(remainingDays));
    const netPayable = round2(newCharge.minus(unusedCredit));

    return {
      currentPlan: { id: sub.plan.id, name: sub.plan.name, price: sub.plan.price.toFixed(2) },
      newPlan: { id: targetPlan.id, name: targetPlan.name, price: targetPlan.price.toFixed(2) },
      remainingDays,
      unusedCredit: unusedCredit.toFixed(2),
      newCharge: newCharge.toFixed(2),
      netPayable: netPayable.toFixed(2),
      isUpgrade: netPayable.gt(0),
    };
  }
}

