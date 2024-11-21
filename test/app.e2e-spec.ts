import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('FXQL (e2e)', () => {
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

  it('/fxql-statements (POST) - should handle valid request', () => {
    return request(app.getHttpServer())
      .post('/fxql-statements')
      .send({
        FXQL: 'USD-GBP {\n BUY 0.85\n SELL 0.90\n CAP 10000\n}',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.code).toBe('FXQL-200');
        expect(res.body.data).toHaveLength(1);
      });
  });

  it('/fxql-statements (POST) - should enforce rate limiting', async () => {
    const promises = Array(101)
      .fill(null)
      .map(() =>
        request(app.getHttpServer()).post('/fxql-statements').send({
          FXQL: 'USD-GBP {\n BUY 0.85\n SELL 0.90\n CAP 10000\n}',
        }),
      );

    const results = await Promise.all(promises);
    console.log(results[100]);
    expect(results.some((res) => res.status === 429)).toBeTruthy();
  });
});
