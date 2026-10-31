import { Injectable, NotFoundException } from '@nestjs/common';
import Decimal from 'decimal.js';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CommonAuditService } from '../../common/audit/audit.service';
import { parsePagination, buildMeta, PaginationParams } from '../../common/pagination/pagination';
import {
  CreateProductDto,
  CreateVariantDto,
  CreatePlanDto,
  CreateQuotationTemplateDto,
} from './catalog.dto';

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: CommonAuditService,
  ) {}

  async findPlans(params: PaginationParams & { isActive?: boolean }) {
    const { skip, take } = parsePagination(params);
    const where: any = {};
    if (params.isActive !== undefined) where.isActive = params.isActive;

    const [plans, total] = await Promise.all([
      this.prisma.plan.findMany({
        where,
        skip,
        take,
        orderBy: { price: 'asc' },
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
      }),
      this.prisma.plan.count({ where }),
    ]);

    const data = plans.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price.toFixed(2),
      billingPeriod: p.billingPeriod,
      minQuantity: p.minQuantity,
      autoClose: p.autoClose,
      closable: p.closable,
      pausable: p.pausable,
      renewable: p.renewable,
      isActive: p.isActive,
      products: p.products.map((pp) => ({
        id: pp.product.id,
        name: pp.product.name,
        quantity: pp.quantity,
      })),
    }));

    return {
      data,
      meta: buildMeta(total, params),
    };
  }

  async findProducts(params: PaginationParams & { type?: string }) {
    const { skip, take } = parsePagination(params);
    const where: any = {};
    if (params.type) where.type = params.type;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: {
          variants: true,
          taxRule: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const data = products.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      salesPrice: p.salesPrice.toFixed(2),
      costPrice: p.costPrice.toFixed(2),
      notes: p.notes,
      isActive: p.isActive,
      taxRule: p.taxRule ? { id: p.taxRule.id, name: p.taxRule.name, ratePercent: p.taxRule.ratePercent.toString() } : null,
      variants: p.variants.map((v) => ({
        id: v.id,
        attribute: v.attribute,
        value: v.value,
        extraPrice: v.extraPrice.toFixed(2),
      })),
    }));

    return {
      data,
      meta: buildMeta(total, params),
    };
  }

  async createPlan(dto: CreatePlanDto, creatorId: string) {
    const plan = await this.prisma.plan.create({
      data: {
        name: dto.name,
        price: new Decimal(dto.price),
        billingPeriod: dto.billingPeriod as any,
        minQuantity: dto.minQuantity,
        autoClose: dto.autoClose,
        closable: dto.closable,
        pausable: dto.pausable,
        renewable: dto.renewable,
      },
    });

    await this.audit.log({
      actor: { id: creatorId, role: 'ADMIN' },
      entity: 'Plan',
      entityId: plan.id,
      action: 'PLAN_CREATED',
      after: plan,
    });

    return plan;
  }

  async deletePlan(id: string, actorId: string) {
    try {
      const deleted = await this.prisma.plan.delete({ where: { id } });
      await this.audit.log({
        actor: { id: actorId, role: 'ADMIN' },
        entity: 'Plan',
        entityId: id,
        action: 'PLAN_DELETED',
      });
      return { success: true, deleted };
    } catch {
      const deactivated = await this.prisma.plan.update({
        where: { id },
        data: { isActive: false },
      });
      return { success: true, deactivated };
    }
  }

  async createProduct(dto: CreateProductDto, creatorId: string) {
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        type: dto.type as any,
        salesPrice: new Decimal(dto.salesPrice),
        costPrice: new Decimal(dto.costPrice),
        notes: dto.notes,
        taxRuleId: dto.taxRuleId,
      },
    });

    await this.audit.log({
      actor: { id: creatorId, role: 'ADMIN' },
      entity: 'Product',
      entityId: product.id,
      action: 'PRODUCT_CREATED',
      after: product,
    });

    return product;
  }

  async deleteProduct(id: string, actorId: string) {
    try {
      const deleted = await this.prisma.product.delete({ where: { id } });
      await this.audit.log({
        actor: { id: actorId, role: 'ADMIN' },
        entity: 'Product',
        entityId: id,
        action: 'PRODUCT_DELETED',
      });
      return { success: true, deleted };
    } catch {
      const deactivated = await this.prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return { success: true, deactivated };
    }
  }

  async addVariant(dto: CreateVariantDto, creatorId: string) {
    const variant = await this.prisma.variant.create({
      data: {
        productId: dto.productId,
        attribute: dto.attribute,
        value: dto.value,
        extraPrice: new Decimal(dto.extraPrice),
      },
    });

    await this.audit.log({
      actor: { id: creatorId, role: 'ADMIN' },
      entity: 'Variant',
      entityId: variant.id,
      action: 'VARIANT_ADDED',
      after: variant,
    });

    return variant;
  }
}
