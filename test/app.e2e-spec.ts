import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('/prices/last-24-hours (GET)', () => {
    return request(app.getHttpServer())
      .get('/prices/last-24-hours?chain=ethereum')
      .expect(200)
      .expect('Content-Type', /json/);
  });

  it('/alerts (POST)', () => {
    return request(app.getHttpServer())
      .post('/alerts')
      .send({ chain: 'ethereum', targetPrice: 2000, email: 'test@example.com' })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });
});
