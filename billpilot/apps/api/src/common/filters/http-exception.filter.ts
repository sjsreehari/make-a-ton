import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ZodError } from 'zod';
import { AppError, ErrorCode } from '@billpilot/shared';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request.headers['x-request-id'] as string) || (request as any).requestId || 'unknown';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ErrorCode.INTERNAL;
    let message = 'Internal server error';
    let details: unknown = undefined;

    if (exception instanceof AppError) {
      status = exception.httpStatus;
      code = exception.code;
      message = exception.message;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        message = (resObj['message'] as string) || message;
        code = (resObj['code'] as string) || (resObj['error'] as string) || code;
        details = resObj['details'] || undefined;
      }

      if (status === 401) code = ErrorCode.UNAUTHENTICATED;
      else if (status === 403) code = ErrorCode.FORBIDDEN;
      else if (status === 404) code = ErrorCode.NOT_FOUND;
      else if (status === 409) code = ErrorCode.CONFLICT;
      else if (status === 422 || status === 400) code = ErrorCode.VALIDATION_FAILED;
      else if (status === 429) code = ErrorCode.RATE_LIMITED;
    } else if (exception instanceof ZodError) {
      status = 422;
      code = ErrorCode.VALIDATION_FAILED;
      message = 'Validation failed';
      details = exception.errors;
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    }

    response.status(status).json({
      error: {
        code,
        message,
        details,
        requestId,
      },
    });
  }
}
