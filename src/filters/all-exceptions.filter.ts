import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';

type ErrorBody = {
  statusCode: number;
  message: string | string[];
  error?: string;
  path: string;
  method: string;
  timestamp: string;
  errorId?: string;
  details?: unknown;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const base: ErrorBody = {
        statusCode: status,
        message: exception.message,
        path: request.url,
        method: request.method,
        timestamp: new Date().toISOString(),
      };

      if (typeof res === 'string') {
        base.message = res;
      } else if (res && typeof res === 'object') {
        const anyRes = res as Record<string, unknown>;
        if (typeof anyRes.message !== 'undefined')
          base.message = anyRes.message as never;
        if (typeof anyRes.error === 'string') base.error = anyRes.error;
        const retryAfterSeconds = anyRes.retryAfterSeconds;
        if (
          typeof retryAfterSeconds === 'number' &&
          Number.isFinite(retryAfterSeconds)
        ) {
          base.details = { retryAfterSeconds };
        }
      }

      response.status(status).json(base);
      return;
    }

    const errorId = randomUUID();
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const includeDetails =
      (process.env.NODE_ENV ?? '').toLowerCase() !== 'production';

    let message = 'Internal server error';
    let details: unknown = undefined;

    if (exception instanceof Error) {
      if (includeDetails) {
        message = exception.message || message;
        details = {
          name: exception.name,
          stack: exception.stack,
        };
      }
      console.error(`[${errorId}]`, exception);
    } else {
      if (includeDetails) details = exception;
      console.error(`[${errorId}]`, exception);
    }

    const body: ErrorBody = {
      statusCode: status,
      message,
      error: 'Internal Server Error',
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      errorId,
      ...(includeDetails ? { details } : {}),
    };

    response.status(status).json(body);
  }
}
