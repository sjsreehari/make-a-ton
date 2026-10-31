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
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
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
}
