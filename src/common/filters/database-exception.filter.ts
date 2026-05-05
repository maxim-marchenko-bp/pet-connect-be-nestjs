import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { QueryFailedError } from 'typeorm';
import { DatabaseErrorCode } from './database-error-code.enum';

@Catch()
export class DatabaseExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    if (exception instanceof QueryFailedError) {
      switch (exception.driverError?.code) {
        case DatabaseErrorCode.UNIQUE_CONSTRAINT:
          httpStatus = HttpStatus.CONFLICT;
          message = 'Duplicate value';
          break;

        case DatabaseErrorCode.FOREIGN_KEY:
          httpStatus = HttpStatus.BAD_REQUEST;
          message = 'Invalid reference';
          break;
      }
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      message =
        typeof response === 'string'
          ? response
          : (response as { message?: string }).message || message;
      httpStatus = exception.getStatus();
    }

    const responseBody = {
      message,
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
