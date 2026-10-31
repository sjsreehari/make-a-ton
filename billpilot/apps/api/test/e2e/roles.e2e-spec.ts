import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ZodValidationPipe } from '../../src/common/pipes/zod-validation.pipe';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

describe('Roles Guard (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let customerToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ZodValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    // Login admin
    const adminRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@brightloop.test', password: 'Admin@12345!' });
    adminToken = adminRes.body.accessToken;

    // Login customer
    const custRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'cust1@brightloop.test', password: 'Cust@12345!' });
    customerToken = custRes.body.accessToken;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('allows ADMIN to access @Roles(ADMIN) endpoints', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/ping')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('ADMIN');
  });

  it('denies CUSTOMER access to @Roles(ADMIN) endpoints with 403 Forbidden', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/ping')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
