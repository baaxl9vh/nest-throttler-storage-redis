import { NestApplication } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from './app/app.module';
import { AppService } from './app/app.service';
import { request } from './utils/http';

jest.setTimeout(20000);

describe('Test app for throttler storage redis', () => {
  let app: NestApplication;
  let module: TestingModule;

  const port = 3000;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.listen(port);
  });

  it('Should service to be defined', () => {
    const service = app.get(AppService);
    expect(service).toBeDefined();
  });

  it('GET / global rate limit, ttl = 10, limit = 5', async () => {
    const ret = await request(`http://localhost:${port}`);
    expect(ret.data).toEqual('hello world');
    expect(ret.headers).toMatchObject({
      'x-ratelimit-limit': '5',
      'x-ratelimit-remaining': '4',
      'x-ratelimit-reset': '0',
    });
  });

  it('GET /limit ttl = 5, limit = 2', async () => {
    const ret = await request(`http://localhost:${port}/limit`);
    expect(ret.data).toEqual('limit');
    expect(ret.headers).toMatchObject({
      'x-ratelimit-limit': '2',
      'x-ratelimit-remaining': '1',
      'x-ratelimit-reset': '0',
    });
  });

  it('GET /skip-throttle should skip limit', async () => {
    const ret = await request(`http://localhost:${port}/skip-throttle`);
    expect(ret.data).toEqual('skip throttle');
    expect(ret.headers).not.toMatchObject({
      'x-ratelimit-limit': '2',
      'x-ratelimit-remaining': '1',
      'x-ratelimit-reset': '0',
    });
  });

  it('GET / should skip by user-agent = npm-test-user-agent', async () => {
    const ret = await request(
      `http://localhost:${port}`,
      'npm-test-user-agent',
    );
    expect(ret.data).toEqual('hello world');
    expect(ret.headers).not.toMatchObject({
      'x-ratelimit-limit': '5',
      'x-ratelimit-remaining': '4',
      'x-ratelimit-reset': '0',
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
