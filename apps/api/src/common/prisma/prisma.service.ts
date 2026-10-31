import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to MySQL via Prisma');
    } catch (err: any) {
      this.logger.warn(`Database connection failed during init: ${err.message}. Routes requiring the database will recover once MySQL is available.`);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Disconnected from MySQL');
    } catch {
      // ignore disconnect errors
    }
  }
}
