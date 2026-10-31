import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import Decimal from 'decimal.js';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CommonAuditService } from '../../common/audit/audit.service';
import { EventBusService } from '../../common/events/event-bus.service';
import { parsePagination, buildMeta, PaginationParams } from '../../common/pagination/pagination';
import {
  ISubscriptionService,
  SubscriptionDTO,
  Actor,
  SubscriptionStatus,
  DomainEvent,
  IllegalTransitionError,
} from '@billpilot/shared';
import { CreateSubscriptionDto, TransitionSubscriptionDto } from './subscriptions.dto';

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['QUOTATION', 'CLOSED'],
  QUOTATION: ['CONFIRMED', 'CLOSED'],
  CONFIRMED: ['ACTIVE', 'CLOSED'],
  ACTIVE: ['CLOSED'],
  CLOSED: [],
};

@Injectable()
export class SubscriptionsService implements ISubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: CommonAuditService,
    private readonly eventBus: EventBusService,
  ) {}

  async findAll(params: PaginationParams & { status?: string; customerId?: string }) {
    const { skip, take } = parsePagination(params);
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.customerId) where.customerId = params.customerId;

    const [subs, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, email: true, company: true } },
          plan: { select: { id: true, name: true, billingPeriod: true, price: true } },
          lines: true,
        },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    const data = subs.map((s) => ({
      id: s.id,
      number: s.number,
      customer: s.customer,
      plan: {
        id: s.plan.id,
        name: s.plan.name,
        billingPeriod: s.plan.billingPeriod,
        price: s.plan.price.toFixed(2),
      },
      status: s.status,
      startDate: s.startDate.toISOString(),
      expiryDate: s.expiryDate?.toISOString() || null,
      nextBillingDate: s.nextBillingDate?.toISOString() || null,
      isPaused: s.isPaused,
      pausedAt: s.pausedAt?.toISOString() || null,
      closedAt: s.closedAt?.toISOString() || null,
      paymentTerm: s.paymentTerm,
      lineCount: s.lines.length,
    }));

    return {
      data,
      meta: buildMeta(total, params),
    };
  }

  async findOne(id: string, customerId?: string) {
    const where: any = { id };
    if (customerId) where.customerId = customerId;

    const sub = await this.prisma.subscription.findFirst({
      where,
      include: {
        customer: true,
        plan: true,
        lines: true,
      },
    });

    if (!sub) {
      throw new NotFoundException(`Subscription not found: ${id}`);
    }

    return sub;
  }

  async create(dto: CreateSubscriptionDto, actor: Actor) {
    // Generate next number
    const count = await this.prisma.subscription.count();
    const number = `SUB-2026-${String(count + 1).padStart(6, '0')}`;

    const startDate = new Date(dto.startDate);
    const expiryDate = dto.expiryDate ? new Date(dto.expiryDate) : null;

    const sub = await this.prisma.subscription.create({
      data: {
        number,
        customerId: dto.customerId,
        planId: dto.planId,
        status: 'DRAFT',
        startDate,
        expiryDate,
        paymentTerm: dto.paymentTerm as any,
        templateId: dto.templateId,
        createdById: actor.id,
        lines: {
          create: dto.lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            description: l.description,
            quantity: l.quantity,
            unitPrice: new Decimal(l.unitPrice),
            taxRuleId: l.taxRuleId,
            amount: new Decimal(l.unitPrice).times(l.quantity),
          })),
        },
      },
      include: {
        plan: true,
        customer: true,
        lines: true,
      },
    });

    await this.audit.log({
      actor,
      entity: 'Subscription',
      entityId: sub.id,
      action: 'SUBSCRIPTION_CREATED',
      after: { id: sub.id, number: sub.number, status: sub.status },
    });

    return sub;
  }

  async transition(
    id: string,
    toStatus: SubscriptionStatus,
    actor: Actor,
    reason?: string,
  ): Promise<SubscriptionDTO> {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!sub) {
      throw new NotFoundException(`Subscription not found: ${id}`);
    }

    const currentStatus = sub.status as string;
    const allowed = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(toStatus)) {
      throw new IllegalTransitionError(currentStatus, toStatus);
    }

    // Business checks
    const updateData: any = { status: toStatus };

    if (toStatus === 'QUOTATION') {
      updateData.quotationValidUntil = new Date(Date.now() + 15 * 86400000);
    } else if (toStatus === 'CONFIRMED') {
      if (sub.quotationValidUntil && sub.quotationValidUntil < new Date()) {
        throw new ConflictException('Quotation has expired and cannot be confirmed');
      }
    } else if (toStatus === 'ACTIVE') {
      updateData.nextBillingDate = sub.startDate;
    } else if (toStatus === 'CLOSED') {
      updateData.closedAt = new Date();
      updateData.closeReason = reason || 'Manual close';
    }

    const updated = await this.prisma.subscription.update({
      where: { id },
      data: updateData,
    });

    await this.audit.log({
      actor,
      entity: 'Subscription',
      entityId: sub.id,
      action: `STATUS_TRANSITION_${toStatus}`,
      before: { status: currentStatus },
      after: { status: toStatus, reason },
    });

    if (toStatus === 'ACTIVE') {
      await this.eventBus.emit(DomainEvent.SUBSCRIPTION_ACTIVATED, {
        subscriptionId: sub.id,
        customerId: sub.customerId,
        number: sub.number,
        expiryDate: sub.expiryDate?.toISOString(),
      });
    } else if (toStatus === 'CLOSED') {
      await this.eventBus.emit(DomainEvent.SUBSCRIPTION_CLOSED, {
        subscriptionId: sub.id,
        customerId: sub.customerId,
        number: sub.number,
      });
    }

    return {
      id: updated.id,
      number: updated.number,
      customerId: updated.customerId,
      planId: updated.planId,
      status: updated.status,
      startDate: updated.startDate.toISOString(),
      isPaused: updated.isPaused,
      nextBillingDate: updated.nextBillingDate?.toISOString(),
    };
  }

  async pause(id: string, actor: Actor): Promise<SubscriptionDTO> {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!sub) throw new NotFoundException(`Subscription not found: ${id}`);
    if (sub.status !== 'ACTIVE') throw new BadRequestException('Only ACTIVE subscriptions can be paused');
    if (!sub.plan.pausable) throw new BadRequestException('Plan does not permit pausing');

    const updated = await this.prisma.subscription.update({
      where: { id },
      data: { isPaused: true, pausedAt: new Date() },
    });

    await this.audit.log({
      actor,
      entity: 'Subscription',
      entityId: id,
      action: 'SUBSCRIPTION_PAUSED',
    });

    return {
      id: updated.id,
      number: updated.number,
      customerId: updated.customerId,
      planId: updated.planId,
      status: updated.status,
      startDate: updated.startDate.toISOString(),
      isPaused: updated.isPaused,
      nextBillingDate: updated.nextBillingDate?.toISOString(),
    };
  }

  async resume(id: string, actor: Actor): Promise<SubscriptionDTO> {
    const sub = await this.prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw new NotFoundException(`Subscription not found: ${id}`);
    if (!sub.isPaused) throw new BadRequestException('Subscription is not paused');

    const updated = await this.prisma.subscription.update({
      where: { id },
      data: { isPaused: false, pausedAt: null },
    });

    await this.audit.log({
      actor,
      entity: 'Subscription',
      entityId: id,
      action: 'SUBSCRIPTION_RESUMED',
    });

    return {
      id: updated.id,
      number: updated.number,
      customerId: updated.customerId,
      planId: updated.planId,
      status: updated.status,
      startDate: updated.startDate.toISOString(),
      isPaused: updated.isPaused,
      nextBillingDate: updated.nextBillingDate?.toISOString(),
    };
  }

  async earlyClose(id: string, actor: Actor, reason: string): Promise<SubscriptionDTO> {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!sub) throw new NotFoundException(`Subscription not found: ${id}`);
    if (!sub.plan.closable) throw new BadRequestException('Plan does not permit early closure');

    return this.transition(id, 'CLOSED' as SubscriptionStatus, actor, reason);
  }

  async renew(id: string, actor: Actor): Promise<SubscriptionDTO> {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!sub) throw new NotFoundException(`Subscription not found: ${id}`);
    if (!sub.plan.renewable) throw new BadRequestException('Plan does not permit renewals');

    const currentExpiry = sub.expiryDate || new Date();
    const newExpiry = new Date(currentExpiry);

    switch (sub.plan.billingPeriod) {
      case 'DAILY': newExpiry.setDate(newExpiry.getDate() + 1); break;
      case 'WEEKLY': newExpiry.setDate(newExpiry.getDate() + 7); break;
      case 'MONTHLY': newExpiry.setMonth(newExpiry.getMonth() + 1); break;
      case 'YEARLY': newExpiry.setFullYear(newExpiry.getFullYear() + 1); break;
    }

    const updated = await this.prisma.subscription.update({
      where: { id },
      data: { expiryDate: newExpiry },
    });

    await this.audit.log({
      actor,
      entity: 'Subscription',
      entityId: id,
      action: 'SUBSCRIPTION_RENEWED',
      after: { expiryDate: newExpiry },
    });

    return {
      id: updated.id,
      number: updated.number,
      customerId: updated.customerId,
      planId: updated.planId,
      status: updated.status,
      startDate: updated.startDate.toISOString(),
      isPaused: updated.isPaused,
      nextBillingDate: updated.nextBillingDate?.toISOString(),
    };
  }

  async getBillable(
    asOf: Date,
    limit: number,
    cursor?: string,
  ): Promise<{ items: SubscriptionDTO[]; nextCursor?: string }> {
    const subs = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        isPaused: false,
        nextBillingDate: { lte: asOf },
      },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: 'asc' },
    });

    const hasMore = subs.length > limit;
    const items = (hasMore ? subs.slice(0, limit) : subs).map((s) => ({
      id: s.id,
      number: s.number,
      customerId: s.customerId,
      planId: s.planId,
      status: s.status,
      startDate: s.startDate.toISOString(),
      isPaused: s.isPaused,
      nextBillingDate: s.nextBillingDate?.toISOString(),
    }));

    return {
      items,
      nextCursor: hasMore ? subs[limit].id : undefined,
    };
  }
}

