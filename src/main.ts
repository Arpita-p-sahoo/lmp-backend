import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const toJsonValue = (value: unknown): JsonValue => {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
    return value;
  if (Array.isArray(value)) return value.map(toJsonValue);
  if (typeof value === 'object') {
    const out: Record<string, JsonValue> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = toJsonValue(v);
    }
    return out;
  }
  return `[${typeof value}]`;
};

const sanitize = (value: unknown): JsonValue => {
  const secrets = new Set([
    'password',
    'passwordHash',
    'accessToken',
    'refreshToken',
    'authorization',
    'cookie',
  ]);
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') {
    const out: Record<string, JsonValue> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (secrets.has(k)) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = sanitize(v);
      }
    }
    return out;
  }
  return toJsonValue(value);
};

const formatJson = (value: unknown, maxLen: number): string => {
  const json = JSON.stringify(sanitize(value));
  if (json.length <= maxLen) return json;
  return json.slice(0, maxLen) + '…';
};

@Injectable()
class HttpLoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const startedAt = Date.now();

    const requestIdHeader =
      (req.headers['x-request-id'] as string | undefined) ??
      (req.headers['x-correlation-id'] as string | undefined);
    const requestId = requestIdHeader ?? randomUUID();
    res.setHeader('x-request-id', requestId);

    const shouldLog =
      (process.env.LOG_HTTP ?? '').toLowerCase() === 'true' ||
      (process.env.NODE_ENV ?? '').toLowerCase() !== 'production';
    if (!shouldLog) return next.handle();

    const origin = req.headers.origin;
    const ip =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0] ??
      req.ip;

    const reqLine = [
      `[${requestId}]`,
      'REQ',
      req.method,
      req.originalUrl ?? req.url,
      `ip=${ip}`,
      origin ? `origin=${origin}` : undefined,
    ]
      .filter((v): v is string => typeof v === 'string' && v.length > 0)
      .join(' ');

    const body =
      req.body && Object.keys(req.body as Record<string, unknown>).length > 0
        ? formatJson(req.body, 2000)
        : '';
    console.log(reqLine);
    if (body) console.log(`[${requestId}] REQ body ${body}`);

    return next.handle().pipe(
      tap((data: unknown) => {
        const ms = Date.now() - startedAt;
        const status = res.statusCode;
        const resLine = `[${requestId}] RES ${status} ${ms}ms`;
        console.log(resLine);
        if (typeof data !== 'undefined') {
          console.log(`[${requestId}] RES body ${formatJson(data, 3000)}`);
        }
      }),
    );
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.enableShutdownHooks();
  const httpServer = app.getHttpAdapter().getInstance() as {
    set: (setting: string, value: unknown) => void;
  };
  httpServer.set('trust proxy', 1);

  // Security headers
  app.use(helmet());

  // All routes prefixed with /api
  app.setGlobalPrefix('api');

  // Auto-validate all request bodies
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown fields
      forbidNonWhitelisted: true,
      transform: true, // auto-convert types (string "1" → number 1)
    }),
  );

  app.useGlobalInterceptors(new HttpLoggerInterceptor());

  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS — allow Angular frontend
  const isProd = (process.env.NODE_ENV ?? '').toLowerCase() === 'production';
  const frontendUrl = configService.get<string>('frontendUrl');
  app.enableCors({
    origin: isProd ? (frontendUrl ? [frontendUrl] : true) : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'x-request-id',
      'x-correlation-id',
    ],
    exposedHeaders: ['x-request-id'],
  });

  const swaggerEnabled =
    (process.env.SWAGGER_ENABLED ?? '').toLowerCase() === 'true' || !isProd;
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('LastMinPrep API')
      .setDescription('Backend API for LastMinPrep platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = parseInt(process.env.PORT ?? '3333', 10);
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen(port, host);
  const baseHost = host === '0.0.0.0' ? 'localhost' : host;
  console.log(`Server running on http://${baseHost}:${port}`);
  if (swaggerEnabled)
    console.log(`API docs at http://${baseHost}:${port}/api/docs`);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
