import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

export interface PostgresDriverError {
  code?: string;
  detail?: string;
  table?: string;
  constraint?: string;
  message?: string;
}

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TypeOrmExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const driverError = ((exception as unknown as { driverError?: PostgresDriverError })
      .driverError || {}) as PostgresDriverError;
    const code = driverError.code || (exception as unknown as { code?: string }).code;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected database error occurred';
    let errorType = 'InternalServerError';

    switch (code) {
      case '23505': // unique_violation
        status = HttpStatus.CONFLICT;
        errorType = 'Conflict';
        message =
          driverError.detail ||
          (driverError.constraint
            ? `Unique constraint '${driverError.constraint}' violated`
            : 'Unique constraint violation: resource already exists');
        break;
      case '23503': // foreign_key_violation
        status = HttpStatus.CONFLICT;
        errorType = 'Conflict';
        message =
          driverError.detail ||
          (driverError.constraint
            ? `Foreign key constraint '${driverError.constraint}' violated`
            : 'Foreign key violation: referenced resource does not exist or is constrained');
        break;
      case '23514': // check_violation
        status = HttpStatus.CONFLICT;
        errorType = 'Conflict';
        message =
          driverError.detail ||
          (driverError.constraint
            ? `Database check constraint '${driverError.constraint}' violated`
            : 'Database check constraint violation');
        break;
      default:
        this.logger.error(
          `Unhandled Database Error [${code}]: ${exception.message}`,
          exception.stack,
        );
        return response.status(status).json({
          statusCode: status,
          error: errorType,
          message,
          timestamp: new Date().toISOString(),
        });
    }

    this.logger.warn(`Database constraint conflict [${code}]: ${message}`);

    return response.status(status).json({
      statusCode: status,
      error: errorType,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
