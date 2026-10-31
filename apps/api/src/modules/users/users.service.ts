import { Injectable, ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CommonAuditService } from '../../common/audit/audit.service';
import { parsePagination, buildMeta, PaginationParams } from '../../common/pagination/pagination';
import { CreateStaffDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: CommonAuditService,
  ) {}

  async createStaff(dto: CreateStaffDto, creatorId: string) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const existing = await this.prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: normalizedEmail,
        phone: dto.phone,
        passwordHash,
        role: dto.role,
        createdById: creatorId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await this.audit.log({
      actor: { id: creatorId, role: 'ADMIN' },
      entity: 'User',
      entityId: user.id,
      action: 'STAFF_CREATED',
      after: { email: user.email, role: user.role },
    });

    return user;
  }

  async deleteStaff(id: string, actorId: string) {
    try {
      const deleted = await this.prisma.user.delete({ where: { id } });
      await this.audit.log({
        actor: { id: actorId, role: 'ADMIN' },
        entity: 'User',
        entityId: id,
        action: 'STAFF_DELETED',
      });
      return { success: true, deleted };
    } catch {
      const deactivated = await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
      return { success: true, deactivated };
    }
  }

  async findAll(params: PaginationParams & { role?: string }) {
    const { skip, take } = parsePagination(params);
    const where: any = {};
    if (params.role) where.role = params.role;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          phone: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: buildMeta(total, params),
    };
  }

  async findCustomers(params: PaginationParams) {
    const { skip, take } = parsePagination(params);
    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          subscriptions: {
            select: { id: true, status: true },
          },
        },
      }),
      this.prisma.customer.count(),
    ]);

    return {
      data: customers.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        gstin: c.gstin,
        currency: c.currency,
        creditBalance: c.creditBalance.toFixed(2),
        activeSubscriptionsCount: c.subscriptions.filter((s) => s.status === 'ACTIVE').length,
        createdAt: c.createdAt,
      })),
      meta: buildMeta(total, params),
    };
  }

  async createCustomer(
    dto: { name: string; email: string; phone?: string; company?: string; gstin?: string },
    creatorId: string,
  ) {
    const customer = await this.prisma.customer.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase().trim(),
        phone: dto.phone,
        company: dto.company,
        gstin: dto.gstin,
      },
    });

    await this.audit.log({
      actor: { id: creatorId, role: 'ADMIN' },
      entity: 'Customer',
      entityId: customer.id,
      action: 'CUSTOMER_CREATED',
      after: customer,
    });

    return customer;
  }

  async deleteCustomer(id: string, actorId: string) {
    try {
      const deleted = await this.prisma.customer.delete({ where: { id } });
      await this.audit.log({
        actor: { id: actorId, role: 'ADMIN' },
        entity: 'Customer',
        entityId: id,
        action: 'CUSTOMER_DELETED',
      });
      return { success: true, deleted };
    } catch (err: any) {
      return { success: false, message: 'Cannot delete customer with existing subscriptions or invoices' };
    }
  }
}
