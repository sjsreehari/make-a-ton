"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const app_module_1 = require("../../src/app.module");
const zod_validation_pipe_1 = require("../../src/common/pipes/zod-validation.pipe");
const http_exception_filter_1 = require("../../src/common/filters/http-exception.filter");
(0, vitest_1.describe)('Auth & RBAC (e2e)', () => {
    let app;
    (0, vitest_1.beforeAll)(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api/v1');
        app.useGlobalPipes(new zod_validation_pipe_1.ZodValidationPipe());
        app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
        await app.init();
    });
    (0, vitest_1.afterAll)(async () => {
        if (app) {
            await app.close();
        }
    });
    (0, vitest_1.it)('rejects signup with passwords shorter than 9 chars', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .post('/api/v1/auth/signup')
            .send({
            name: 'Short Pass User',
            email: 'shortpass@brightloop.test',
            password: 'Short1!',
        });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.error.code).toBe('VALIDATION_FAILED');
    });
    (0, vitest_1.it)('rejects signup with password missing special character', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .post('/api/v1/auth/signup')
            .send({
            name: 'No Special User',
            email: 'nospecial@brightloop.test',
            password: 'Password123',
        });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.error.code).toBe('VALIDATION_FAILED');
    });
    (0, vitest_1.it)('allows signup with valid email and password >= 9 chars with upper, lower, special', async () => {
        const uniqueEmail = `valid-${Date.now()}@brightloop.test`;
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .post('/api/v1/auth/signup')
            .send({
            name: 'Valid User',
            email: uniqueEmail,
            password: 'ValidPassword@123!',
        });
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body.user).toBeDefined();
        (0, vitest_1.expect)(res.body.user.email).toBe(uniqueEmail);
        (0, vitest_1.expect)(res.body.accessToken).toBeDefined();
        // Duplicate signup with same email must fail with 409
        const dupRes = await (0, supertest_1.default)(app.getHttpServer())
            .post('/api/v1/auth/signup')
            .send({
            name: 'Duplicate User',
            email: uniqueEmail,
            password: 'ValidPassword@123!',
        });
        (0, vitest_1.expect)(dupRes.status).toBe(409);
        (0, vitest_1.expect)(dupRes.body.error.code).toBe('CONFLICT');
    });
    (0, vitest_1.it)('logs in successfully with admin seed user', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
            email: 'admin@brightloop.test',
            password: 'Admin@12345!',
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.user.role).toBe('ADMIN');
        (0, vitest_1.expect)(res.body.accessToken).toBeDefined();
    });
});
//# sourceMappingURL=auth.e2e-spec.js.map