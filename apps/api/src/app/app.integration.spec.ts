import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './app.module';

describe('AppController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Endpoints', () => {
    it('/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
        });
    });

    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Hello API');
        });
    });
  });

  describe('Core Endpoints', () => {
    it('/saga-soa/alive (GET)', () => {
      return request(app.getHttpServer())
        .get('/saga-soa/alive')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            status: 'alive',
            sector: 'SAGA-SOA',
          });
        });
    });

    it('/saga-soa (GET) - should return ASCII art', () => {
      return request(app.getHttpServer())
        .get('/saga-soa')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toMatch(/^<pre>.*<\/pre>$/s);
        });
    });

    it('/saga-soa/:sector/alive (GET)', () => {
      return request(app.getHttpServer())
        .get('/saga-soa/TEST/alive')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            status: 'alive',
            sector: 'TEST',
          });
        });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', () => {
      return request(app.getHttpServer())
        .get('/non-existent-route')
        .expect(404);
    });

    it('should handle malformed requests gracefully', () => {
      return request(app.getHttpServer())
        .post('/saga-soa')
        .send('invalid json')
        .expect(404); // POST not allowed on this route
    });
  });

  describe('Users Endpoints (Without Database)', () => {
    it('/users (GET) - should handle database connection gracefully', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(500) // Expected to fail without database
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 500);
          expect(res.body).toHaveProperty('message');
        });
    });

    it('/users/stats (GET) - should handle database connection gracefully', () => {
      return request(app.getHttpServer())
        .get('/users/stats')
        .expect(500) // Expected to fail without database
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 500);
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should validate user creation data', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({}) // Empty body should trigger validation
        .expect(400) // Bad request due to validation
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body).toHaveProperty('message');
        });
    });
  });
});