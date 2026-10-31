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
(0, vitest_1.describe)('Roles Guard (e2e)', () => {
    let app;
    let adminToken;
    let customerToken;
    (0, vitest_1.beforeAll)(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api/v1');
        app.useGlobalPipes(new zod_validation_pipe_1.ZodValidationPipe());
        app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
        await app.init();
        // Login admin
        const adminRes = await (0, supertest_1.default)(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({ email: 'admin@brightloop.test', password: 'Admin@12345!' });
        adminToken = adminRes.body.accessToken;
        // Login customer
        const custRes = await (0, supertest_1.default)(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({ email: 'cust1@brightloop.test', password: 'Cust@12345!' });
        customerToken = custRes.body.accessToken;
    });
    (0, vitest_1.afterAll)(async () => {
        if (app) {
            await app.close();
        }
    });
    (0, vitest_1.it)('allows ADMIN to access @Roles(ADMIN) endpoints', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .get('/api/v1/admin/ping')
            .set('Authorization', `Bearer ${adminToken}`);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.role).toBe('ADMIN');
    });
    (0, vitest_1.it)('denies CUSTOMER access to @Roles(ADMIN) endpoints with 403 Forbidden', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .get('/api/v1/admin/ping')
            .set('Authorization', `Bearer ${customerToken}`);
        (0, vitest_1.expect)(res.status).toBe(403);
        (0, vitest_1.expect)(res.body.error.code).toBe('FORBIDDEN');
    });
});
//# sourceMappingURL=roles.e2e-spec.js.map