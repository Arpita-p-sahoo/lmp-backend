import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/filters/all-exceptions.filter';

jest.setTimeout(30000);

describe('App (e2e)', () => {
  let app: INestApplication;
  let httpServer: Parameters<typeof request>[0];

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.ENABLE_GEMINI = 'false';
    process.env.ENABLE_MAIL = 'false';
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
    process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';
    process.env.REDIS_HOST = '';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
    httpServer = app.getHttpServer() as unknown as Parameters<
      typeof request
    >[0];
  }, 30000);

  afterAll(async () => {
    if (app) await app.close();
  }, 30000);

  it('GET /api returns health', async () => {
    const res = await request(httpServer).get('/api').expect(200);
    const body = res.body as unknown as {
      ok: true;
      name: string;
      time: string;
    };
    expect(body).toMatchObject({ ok: true, name: 'lmp-backend' });
    expect(typeof body.time).toBe('string');
  });

  it('signup -> login -> create question -> list questions', async () => {
    const email = `e2e_${Date.now()}@example.com`;
    const password = 'testpass123';
    const name = 'E2E User';

    const signupRes = await request(httpServer)
      .post('/api/auth/signup')
      .send({ email, password, name })
      .expect(201);

    const signupBody = signupRes.body as unknown as {
      accessToken: string;
      user: { email: string; name: string };
    };
    expect(typeof signupBody.accessToken).toBe('string');
    expect(signupBody.user).toMatchObject({ email, name });

    const loginRes = await request(httpServer)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    const loginBody = loginRes.body as unknown as { accessToken: string };
    const accessToken = loginBody.accessToken;
    expect(typeof accessToken).toBe('string');

    const title = 'How to configure NestJS for production?';
    const techTag = 'nestjs';
    const createQuestionRes = await request(httpServer)
      .post('/api/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title, techTag, hashtags: ['backend'] })
      .expect(201);

    const createdQuestion = createQuestionRes.body as unknown as {
      id: string;
      title: string;
      techTag: string;
    };
    expect(createdQuestion).toMatchObject({ title, techTag });
    expect(typeof createdQuestion.id).toBe('string');
    const listRes = await request(httpServer).get('/api/questions').expect(200);
    const listBody = listRes.body as unknown as {
      data: Array<{ id: string }>;
    };
    expect(Array.isArray(listBody.data)).toBe(true);
    expect(listBody.data.some((q) => q.id === createdQuestion.id)).toBe(true);
  });
});
