import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ZodValidationPipe } from '../../src/common/pipes/zod-validation.pipe';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

describe('Auth & RBAC (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ZodValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('rejects signup with passwords shorter than 9 chars', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/signup')
      .send({
        name: 'Short Pass User',
        email: 'shortpass@brightloop.test',
        password: 'Short1!',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('rejects signup with password missing special character', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/signup')
      .send({
        name: 'No Special User',
        email: 'nospecial@brightloop.test',
        password: 'Password123',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('allows signup with valid email and password >= 9 chars with upper, lower, special', async () => {
    const uniqueEmail = `valid-${Date.now()}@brightloop.test`;
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/signup')
      .send({
        name: 'Valid User',
        email: uniqueEmail,
        password: 'ValidPassword@123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(uniqueEmail);
    expect(res.body.accessToken).toBeDefined();

    // Duplicate signup with same email must fail with 409
    const dupRes = await request(app.getHttpServer())
      .post('/api/v1/auth/signup')
      .send({
        name: 'Duplicate User',
        email: uniqueEmail,
        password: 'ValidPassword@123!',
      });

    expect(dupRes.status).toBe(409);
    expect(dupRes.body.error.code).toBe('CONFLICT');
  });

  it('logs in successfully with admin seed user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@brightloop.test',
        password: 'Admin@12345!',
      });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('ADMIN');
    expect(res.body.accessToken).toBeDefined();
  });
});
