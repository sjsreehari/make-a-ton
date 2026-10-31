import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';

import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { EventBusModule } from './common/events/event-bus.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

// Person A Modules
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { CatalogModule } from './modules/catalog';
import { SubscriptionsModule } from './modules/subscriptions';
import { ReportsModule } from './modules/reports';
import { AuditModule } from './modules/audit';

// Person B Modules
import { BillingModule } from './modules/billing';
import { DiscountsModule } from './modules/discounts';
import { ProrationModule } from './modules/proration';
import { TaxModule } from './modules/tax';
import { DisputesModule } from './modules/disputes';

// Person C Modules
import { PaymentsModule } from './modules/payments';
import { RescueModule } from './modules/rescue';
import { ReconcileModule } from './modules/reconcile';
import { PaylinksModule } from './modules/paylinks';
import { MandatesModule } from './modules/mandates';

// Person D Modules
import { NotificationsModule } from './modules/notifications';
import { WhatsappModule } from './modules/whatsapp';
import { InsightsModule } from './modules/insights';
import { AiModule } from './modules/ai';
import { ForecastsModule } from './modules/forecasts';

// Demo & Health
import { HealthController } from './modules/health/health.controller';
import { DevController } from './modules/dev/dev.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        throttlers: [{ ttl: 60000, limit: 10 }],
      }),
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('REDIS_URL', 'redis://localhost:6379'),
        },
      }),
    }),
    PrismaModule,
    RedisModule,
    EventBusModule,

    // A
    AuthModule,
    UsersModule,
    CatalogModule,
    SubscriptionsModule,
    ReportsModule,
    AuditModule,

    // B
    BillingModule,
    DiscountsModule,
    ProrationModule,
    TaxModule,
    DisputesModule,

    // C
    PaymentsModule,
    RescueModule,
    ReconcileModule,
    PaylinksModule,
    MandatesModule,

    // D
    NotificationsModule,
    WhatsappModule,
    InsightsModule,
    AiModule,
    ForecastsModule,
  ],
  controllers: [HealthController, DevController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

