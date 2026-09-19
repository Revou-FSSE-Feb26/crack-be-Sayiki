import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Unauthenticated Access to Guarded APIs (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Listings / Services (Not Logged In)', () => {
    it('POST /listings without login should return 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .post('/listings')
        .send({ title: 'Hacked Service', basePrice: 10000 });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('PATCH /listings/:id without login should return 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .patch('/listings/fake-service-id')
        .send({ title: 'Changed Price' });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('DELETE /listings/:id without login should return 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .delete('/listings/fake-service-id');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });
  });

  describe('2. Users Entity (Not Logged In)', () => {
    it('GET /users without login should return 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer()).get('/users');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('POST /users without login should return 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Hacker', email: 'hacker@test.com', password: '123' });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('PATCH /users/:id without login should return 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/some-user-id')
        .send({ name: 'Changed Name' });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('DELETE /users/:id without login should return 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .delete('/users/some-user-id');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });
  });

  describe('3. Modders / Portfolios (Not Logged In)', () => {
    it('POST /modders without login should return 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .post('/modders')
        .send({ title: 'Fake Portfolio Build' });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('PATCH /modders/:id without login should return 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .patch('/modders/fake-portfolio-id')
        .send({ title: 'Hacked Title' });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('DELETE /modders/:id without login should return 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .delete('/modders/fake-portfolio-id');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });
  });

  describe('4. Orders / Bookings (Not Logged In)', () => {
    it('GET /orders without login should return 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer()).get('/orders');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('POST /orders without login should return 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .post('/orders')
        .send({ totalPrice: 10000 });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('GET /orders/:id without login should return 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer()).get('/orders/fake-order-id');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('PATCH /orders/:id without login should return 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .patch('/orders/fake-order-id')
        .send({ status: 'SUCCESS' });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('DELETE /orders/:id without login should return 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer()).delete('/orders/fake-order-id');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });
  });
});
