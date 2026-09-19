import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';

describe('Guards Verification (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Public access: GET /listings should succeed without any token (200 OK)', async () => {
    const response = await request(app.getHttpServer()).get('/listings');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('2. Unauthenticated write: POST /listings without token should be blocked by JwtAuthGuard (401 Unauthorized)', async () => {
    const response = await request(app.getHttpServer())
      .post('/listings')
      .send({
        title: 'Unauthorized Switch Modding',
        description: 'Should fail',
        basePrice: 50000,
        category: 'SWITCH_MODS',
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('3. Invalid token: POST /listings with bogus token should be blocked by JwtAuthGuard (401 Unauthorized)', async () => {
    const response = await request(app.getHttpServer())
      .post('/listings')
      .set('Authorization', 'Bearer invalid.bogus.token')
      .send({
        title: 'Bogus Token Modding',
        description: 'Should fail',
        basePrice: 50000,
        category: 'SWITCH_MODS',
      });

    expect(response.status).toBe(401);
  });

  it('4. Insufficient role: POST /listings with CUSTOMER token should be blocked by RolesGuard (403 Forbidden)', async () => {
    // Generate a valid JWT token with CUSTOMER role
    const customerToken = jwtService.sign({
      sub: '48c8fc2d-d918-456c-80ea-662d8b17f120',
      email: 'adit@example.com',
      role: 'CUSTOMER',
    });

    const response = await request(app.getHttpServer())
      .post('/listings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        title: 'Customer Trying to Create Service',
        description: 'Should fail with 403',
        basePrice: 50000,
        category: 'SWITCH_MODS',
      });

    // Expect 403 Forbidden from RolesGuard
    expect(response.status).toBe(403);
    expect(response.body.message).toContain('Forbidden resource');
  });
});
